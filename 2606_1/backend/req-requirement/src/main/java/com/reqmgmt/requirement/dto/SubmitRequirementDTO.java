package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 提交新需求DTO
 */
@Data
public class SubmitRequirementDTO {

    @NotBlank(message = "需求标题不能为空")
    private String title;

    private String description;

    @NotBlank(message = "需求来源不能为空")
    private String source;

    private String submitOrigin;

    private String proposer;

    private String projectName;

    private String priority;

    private String businessLine;

    private String productDefinition;

    private String productManager;

    private String projectManager;
}
