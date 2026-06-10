package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求评论实体
 */
@Data
@TableName("requirement_comment")
public class RequirementComment {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("req_type")
    private String reqType;

    @TableField("req_id")
    private Long reqId;

    @TableField("content")
    private String content;

    @TableField("parent_id")
    private Long parentId;

    @TableField("user_id")
    private Long userId;

    @TableField("user_name")
    private String userName;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
