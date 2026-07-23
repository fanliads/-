package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @Size(max = 20000, message = "需求描述不能超过20000个字符")
    private String description;

    @Pattern(regexp = "^$|^P[0-3]$", message = "优先级必须为P0至P3")
    private String priority;

    private Long businessLineId;

    @Size(max = 100, message = "功能模块不能超过100个字符")
    private String productModule;

    @Size(max = 64, message = "需求类型不能超过64个字符")
    private String reqType;

    private Long sprintId;

    private String workload;

    private Long rawReqId;

    private LocalDate expectedDate;

    @Pattern(regexp = "^$|^https?://[^\\s]+$", message = "PRD地址格式不正确")
    @Size(max = 500, message = "PRD地址不能超过500个字符")
    private String prdUrl;

    @Size(max = 100, message = "处理人不能超过100个字符")
    private String handler;

    private String creator;

    private Integer isDirect;

    @Pattern(regexp = "^$|^(backlog|researching|pending_design|designing|developing|testing|online|accepted|rejected|suspended|closed)$", message = "产品需求状态不合法")
    private String status;
}
