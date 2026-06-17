package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

/**
 * 站内通知Mapper接口
 */
@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
}
