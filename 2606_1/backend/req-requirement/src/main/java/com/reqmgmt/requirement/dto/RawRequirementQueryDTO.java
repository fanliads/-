package com.reqmgmt.requirement.dto;

import lombok.Data;

/**
 * 原始需求分页查询DTO
 */
@Data
public class RawRequirementQueryDTO {

    private Integer page = 1;

    private Integer size = 10;

    private String status;

    private String priority;

    private String source;

    private Long businessLineId;

    private String businessLine;

    private String registerName;

    private String projectManager;

    private String productManager;

    private Integer isUrgent;

    private Long assigneeId;

    private String keyword;

    private String startDate;

    private String endDate;

    private String sortField;

    private String sortOrder;
}
