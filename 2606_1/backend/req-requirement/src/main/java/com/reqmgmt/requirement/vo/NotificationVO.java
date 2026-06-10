package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知VO
 */
@Data
public class NotificationVO {

    private Long id;

    private String title;

    private String content;

    private String type;

    private String refType;

    private Long refId;

    private Boolean isRead;

    private LocalDateTime createTime;
}
