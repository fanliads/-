package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求日志实体
 */
@Data
@TableName("requirement_log")
public class RequirementLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("req_type")
    private String reqType;

    @TableField("req_id")
    private Long reqId;

    @TableField("operator_id")
    private Long operatorId;

    @TableField("operator_name")
    private String operatorName;

    @TableField("action")
    private String action;

    @TableField("field_name")
    private String fieldName;

    @TableField("old_value")
    private String oldValue;

    @TableField("new_value")
    private String newValue;

    @TableField("remark")
    private String remark;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
