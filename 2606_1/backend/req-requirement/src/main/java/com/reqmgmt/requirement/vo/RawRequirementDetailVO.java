package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 原始需求详情VO
 */
@Data
public class RawRequirementDetailVO {

    private Long id;

    private String reqNo;

    private String title;

    private String description;

    private String source;

    private String proposer;

    private String proposerContact;

    private String projectName;

    private String reqLink;

    private String priority;

    private String systemLevel;

    private String effectiveLevel;

    private String strategyHint;

    private String ruleHits;

    private String explanationSummary;

    private String missingFields;

    private Integer overrideFlag;

    private String overrideReason;

    private Long overrideBy;

    private LocalDateTime overrideTime;

    private String status;

    private String statusName;

    private Long assigneeId;

    private String assigneeName;

    private Long businessLineId;

    private String businessLineName;

    private String reqType;

    private LocalDateTime expectedDate;

    private String attachment;

    private String remark;

    private Integer isNonFunctional;

    private String businessLine;

    private String registerName;

    private java.time.LocalDate proposeTime;

    private String productDefinition;

    private String productManager;

    private String projectManager;

    private Integer isUrgent;

    private String urgentReason;

    private java.time.LocalDate expectedOnlineDate;

    private String valueAssessment;

    private String aiAssessmentContext;

    private String createByName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private List<SupplementVO> supplements;

    private List<ProductRequirementListVO> linkedProducts;

    private PriorityAssessmentVO latestPriorityAssessment;
}
