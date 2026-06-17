package com.reqmgmt.requirement.service.notification;

public interface NotificationChannel {

    String channelKey();

    void send(NotificationMessage message);
}
