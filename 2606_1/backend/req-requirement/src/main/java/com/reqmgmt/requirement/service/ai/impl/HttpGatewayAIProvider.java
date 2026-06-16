package com.reqmgmt.requirement.service.ai.impl;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqmgmt.requirement.service.ai.AIProvider;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentPayload;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class HttpGatewayAIProvider implements AIProvider {

    private final ObjectMapper objectMapper;

    @Value("${ai.priority.enabled:false}")
    private boolean enabled;

    @Value("${ai.priority.gateway-url:}")
    private String gatewayUrl;

    @Value("${ai.priority.timeout-ms:5000}")
    private long timeoutMs;

    @Value("${ai.priority.provider-name:http-gateway}")
    private String providerName;

    @Value("${ai.priority.retry-max:1}")
    private int retryMax;

    @Override
    public PriorityAssessmentResult assessPriority(PriorityAssessmentPayload payload) {
        if (!enabled || StrUtil.isBlank(gatewayUrl)) {
            return PriorityAssessmentResult.builder()
                    .success(false)
                    .source(providerName)
                    .reason("AI网关未启用，已跳过外部评定")
                    .traceSummary("gateway_disabled")
                    .build();
        }

        int attempts = Math.max(1, retryMax + 1);
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                String body = objectMapper.writeValueAsString(payload);
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(gatewayUrl))
                        .timeout(Duration.ofMillis(timeoutMs))
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();
                HttpResponse<String> response = HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    if (attempt < attempts && isRetryableStatus(response.statusCode())) {
                        log.warn("AI网关响应异常，准备重试, reqId={}, attempt={}, status={}",
                                payload.getRequirementId(), attempt, response.statusCode());
                        continue;
                    }
                    return PriorityAssessmentResult.builder()
                            .success(false)
                            .source(providerName)
                            .reason("AI网关返回非成功状态")
                            .traceSummary("http_status=" + response.statusCode())
                            .build();
                }

                Map<String, Object> result = objectMapper.readValue(response.body(), new TypeReference<>() {});
                Object missingFields = result.get("missingFields");
                return PriorityAssessmentResult.builder()
                        .success(Boolean.TRUE.equals(result.get("success")) || result.get("priority") != null)
                        .priority((String) result.get("priority"))
                        .reason((String) result.getOrDefault("reason", ""))
                        .traceSummary((String) result.getOrDefault("traceSummary", response.body()))
                        .source((String) result.getOrDefault("source", providerName))
                        .missingFields(missingFields instanceof List<?> list ? list.stream().map(String::valueOf).toList() : List.of())
                        .build();
            } catch (HttpTimeoutException e) {
                if (attempt < attempts) {
                    log.warn("AI网关调用超时，准备重试, reqId={}, attempt={}, timeoutMs={}",
                            payload.getRequirementId(), attempt, timeoutMs);
                    continue;
                }
                return PriorityAssessmentResult.builder()
                        .success(false)
                        .source(providerName)
                        .reason("AI网关调用超时")
                        .traceSummary("timeout")
                        .build();
            } catch (Exception e) {
                if (attempt < attempts && isRetryableException(e)) {
                    log.warn("AI网关调用失败，准备重试, reqId={}, attempt={}, error={}",
                            payload.getRequirementId(), attempt, sanitizeExceptionMessage(e));
                    continue;
                }
                log.warn("AI优先级评定失败, reqId={}, provider={}, gateway={}, error={}",
                        payload.getRequirementId(), providerName, sanitizeUrl(gatewayUrl), sanitizeExceptionMessage(e));
                return PriorityAssessmentResult.builder()
                        .success(false)
                        .source(providerName)
                        .reason("AI网关调用失败")
                        .traceSummary(sanitizeExceptionMessage(e))
                        .build();
            }
        }

        return PriorityAssessmentResult.builder()
                .success(false)
                .source(providerName)
                .reason("AI网关调用失败")
                .traceSummary("retry_exhausted")
                .build();
    }

    private boolean isRetryableStatus(int statusCode) {
        return statusCode == 408 || statusCode == 429 || statusCode >= 500;
    }

    private boolean isRetryableException(Exception e) {
        return e instanceof java.io.IOException || e instanceof InterruptedException;
    }

    private String sanitizeExceptionMessage(Exception e) {
        return e.getClass().getSimpleName() + ": " + StrUtil.blankToDefault(e.getMessage(), "");
    }

    private String sanitizeUrl(String value) {
        if (StrUtil.isBlank(value)) {
            return "";
        }
        URI uri = URI.create(value);
        return uri.getScheme() + "://" + uri.getHost();
    }
}
