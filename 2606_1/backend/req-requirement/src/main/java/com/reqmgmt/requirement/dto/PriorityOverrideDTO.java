package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PriorityOverrideDTO {

    @NotBlank(message = "生效等级不能为空")
    private String effectiveLevel;

    @NotBlank(message = "覆盖原因不能为空")
    private String overrideReason;
}
