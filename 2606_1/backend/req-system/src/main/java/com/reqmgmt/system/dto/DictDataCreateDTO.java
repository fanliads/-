package com.reqmgmt.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 字典数据创建DTO
 */
@Data
public class DictDataCreateDTO {

    @NotBlank(message = "字典编码不能为空")
    private String dictCode;

    @NotBlank(message = "显示标签不能为空")
    private String label;

    @NotBlank(message = "存储值不能为空")
    private String value;

    private Integer sort;

    private Integer status;
}
