package com.reqmgmt.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 字典数据实体
 */
@Data
@TableName("sys_dict_data")
public class SysDictData {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("dict_type_id")
    private Long dictTypeId;

    @TableField("dict_code")
    private String dictCode;

    @TableField("label")
    private String label;

    @TableField("value")
    private String value;

    @TableField("sort")
    private Integer sort;

    @TableField("status")
    private Integer status;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
