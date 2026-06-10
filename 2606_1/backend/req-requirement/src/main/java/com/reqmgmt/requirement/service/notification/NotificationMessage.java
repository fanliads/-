package com.reqmgmt.requirement.service.notification;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationMessage {

    private Long userId;
    private String title;
    private String content;
    private String type;
    private String refType;
    private Long refId;
}
