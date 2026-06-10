package com.reqmgmt.requirement.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 创建产品需求DTO
 */
@Data
public class ProductRequirementCreateDTO {

    private String title;

    private String description;

    private String priority;

    private Long businessLineId;

    private String productModule;

    private String reqType;

    private Long sprintId;

    private String workload;

    private Long rawReqId;

    private LocalDate expectedDate;

    private String prdUrl;

    private String handler;

    private String creator;

    private Integer isDirect;
}
