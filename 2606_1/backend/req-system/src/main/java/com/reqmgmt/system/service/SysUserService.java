package com.reqmgmt.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.reqmgmt.system.dto.LoginDTO;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.vo.LoginVO;
import com.reqmgmt.system.vo.UserInfoVO;

import java.util.List;

/**
 * 系统用户Service接口
 */
public interface SysUserService extends IService<SysUser> {

    /**
     * 根据用户名查询用户
     *
     * @param username 用户名
     * @return 用户信息
     */
    SysUser getByUsername(String username);

    /**
     * 用户登录
     *
     * @param loginDTO 登录信息
     * @return 登录结果（含token和用户信息）
     */
    LoginVO login(LoginDTO loginDTO);

    /**
     * 获取用户详情（含角色和权限）
     *
     * @param userId 用户ID
     * @return 用户信息VO
     */
    UserInfoVO getUserInfo(Long userId);

    /**
     * 根据用户ID获取角色ID
     *
     * @param userId 用户ID
     * @return 角色ID
     */
    Long getRoleIdByUserId(Long userId);

    /**
     * 根据角色ID获取角色标识
     *
     * @param roleId 角色ID
     * @return 角色标识
     */
    String getRoleKeyByRoleId(Long roleId);

    /**
     * 根据用户ID获取权限标识列表
     *
     * @param userId 用户ID
     * @return 权限标识列表
     */
    List<String> getPermissionKeysByUserId(Long userId);

    LoginVO buildLoginVO(SysUser user);
}
