package com.reqmgmt.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.entity.Notification;
import com.reqmgmt.requirement.mapper.NotificationMapper;
import com.reqmgmt.requirement.service.NotificationService;
import com.reqmgmt.requirement.service.notification.NotificationChannel;
import com.reqmgmt.requirement.service.notification.NotificationMessage;
import com.reqmgmt.requirement.vo.NotificationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 通知Service实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final List<NotificationChannel> channels;

    @Override
    public IPage<NotificationVO> getNotifications(Integer page, Integer size, Boolean isRead) {
        Long userId = SecurityUtils.getCurrentUserId();

        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        // 如果userId为null（系统通知），则查询所有；否则按用户查询
        if (userId != null) {
            wrapper.eq(Notification::getUserId, userId)
                    .or()
                    .isNull(Notification::getUserId);
        }
        if (isRead != null) {
            wrapper.eq(Notification::getIsRead, isRead);
        }
        wrapper.orderByDesc(Notification::getCreateTime);

        Page<Notification> pageParam = new Page<>(page, size);
        IPage<Notification> notificationPage = notificationMapper.selectPage(pageParam, wrapper);

        // 转换为VO
        IPage<NotificationVO> voPage = notificationPage.convert(this::toVO);
        return voPage;
    }

    @Override
    public Long getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();

        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.and(w -> w.eq(Notification::getUserId, userId)
                    .or()
                    .isNull(Notification::getUserId));
        }
        wrapper.eq(Notification::getIsRead, false);
        return notificationMapper.selectCount(wrapper);
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setIsRead(true);
            notificationMapper.updateById(notification);
        }
    }

    @Override
    public void markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();

        LambdaUpdateWrapper<Notification> wrapper = new LambdaUpdateWrapper<>();
        if (userId != null) {
            wrapper.and(w -> w.eq(Notification::getUserId, userId)
                    .or()
                    .isNull(Notification::getUserId));
        }
        wrapper.eq(Notification::getIsRead, false)
                .set(Notification::getIsRead, true);
        notificationMapper.update(null, wrapper);
    }

    @Override
    public void notify(NotificationMessage message) {
        for (NotificationChannel channel : channels) {
            try {
                channel.send(message);
            } catch (Exception e) {
                log.warn("通知发送失败, channel={}, title={}", channel.channelKey(), message.getTitle(), e);
            }
        }
    }

    private NotificationVO toVO(Notification notification) {
        NotificationVO vo = new NotificationVO();
        vo.setId(notification.getId());
        vo.setTitle(notification.getTitle());
        vo.setContent(notification.getContent());
        vo.setType(notification.getType());
        vo.setRefType(notification.getRefType());
        vo.setRefId(notification.getRefId());
        vo.setIsRead(notification.getIsRead());
        vo.setCreateTime(notification.getCreateTime());
        return vo;
    }
}
