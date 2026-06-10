package com.reqmgmt.requirement.dto;

import lombok.Data;

/**
 * 看板拖拽移动DTO
 */
@Data
public class KanbanMoveDTO {

    /**
     * 需求类型：raw/product
     */
    private String reqType;

    /**
     * 需求ID
     */
    private Long reqId;

    /**
     * 原状态
     */
    private String fromStatus;

    /**
     * 目标状态
     */
    private String toStatus;
}
