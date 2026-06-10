package com.reqmgmt.common.aspect;

import com.reqmgmt.common.annotation.DataScope;
import com.reqmgmt.common.utils.SecurityUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * 数据权限切面
 * 根据角色决定数据可见范围
 * product_manager: 只看自己负责的需求
 * product_leader: 看本业务线的需求
 * product_director/pm/admin: 看所有
 */
@Aspect
@Component
public class DataScopeAspect {

    @Around("@annotation(dataScope)")
    public Object around(ProceedingJoinPoint joinPoint, DataScope dataScope) throws Throwable {
        String roleKey = SecurityUtils.getCurrentRoleKey();
        Long userId = SecurityUtils.getCurrentUserId();

        DataScopeType scopeType = getDataScopeType(roleKey);

        // 将数据权限上下文存入ThreadLocal，供后续查询使用
        DataScopeHolder.setScope(scopeType, userId);

        try {
            return joinPoint.proceed();
        } finally {
            DataScopeHolder.clear();
        }
    }

    private DataScopeType getDataScopeType(String roleKey) {
        if (roleKey == null) {
            return DataScopeType.ALL;
        }
        return switch (roleKey) {
            case "product_manager" -> DataScopeType.SELF;
            case "product_leader" -> DataScopeType.BUSINESS_LINE;
            case "product_director", "pm", "admin" -> DataScopeType.ALL;
            default -> DataScopeType.ALL;
        };
    }

    /**
     * 数据权限范围枚举
     */
    public enum DataScopeType {
        /** 查看所有数据 */
        ALL,
        /** 查看本业务线数据 */
        BUSINESS_LINE,
        /** 仅查看自己负责的数据 */
        SELF
    }

    /**
     * 数据权限上下文
     */
    public static class DataScopeContext {
        private final DataScopeType type;
        private final Long userId;

        public DataScopeContext(DataScopeType type, Long userId) {
            this.type = type;
            this.userId = userId;
        }

        public DataScopeType getType() {
            return type;
        }

        public Long getUserId() {
            return userId;
        }
    }

    /**
     * 数据权限ThreadLocal持有者
     */
    public static class DataScopeHolder {
        private static final ThreadLocal<DataScopeContext> CONTEXT = new ThreadLocal<>();

        public static void setScope(DataScopeType type, Long userId) {
            CONTEXT.set(new DataScopeContext(type, userId));
        }

        public static DataScopeContext getScope() {
            return CONTEXT.get();
        }

        public static void clear() {
            CONTEXT.remove();
        }
    }
}
