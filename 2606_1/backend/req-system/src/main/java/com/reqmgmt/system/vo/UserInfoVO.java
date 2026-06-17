package com.reqmgmt.system.vo;

import lombok.Data;

import java.util.List;

/**
 * 用户信息VO
 */
@Data
public class UserInfoVO {

    private Long id;

    private String username;

    private String realName;

    private String avatar;

    private Long roleId;

    private String roleName;

    private String roleKey;

    /**
     * 权限标识列表
     */
    private List<String> permissions;
}
