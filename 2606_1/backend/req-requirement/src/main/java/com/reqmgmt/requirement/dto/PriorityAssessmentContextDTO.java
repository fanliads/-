package com.reqmgmt.requirement.dto;

import lombok.Data;

@Data
public class PriorityAssessmentContextDTO {

    private String projectName;
    private String customerName;
    private String contractNo;
    private String contractAmount;
    private String deliveryRisk;
    private String paymentRisk;
    private String acceptanceRisk;
    private String securityOrComplianceRisk;
    private String majorIncidentRisk;
    private String govSupervision;
    private String strategicCustomer;
    private String coreProductLine;
    private String projectType;
    private String reusability;
    private String benchmarkCase;
    private String contractScope;
    private String rigidDeliveryDate;
    private String estimatedWorkload;
    private String businessOwner;
    private String expectedOnlineTime;
    private String specialRemark;
}
