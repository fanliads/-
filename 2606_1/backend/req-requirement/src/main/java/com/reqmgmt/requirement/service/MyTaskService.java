package com.reqmgmt.requirement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.reqmgmt.requirement.vo.MyTaskVO;

import java.util.Map;

/**
 * 我的待办Service接口
 */
public interface MyTaskService {

    /**
     * 获取"待我处理"列表
     *
     * @param page 页码
     * @param size 每页数量
     * @return 分页结果
     */
    IPage<MyTaskVO> getPendingTasks(Integer page, Integer size);

    /**
     * 获取"已处理"列表
     *
     * @param page 页码
     * @param size 每页数量
     * @return 分页结果
     */
    IPage<MyTaskVO> getDoneTasks(Integer page, Integer size);

    /**
     * 待办统计
     *
     * @return {pendingCount, todayDoneCount, weekDoneCount}
     */
    Map<String, Object> getStats();
}
