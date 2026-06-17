package com.reqmgmt.requirement.dto;

import lombok.Data;

/**
 * 产品需求分页查询DTO
 */
@Data
public class ProductRequirementQueryDTO {

    private Integer page = 1;

    private Integer size = 10;

    private String status;

    private String priority;

    private Long businessLineId;

    private Long assigneeId;

    private Long sprintId;

    private String keyword;

    private String reqType;

    private String handler;

    private Boolean unscheduled;

    private Boolean groupByBusinessLine;
}
