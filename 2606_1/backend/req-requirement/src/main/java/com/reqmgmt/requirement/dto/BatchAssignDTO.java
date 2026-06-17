package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 批量指派DTO
 */
@Data
public class BatchAssignDTO {

    @NotEmpty(message = "请选择需求")
    private List<Long> ids;

    @NotNull(message = "指派人不能为空")
    private Long assigneeId;
}
