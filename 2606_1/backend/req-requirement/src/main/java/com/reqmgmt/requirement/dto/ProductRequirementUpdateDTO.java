package com.reqmgmt.requirement.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 更新产品需求DTO（所有字段可选）
 */
@Data
public class ProductRequirementUpdateDTO {

    private String title;

    private String description;

    private String priority;

    private Long businessLineId;

    private String productModule;

    private String reqType;

    private Long sprintId;

    private String workload;

    private LocalDate expectedDate;

    private LocalDate actualOnlineDate;

    private String designDocUrl;

    private Integer valueScore;

    private Long assigneeId;

    private String status;

    private String prdUrl;

    private String handler;

    private String creator;

    private Integer isDirect;
}
