package com.reqmgmt.system.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 字典数据VO
 */
@Data
public class DictDataVO {

    private Long id;

    private Long dictTypeId;

    private String dictCode;

    private String label;

    private String value;

    private Integer sort;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
