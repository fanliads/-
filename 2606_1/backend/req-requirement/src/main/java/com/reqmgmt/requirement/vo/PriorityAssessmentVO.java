package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PriorityAssessmentVO {

    private String priority;
    private String priorityLabel;
    private String systemLevel;
    private String systemLevelLabel;
    private String effectiveLevel;
    private String effectiveLevelLabel;
    private String strategyHint;
    private List<String> ruleHits;
    private String reason;
    private String traceSummary;
    private String source;
    private Boolean success;
    private List<String> missingFields;
    private Boolean overrideFlag;
    private String overrideReason;
    private String overrideBy;
    private LocalDateTime overrideTime;
    private LocalDateTime assessedAt;
}
