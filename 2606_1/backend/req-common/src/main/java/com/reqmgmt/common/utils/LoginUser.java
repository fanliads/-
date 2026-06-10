package com.reqmgmt.common.utils;

import lombok.Data;

import java.util.List;

/**
 * 当前登录用户信息
 * 存储在SecurityContext中的用户主体
 */
@Data
public class LoginUser {

    private Long userId;

    private String username;

    private Long roleId;

    private String roleKey;

    private List<String> permissions;

    public LoginUser() {
    }

    public LoginUser(Long userId, String username, Long roleId, String roleKey, List<String> permissions) {
        this.userId = userId;
        this.username = username;
        this.roleId = roleId;
        this.roleKey = roleKey;
        this.permissions = permissions;
    }
}
