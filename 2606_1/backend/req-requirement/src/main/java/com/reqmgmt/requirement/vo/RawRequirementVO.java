package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 原始需求看板卡片VO
 */
@Data
public class RawRequirementVO {

    private Long id;

    private String reqNo;

    private String title;

    private String description;

    private String priority;

    private String status;

    private String statusName;

    private String source;

    private String proposerName;

    private String assigneeName;

    private String businessLineName;

    private String projectName;

    private LocalDateTime expectedDate;

    private LocalDateTime createTime;
}
