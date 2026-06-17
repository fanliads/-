package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.RequirementComment;
import org.apache.ibatis.annotations.Mapper;

/**
 * 需求评论Mapper接口
 */
@Mapper
public interface RequirementCommentMapper extends BaseMapper<RequirementComment> {
}
