package com.reqmgmt.common.aspect;

import com.reqmgmt.common.annotation.RequirePermission;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.LoginUser;
import com.reqmgmt.common.utils.SecurityUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 权限校验切面
 * 拦截@RequirePermission注解，校验当前用户是否拥有所需权限
 */
@Aspect
@Component
public class PermissionAspect {

    @Around("@annotation(requirePermission)")
    public Object around(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) throws Throwable {
        String requiredPermission = requirePermission.value();
        LoginUser loginUser = SecurityUtils.getLoginUser();

        if (loginUser == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "未登录或登录已过期");
        }

        List<String> permissions = loginUser.getPermissions();
        if (permissions == null || !permissions.contains(requiredPermission)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "缺少权限: " + requiredPermission);
        }

        return joinPoint.proceed();
    }
}
