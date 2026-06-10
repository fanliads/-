package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 我的待办VO
 */
@Data
public class MyTaskVO {

    private Long id;

    private String reqType;

    private String reqNo;

    private String title;

    private String priority;

    private String status;

    private String statusName;

    private String actionRequired;

    private LocalDateTime createTime;

    private LocalDateTime updatedTime;
}
