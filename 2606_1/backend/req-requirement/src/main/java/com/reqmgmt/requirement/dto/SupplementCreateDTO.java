package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 创建补充内容DTO
 */
@Data
public class SupplementCreateDTO {

    @NotBlank(message = "补充类型不能为空")
    private String supplementType;

    @NotBlank(message = "补充内容不能为空")
    private String content;

    private String attachment;
}
