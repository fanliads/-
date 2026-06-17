package com.reqmgmt.requirement.vo;

import lombok.Data;

/**
 * 可执行操作VO
 */
@Data
public class ActionVO {

    private String actionName;

    private String toStatus;

    private Boolean needApproval;
}
