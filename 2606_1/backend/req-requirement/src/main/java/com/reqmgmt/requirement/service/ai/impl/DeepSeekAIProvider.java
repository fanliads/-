package com.reqmgmt.requirement.service.ai.impl;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqmgmt.requirement.service.ai.AIProvider;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentPayload;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Primary
@Component
@RequiredArgsConstructor
public class DeepSeekAIProvider implements AIProvider {

    private final ObjectMapper objectMapper;

    @Value("${ai.priority.enabled:false}")
    private boolean enabled;

    @Value("${ai.priority.base-url:https://api.deepseek.com}")
    private String baseUrl;

    @Value("${ai.priority.api-key:}")
    private String apiKey;

    @Value("${ai.priority.model:deepseek-v4-flash}")
    private String model;

    @Value("${ai.priority.timeout-ms:5000}")
    private long timeoutMs;

    @Value("${ai.priority.max-tokens:800}")
    private int maxTokens;

    @Override
    public PriorityAssessmentResult assessPriority(PriorityAssessmentPayload payload) {
        if (!enabled || StrUtil.isBlank(apiKey)) {
            return PriorityAssessmentResult.builder()
                    .success(false)
                    .source("deepseek")
                    .reason("DeepSeek 未启用，已跳过解释增强")
                    .traceSummary("deepseek_disabled")
                    .build();
        }

        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.put("messages", List.of(
                    Map.of("role", "system", "content", "你是需求分级解释助手。不要修改系统分级，只输出JSON。"),
                    Map.of("role", "user", "content", buildPrompt(payload))
            ));
            body.put("response_format", Map.of("type", "json_object"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizeUrl(baseUrl) + "/chat/completions"))
                    .timeout(Duration.ofMillis(timeoutMs))
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return PriorityAssessmentResult.builder()
                        .success(false)
                        .source("deepseek")
                        .reason("DeepSeek 返回非成功状态")
                        .traceSummary("http_status=" + response.statusCode())
                        .build();
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            Map<String, Object> result = objectMapper.readValue(content, new TypeReference<>() {});
            Object missingFields = result.get("missingFields");
            return PriorityAssessmentResult.builder()
                    .success(true)
                    .priority(payload.getCurrentLevel())
                    .reason(String.valueOf(result.getOrDefault("summary", "")))
                    .traceSummary(String.valueOf(result.getOrDefault("traceSummary", "")))
                    .source("deepseek")
                    .rawTraceId(root.path("id").asText(""))
                    .missingFields(missingFields instanceof List<?> list ? list.stream().map(String::valueOf).toList() : List.of())
                    .build();
        } catch (Exception e) {
            log.warn("DeepSeek 解释增强失败, reqId={}", payload.getRequirementId(), e);
            return PriorityAssessmentResult.builder()
                    .success(false)
                    .source("deepseek")
                    .reason("DeepSeek 调用失败")
                    .traceSummary(e.getClass().getSimpleName() + ": " + e.getMessage())
                    .build();
        }
    }

    private String buildPrompt(PriorityAssessmentPayload payload) throws Exception {
        return """
                请根据系统判定结果输出 JSON：
                {
                  "summary": "100字内中文说明，包含命中规则、业务影响和处理建议",
                  "missingFields": ["字段名"],
                  "traceSummary": "简短trace"
                }
                不要改动系统等级，也不要输出额外字段。

                当前等级：%s
                当前等级表意：%s
                处理策略：%s
                命中规则：%s
                规则文本：%s
                需求标题：%s
                需求描述：%s
                业务上下文：%s
                """.formatted(
                StrUtil.blankToDefault(payload.getCurrentLevel(), "-"),
                StrUtil.blankToDefault(payload.getCurrentLevelLabel(), "-"),
                StrUtil.blankToDefault(payload.getStrategyHint(), "-"),
                payload.getRuleHits() != null ? String.join("；", payload.getRuleHits()) : "-",
                StrUtil.blankToDefault(payload.getRulesText(), "-"),
                StrUtil.blankToDefault(payload.getTitle(), "-"),
                StrUtil.blankToDefault(payload.getDescription(), "-"),
                objectMapper.writeValueAsString(payload.getContext())
        );
    }

    private String normalizeUrl(String value) {
        return value != null && value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
