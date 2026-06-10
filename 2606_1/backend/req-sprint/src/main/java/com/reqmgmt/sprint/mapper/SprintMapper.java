package com.reqmgmt.sprint.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.sprint.entity.Sprint;
import org.apache.ibatis.annotations.Mapper;

/**
 * 迭代Mapper接口
 */
@Mapper
public interface SprintMapper extends BaseMapper<Sprint> {
}
