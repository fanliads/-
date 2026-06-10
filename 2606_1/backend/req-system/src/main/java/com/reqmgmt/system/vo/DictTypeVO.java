package com.reqmgmt.system.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 字典类型VO
 */
@Data
public class DictTypeVO {

    private Long id;

    private String dictCode;

    private String dictName;

    private String remark;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
