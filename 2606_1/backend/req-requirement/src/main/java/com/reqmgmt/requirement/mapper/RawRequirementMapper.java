package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.RawRequirement;
import org.apache.ibatis.annotations.Mapper;

/**
 * 原始需求Mapper接口
 */
@Mapper
public interface RawRequirementMapper extends BaseMapper<RawRequirement> {
}
