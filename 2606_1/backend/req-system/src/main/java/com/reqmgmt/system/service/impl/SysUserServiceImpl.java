package com.reqmgmt.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.JwtUtils;
import com.reqmgmt.system.dto.LoginDTO;
import com.reqmgmt.system.entity.SysRole;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.mapper.SysPermissionMapper;
import com.reqmgmt.system.mapper.SysRoleMapper;
import com.reqmgmt.system.mapper.SysUserMapper;
import com.reqmgmt.system.service.SysUserService;
import com.reqmgmt.system.vo.LoginVO;
import com.reqmgmt.system.vo.UserInfoVO;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 系统用户Service实现类
 */
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    private final SysRoleMapper sysRoleMapper;
    private final SysPermissionMapper sysPermissionMapper;
    private final JwtUtils jwtUtils;

    @Lazy
    private final PasswordEncoder passwordEncoder;

    @Override
    public SysUser getByUsername(String username) {
        return getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username));
    }

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        // 1. 查询用户
        SysUser user = getByUsername(loginDTO.getUsername());
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }

        // 2. 检查用户状态
        if (user.getStatus() != null && user.getStatus() != 1) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "该账号已被禁用");
        }

        // 3. 验证密码
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }

        return buildLoginVO(user);
    }

    @Override
    public UserInfoVO getUserInfo(Long userId) {
        SysUser user = getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "用户不存在");
        }

        Long roleId = user.getRoleId();
        String roleKey = getRoleKeyByRoleId(roleId);
        List<String> permissions = getPermissionKeysByUserId(userId);

        return buildUserInfoVO(user, roleId, roleKey, permissions);
    }

    @Override
    public Long getRoleIdByUserId(Long userId) {
        SysUser user = getById(userId);
        return user != null ? user.getRoleId() : null;
    }

    @Override
    public String getRoleKeyByRoleId(Long roleId) {
        if (roleId == null) {
            return null;
        }
        SysRole role = sysRoleMapper.selectById(roleId);
        return role != null ? role.getRoleKey() : null;
    }

    @Override
    public List<String> getPermissionKeysByUserId(Long userId) {
        SysUser user = getById(userId);
        if (user == null || user.getRoleId() == null) {
            return List.of();
        }
        return sysPermissionMapper.selectPermissionKeysByRoleId(user.getRoleId());
    }

    @Override
    public LoginVO buildLoginVO(SysUser user) {
        Long roleId = user.getRoleId();
        String roleKey = getRoleKeyByRoleId(roleId);
        List<String> permissions = getPermissionKeysByUserId(user.getId());
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleId, roleKey);

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUserInfo(buildUserInfoVO(user, roleId, roleKey, permissions));
        return loginVO;
    }

    /**
     * 构建用户信息VO
     */
    private UserInfoVO buildUserInfoVO(SysUser user, Long roleId, String roleKey, List<String> permissions) {
        UserInfoVO vo = new UserInfoVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setAvatar(user.getAvatar());
        vo.setRoleId(roleId);

        // 获取角色名称
        if (roleId != null) {
            SysRole role = sysRoleMapper.selectById(roleId);
            if (role != null) {
                vo.setRoleName(role.getRoleName());
            }
        }

        vo.setRoleKey(roleKey);
        vo.setPermissions(permissions);
        return vo;
    }
}
