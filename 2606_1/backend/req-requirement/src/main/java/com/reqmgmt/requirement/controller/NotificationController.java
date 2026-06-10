package com.reqmgmt.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.service.NotificationService;
import com.reqmgmt.requirement.vo.NotificationVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 通知控制器
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "站内通知", description = "站内通知相关接口")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "获取通知列表")
    public R<IPage<NotificationVO>> getNotifications(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Boolean isRead) {
        return R.ok(notificationService.getNotifications(page, size, isRead));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "获取未读通知数量")
    public R<Long> getUnreadCount() {
        return R.ok(notificationService.getUnreadCount());
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "标记单条已读")
    public R<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return R.ok();
    }

    @PutMapping("/read-all")
    @Operation(summary = "全部标记已读")
    public R<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return R.ok();
    }
}
