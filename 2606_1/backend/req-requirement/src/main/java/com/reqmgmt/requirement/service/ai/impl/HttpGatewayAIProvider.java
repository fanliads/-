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
        } catch (Exception e) {
            log.warn("AI优先级评定失败, reqId={}", payload.getRequirementId(), e);
            return PriorityAssessmentResult.builder()
                    .success(false)
                    .source(providerName)
                    .reason("AI网关调用失败")
                    .traceSummary(e.getClass().getSimpleName() + ": " + e.getMessage())
                    .build();
        }
    }
}
