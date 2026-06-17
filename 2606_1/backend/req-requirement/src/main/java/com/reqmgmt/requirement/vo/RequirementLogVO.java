package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 需求操作日志VO
 */
@Data
public class RequirementLogVO {

    private Long id;

    private String operatorName;

    private String action;

    private String actionName;

    private String fieldName;

    private String oldValue;

    private String newValue;

    private String remark;

    private LocalDateTime createTime;
}
