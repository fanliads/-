package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求关联实体
 */
@Data
@TableName("requirement_relation")
public class RequirementRelation {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("source_type")
    private String sourceType;

    @TableField("source_id")
    private Long sourceId;

    @TableField("target_type")
    private String targetType;

    @TableField("target_id")
    private Long targetId;

    @TableField("relation_type")
    private String relationType;

    @TableField("create_by")
    private Long createBy;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
