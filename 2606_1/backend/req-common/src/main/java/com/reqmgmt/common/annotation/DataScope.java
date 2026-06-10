package com.reqmgmt.common.annotation;

import java.lang.annotation.*;

/**
 * 数据权限注解
 * 标注在Service方法上，根据角色决定数据可见范围
 * product_manager: 只看自己负责的需求
 * product_leader: 看本业务线的需求
 * product_director/pm/admin: 看所有
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataScope {
}
