package com.reqmgmt.requirement.service.ai;

public interface AIProvider {

    PriorityAssessmentResult assessPriority(PriorityAssessmentPayload payload);
}
