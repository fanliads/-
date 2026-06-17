package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 产品需求详情VO
 */
@Data
public class ProductRequirementDetailVO {

    private Long id;

    private String reqNo;

    private String title;

    private String description;

    private String priority;

    private String status;

    private String statusName;

    private Long businessLineId;

    private String businessLineName;

    private String productModule;

    private String reqType;

    private Long sprintId;

    private String sprintName;

    private String workload;

    private Integer valueScore;

    private Long assigneeId;

    private String assigneeName;

    private Long rawReqId;

    private String rawReqTitle;

    private LocalDateTime expectedDate;

    private LocalDateTime actualOnlineDate;

    private String designDocUrl;

    private String prdUrl;

    private String handler;

    private String creator;

    private Integer isDirect;

    private String createByName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private List<SupplementVO> supplements;
}
