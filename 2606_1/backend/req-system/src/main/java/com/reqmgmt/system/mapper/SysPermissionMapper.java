package com.reqmgmt.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.system.entity.SysPermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 系统权限Mapper接口
 */
@Mapper
public interface SysPermissionMapper extends BaseMapper<SysPermission> {

    /**
     * 根据角色ID查询权限标识列表
     *
     * @param roleId 角色ID
     * @return 权限标识列表
     */
    @Select("SELECT p.permission_key FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.status = 1")
    List<String> selectPermissionKeysByRoleId(@Param("roleId") Long roleId);
}
