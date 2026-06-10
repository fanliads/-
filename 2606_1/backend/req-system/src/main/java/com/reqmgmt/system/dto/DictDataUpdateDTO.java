package com.reqmgmt.system.dto;

import lombok.Data;

/**
 * 字典数据更新DTO
 */
@Data
public class DictDataUpdateDTO {

    private String label;

    private String value;

    private Integer sort;

    private Integer status;
}
