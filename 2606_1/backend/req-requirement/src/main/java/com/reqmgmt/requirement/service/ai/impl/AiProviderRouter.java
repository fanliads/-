package com.reqmgmt.requirement.service.ai.impl;

import com.reqmgmt.requirement.service.ai.AIProvider;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentPayload;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Primary
@Component
@RequiredArgsConstructor
public class AiProviderRouter implements AIProvider {

    private final DeepSeekAIProvider deepSeekAIProvider;
    private final HttpGatewayAIProvider httpGatewayAIProvider;

    @Value("${ai.priority.provider:deepseek}")
    private String provider;

    @Override
    public PriorityAssessmentResult assessPriority(PriorityAssessmentPayload payload) {
        String normalized = provider == null ? "deepseek" : provider.trim().toLowerCase();
        return switch (normalized) {
            case "gateway", "http-gateway" -> httpGatewayAIProvider.assessPriority(payload);
            case "deepseek" -> deepSeekAIProvider.assessPriority(payload);
            case "auto" -> assessAuto(payload);
            default -> deepSeekAIProvider.assessPriority(payload);
        };
    }

    private PriorityAssessmentResult assessAuto(PriorityAssessmentPayload payload) {
        PriorityAssessmentResult deepSeekResult = deepSeekAIProvider.assessPriority(payload);
        if (deepSeekResult != null && deepSeekResult.isSuccess()) {
            return deepSeekResult;
        }
        PriorityAssessmentResult gatewayResult = httpGatewayAIProvider.assessPriority(payload);
        if (gatewayResult != null && gatewayResult.isSuccess()) {
            return gatewayResult;
        }
        return deepSeekResult != null ? deepSeekResult : gatewayResult;
    }
}
