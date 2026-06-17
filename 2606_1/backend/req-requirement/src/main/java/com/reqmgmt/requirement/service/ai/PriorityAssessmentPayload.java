package com.reqmgmt.requirement.service.ai;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PriorityAssessmentPayload {

    private Long requirementId;
    private String title;
    private String description;
    private String source;
    private String businessLine;
    private String expectedOnlineDate;
    private String currentLevel;
    private String currentLevelLabel;
    private String strategyHint;
    private Map<String, Object> context;
    private java.util.List<String> ruleHits;
    private String rulesText;
}
