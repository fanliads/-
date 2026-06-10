package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 产品需求列表VO
 */
@Data
public class ProductRequirementListVO {

    private Long id;

    private String reqNo;

    private String title;

    private String priority;

    private String status;

    private String statusName;

    private Long businessLineId;

    private String businessLineName;

    private String productModule;

    private String reqType;

    private String assigneeName;

    private Long sprintId;

    private String sprintName;

    private String workload;

    private Integer valueScore;

    private LocalDateTime expectedDate;

    private LocalDateTime createTime;

    private String description;

    private String prdUrl;

    private String handler;

    private String creator;

    private Integer isDirect;

    private Long rawReqId;

    private String rawReqTitle;

    private String createByName;
}
