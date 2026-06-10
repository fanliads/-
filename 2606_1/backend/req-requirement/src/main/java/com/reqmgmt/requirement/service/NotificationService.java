package com.reqmgmt.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.reqmgmt.requirement.service.notification.NotificationMessage;
import com.reqmgmt.requirement.vo.NotificationVO;

/**
 * 通知Service接口
 */
public interface NotificationService {

    /**
     * 获取当前用户的通知列表（分页，最新在前）
     *
     * @param page   页码
     * @param size   每页数量
     * @param isRead 已读状态（可选，null表示全部）
     * @return 分页结果
     */
    IPage<NotificationVO> getNotifications(Integer page, Integer size, Boolean isRead);

    /**
     * 获取未读通知数量
     *
     * @return 未读数量
     */
    Long getUnreadCount();

    /**
     * 标记单条已读
     *
     * @param id 通知ID
     */
    void markAsRead(Long id);

    /**
     * 全部标记已读
     */
    void markAllAsRead();

    void notify(NotificationMessage message);
}
