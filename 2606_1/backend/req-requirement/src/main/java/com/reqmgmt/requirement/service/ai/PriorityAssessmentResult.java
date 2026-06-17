package com.reqmgmt.requirement.service.ai;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PriorityAssessmentResult {

    private boolean success;
    private String priority;
    private String reason;
    private String traceSummary;
    private String source;
    private List<String> missingFields;
    private String rawTraceId;
}
