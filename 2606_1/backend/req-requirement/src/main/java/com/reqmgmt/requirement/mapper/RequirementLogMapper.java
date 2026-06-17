package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.RequirementLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 需求日志Mapper接口
 */
@Mapper
public interface RequirementLogMapper extends BaseMapper<RequirementLog> {
}
