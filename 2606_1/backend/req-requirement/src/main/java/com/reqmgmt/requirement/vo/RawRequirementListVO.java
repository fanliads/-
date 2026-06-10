package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 原始需求列表VO
 */
@Data
public class RawRequirementListVO {

    private Long id;

    private String reqNo;

    private String title;

    private String description;

    private String source;

    private String proposer;

    private String projectName;

    private String reqLink;

    private String priority;

    private String systemLevel;

    private String effectiveLevel;

    private String strategyHint;

    private Integer overrideFlag;

    private String status;

    private String statusName;

    private String assigneeName;

    private String businessLineName;

    private String reqType;

    private LocalDateTime expectedDate;

    private Integer isNonFunctional;

    private String businessLine;

    private String registerName;

    private String productDefinition;

    private String productManager;

    private String projectManager;

    private Integer isUrgent;

    private String urgentReason;

    private java.time.LocalDate expectedOnlineDate;

    private String valueAssessment;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
