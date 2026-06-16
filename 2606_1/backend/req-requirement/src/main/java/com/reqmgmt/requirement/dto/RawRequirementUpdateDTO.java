package com.reqmgmt.requirement.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 更新原始需求DTO（所有字段可选）
 */
@Data
public class RawRequirementUpdateDTO {

    private String title;

    private String description;

    private String source;

    private String submitOrigin;

    private String proposer;

    private String proposerContact;

    private String projectName;

    private String reqLink;

    private String priority;

    private LocalDate expectedDate;

    private String reqType;

    private String attachment;

    private String remark;

    private Long businessLineId;

    private String businessLine;

    private String registerName;

    private LocalDate proposeTime;

    private String productDefinition;

    private String productManager;

    private String projectManager;

    private Integer isUrgent;

    private String urgentReason;

    private LocalDate expectedOnlineDate;

    private String valueAssessment;

    private PriorityAssessmentContextDTO assessmentContext;

    private Long assigneeId;

    private String status;
}
