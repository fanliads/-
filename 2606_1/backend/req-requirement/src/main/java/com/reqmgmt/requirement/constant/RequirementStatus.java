package com.reqmgmt.requirement.constant;

import java.util.HashMap;
import java.util.Map;

/**
 * 需求状态常量及名称映射
 */
public class RequirementStatus {

    /**
     * 原始需求状态映射
     */
    public static final Map<String, String> RAW_STATUS_MAP = new HashMap<>();
    
    /**
     * 产品需求状态映射
     */
    public static final Map<String, String> PRODUCT_STATUS_MAP = new HashMap<>();

    static {
        RAW_STATUS_MAP.put("pending_judgement", "待判定");
        RAW_STATUS_MAP.put("pending_split", "待拆分");
        RAW_STATUS_MAP.put("in_progress", "开发中");
        RAW_STATUS_MAP.put("online", "已上线");
        RAW_STATUS_MAP.put("closed", "已关闭");
        RAW_STATUS_MAP.put("rejected", "已拒绝");
        RAW_STATUS_MAP.put("suspended", "已挂起");

        PRODUCT_STATUS_MAP.put("pending_assign", "待指派");
        PRODUCT_STATUS_MAP.put("pending_leader_filter", "待组长过滤");
        PRODUCT_STATUS_MAP.put("pending_pm", "待产品经理接手");
        PRODUCT_STATUS_MAP.put("pending_design", "待设计");
        PRODUCT_STATUS_MAP.put("backlog", "待办需求");
        PRODUCT_STATUS_MAP.put("researching", "调研中");
        PRODUCT_STATUS_MAP.put("designing", "设计中");
        PRODUCT_STATUS_MAP.put("waiting_confirm", "等待确认");
        PRODUCT_STATUS_MAP.put("developing", "研发中");
        PRODUCT_STATUS_MAP.put("testing", "测试中");
        PRODUCT_STATUS_MAP.put("online", "已上线");
        PRODUCT_STATUS_MAP.put("suspended", "已挂起");
    }

    /**
     * 根据需求类型和状态编码获取状态名称
     *
     * @param reqType 需求类型 raw/product
     * @param status  状态编码
     * @return 状态名称
     */
    public static String getStatusName(String reqType, String status) {
        if (status == null) {
            return "";
        }
        if ("raw".equals(reqType)) {
            return RAW_STATUS_MAP.getOrDefault(status, status);
        } else if ("product".equals(reqType)) {
            return PRODUCT_STATUS_MAP.getOrDefault(status, status);
        }
        return status;
    }

    private RequirementStatus() {
    }
}
