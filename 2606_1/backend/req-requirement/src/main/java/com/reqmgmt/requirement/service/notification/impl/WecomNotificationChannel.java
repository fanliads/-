package com.reqmgmt.requirement.service.notification.impl;

import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqmgmt.requirement.service.notification.NotificationChannel;
import com.reqmgmt.requirement.service.notification.NotificationMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class WecomNotificationChannel implements NotificationChannel {

    private final ObjectMapper objectMapper;

    @Value("${notification.wecom.enabled:false}")
    private boolean enabled;

    @Value("${notification.wecom.webhook-url:}")
    private String webhookUrl;

    @Value("${notification.wecom.timeout-ms:3000}")
    private long timeoutMs;

    @Override
    public String channelKey() {
        return "wecom";
    }

    @Override
    public void send(NotificationMessage message) {
        if (!enabled || StrUtil.isBlank(webhookUrl)) {
            return;
        }
        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "msgtype", "text",
                    "text", Map.of("content", message.getTitle() + "\n" + message.getContent())
            ));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(webhookUrl))
                    .timeout(Duration.ofMillis(timeoutMs))
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpClient.newHttpClient().send(request, java.net.http.HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            throw new IllegalStateException("企业微信消息发送失败: " + e.getMessage(), e);
        }
    }
}
