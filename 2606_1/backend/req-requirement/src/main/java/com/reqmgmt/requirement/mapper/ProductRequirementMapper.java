package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.ProductRequirement;
import org.apache.ibatis.annotations.Mapper;

/**
 * 产品需求Mapper接口
 */
@Mapper
public interface ProductRequirementMapper extends BaseMapper<ProductRequirement> {
}
