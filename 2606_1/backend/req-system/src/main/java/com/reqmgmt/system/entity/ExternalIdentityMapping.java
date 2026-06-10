package com.reqmgmt.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("external_identity_mapping")
public class ExternalIdentityMapping {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("provider")
    private String provider;

    @TableField("external_user_id")
    private String externalUserId;

    @TableField("external_union_id")
    private String externalUnionId;

    @TableField("external_name")
    private String externalName;

    @TableField("status")
    private Integer status;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
