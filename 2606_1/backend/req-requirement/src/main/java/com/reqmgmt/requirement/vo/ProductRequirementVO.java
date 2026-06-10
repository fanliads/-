package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 产品需求看板卡片VO
 */
@Data
public class ProductRequirementVO {

    private Long id;

    private String reqNo;

    private String title;

    private String description;

    private String priority;

    private String status;

    private String statusName;

    private String businessLineName;

    private String productModule;

    private String assigneeName;

    private String sprintName;

    private String workload;

    private LocalDateTime expectedDate;

    private LocalDateTime createTime;
}
