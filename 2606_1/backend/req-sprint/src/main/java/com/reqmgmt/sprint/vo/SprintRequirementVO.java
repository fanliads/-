package com.reqmgmt.sprint.vo;

import lombok.Data;

/**
 * 迭代下需求VO
 */
@Data
public class SprintRequirementVO {

    private Long id;

    private String reqNo;

    private String title;

    private String priority;

    private String status;

    private String statusName;

    private Long businessLineId;

    private String businessLineName;

    private String assigneeName;

    private String productModule;
}
