package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 内容补充实体
 */
@Data
@TableName("requirement_supplement")
public class RequirementSupplement {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("req_type")
    private String reqType;

    @TableField("req_id")
    private Long reqId;

    @TableField("supplement_type")
    private String supplementType;

    @TableField("content")
    private String content;

    @TableField("attachment")
    private String attachment;

    @TableField("user_id")
    private Long userId;

    @TableField("user_name")
    private String userName;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
