package com.reqmgmt.requirement.vo;

import lombok.Data;

/**
 * 看板列配置VO
 */
@Data
public class KanbanColumnVO {

    /**
     * 状态编码
     */
    private String status;

    /**
     * 状态名称
     */
    private String statusName;

    /**
     * 排序号
     */
    private Integer sortOrder;
}
