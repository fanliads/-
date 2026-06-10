package com.reqmgmt.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

/**
 * 系统权限实体
 */
@Data
@TableName("sys_permission")
public class SysPermission {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("permission_name")
    private String permissionName;

    @TableField("permission_key")
    private String permissionKey;

    @TableField("route_path")
    private String routePath;

    /**
     * 类型：menu-菜单，button-按钮
     */
    @TableField("type")
    private String type;

    @TableField("parent_id")
    private Long parentId;

    @TableField("order_num")
    private Integer orderNum;

    @TableField("status")
    private Integer status;
}
