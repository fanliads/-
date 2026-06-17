package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 执行审批/流转操作DTO
 */
@Data
public class ExecuteActionDTO {

    @NotBlank(message = "需求类型不能为空")
    private String reqType;

    @NotNull(message = "需求ID不能为空")
    private Long reqId;

    @NotBlank(message = "目标状态不能为空")
    private String toStatus;

    private String remark;
}
