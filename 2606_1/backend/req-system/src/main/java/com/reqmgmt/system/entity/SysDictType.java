package com.reqmgmt.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 字典类型实体
 */
@Data
@TableName("sys_dict_type")
public class SysDictType {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("dict_code")
    private String dictCode;

    @TableField("dict_name")
    private String dictName;

    @TableField("remark")
    private String remark;

    @TableField("status")
    private Integer status;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
