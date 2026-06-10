package com.reqmgmt.requirement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 创建原始需求DTO
 */
@Data
public class RawRequirementCreateDTO {

    @NotBlank(message = "需求标题不能为空")
    private String title;

    private String description;

    private String source;

    private String proposer;

    private String proposerContact;

    private String projectName;

    private String reqLink;

    private String priority;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedDate;

    private String reqType;

    private String attachment;

    private String remark;

    private Long businessLineId;

    private String businessLine;

    private String registerName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate proposeTime;

    private String productDefinition;

    private String productManager;

    private String projectManager;

    private Integer isUrgent;

    private String urgentReason;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedOnlineDate;

    private String valueAssessment;

    private PriorityAssessmentContextDTO assessmentContext;
}
