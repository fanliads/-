package com.reqmgmt.requirement.service.notification.impl;

import com.reqmgmt.requirement.entity.Notification;
import com.reqmgmt.requirement.mapper.NotificationMapper;
import com.reqmgmt.requirement.service.notification.NotificationChannel;
import com.reqmgmt.requirement.service.notification.NotificationMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SiteNotificationChannel implements NotificationChannel {

    private final NotificationMapper notificationMapper;

    @Override
    public String channelKey() {
        return "site";
    }

    @Override
    public void send(NotificationMessage message) {
        Notification notification = new Notification();
        notification.setUserId(message.getUserId());
        notification.setTitle(message.getTitle());
        notification.setContent(message.getContent());
        notification.setType(message.getType());
        notification.setRefType(message.getRefType());
        notification.setRefId(message.getRefId());
        notification.setIsRead(false);
        notificationMapper.insert(notification);
    }
}
