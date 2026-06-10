package com.reqmgmt.common.annotation;

import java.lang.annotation.*;

/**
 * 权限校验注解
 * 标注在Controller方法上，校验当前用户是否拥有指定权限
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequirePermission {

    /**
     * 权限标识
     */
    String value();
}
