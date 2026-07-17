package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * 创建产品需求DTO
 */
@Data
public class ProductRequirementCreateDTO {

    @Size(max = 64)
    private String clientRequestId;

    @NotBlank(message = "需求标题不能为空")
    @Size(max = 200, message = "需求标题不能超过200个字符")
    private String title;

    private String description;

    private String priority;

    private Long businessLineId;

    private String productModule;

    private String reqType;

    private Long sprintId;

    private String workload;

    private Long rawReqId;

    private LocalDate expectedDate;

    private String prdUrl;

    private String handler;

    private String creator;

    private Integer isDirect;

    private String status;
}
