package com.reqmgmt.sprint.service;

import com.reqmgmt.common.service.SprintQueryService;
import com.reqmgmt.sprint.entity.Sprint;
import com.reqmgmt.sprint.mapper.SprintMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 迭代查询服务实现（供跨模块调用，避免循环依赖）
 */
@Service
@RequiredArgsConstructor
public class SprintQueryServiceImpl implements SprintQueryService {

    private final SprintMapper sprintMapper;

    @Override
    public String getSprintName(Long sprintId) {
        if (sprintId == null || sprintId <= 0) {
            return null;
        }
        Sprint sprint = sprintMapper.selectById(sprintId);
        return sprint != null ? sprint.getName() : null;
    }
}
