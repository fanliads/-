package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 状态流转配置实体
 */
@Data
@TableName("status_flow_config")
public class StatusFlowConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 需求类型：raw/product
     */
    @TableField("req_type")
    private String reqType;

    /**
     * 来源状态
     */
    @TableField("from_status")
    private String fromStatus;

    /**
     * 目标状态
     */
    @TableField("to_status")
    private String toStatus;

    /**
     * 允许操作的角色，逗号分隔
     */
    @TableField("allowed_roles")
    private String allowedRoles;

    /**
     * 是否需要审批：0-否 1-是
     */
    @TableField("need_approval")
    private Integer needApproval;

    /**
     * 操作名称
     */
    @TableField("action_name")
    private String actionName;

    /**
     * 排序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 状态：0-禁用 1-启用
     */
    @TableField("status")
    private Integer status;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
