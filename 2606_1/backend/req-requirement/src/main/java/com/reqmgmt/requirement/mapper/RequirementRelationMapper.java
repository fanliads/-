package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.RequirementRelation;
import org.apache.ibatis.annotations.Mapper;

/**
 * 需求关联Mapper接口
 */
@Mapper
public interface RequirementRelationMapper extends BaseMapper<RequirementRelation> {
}
