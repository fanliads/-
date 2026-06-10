package com.reqmgmt.common.service;

/**
 * 迭代查询服务接口（用于跨模块解耦，避免 req-requirement 与 req-sprint 循环依赖）
 */
public interface SprintQueryService {

    /**
     * 根据迭代ID获取迭代名称
     *
     * @param sprintId 迭代ID
     * @return 迭代名称，不存在时返回null
     */
    String getSprintName(Long sprintId);
}
