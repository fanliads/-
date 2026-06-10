package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 批量变更状态DTO
 */
@Data
public class BatchStatusDTO {

    @NotEmpty(message = "请选择需求")
    private List<Long> ids;

    @NotNull(message = "目标状态不能为空")
    private String targetStatus;

    private String remark;
}
