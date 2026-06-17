package com.reqmgmt.requirement.dto;

import lombok.Data;

/**
 * 看板查询DTO
 */
@Data
public class KanbanQueryDTO {

    /**
     * 需求类型：raw/product
     */
    private String reqType;

    /**
     * 优先级：P0/P1/P2/P3
     */
    private String priority;

    /**
     * 业务线ID
     */
    private Long businessLineId;

    /**
     * 负责人ID
     */
    private Long assigneeId;

    /**
     * 迭代ID（仅产品需求）
     */
    private Long sprintId;

    /**
     * 关键字搜索
     */
    private String keyword;
}
