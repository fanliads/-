package com.reqmgmt.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.entity.ProductRequirement;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.entity.RequirementLog;
import com.reqmgmt.requirement.mapper.ProductRequirementMapper;
import com.reqmgmt.requirement.mapper.RawRequirementMapper;
import com.reqmgmt.requirement.mapper.RequirementLogMapper;
import com.reqmgmt.requirement.service.MyTaskService;
import com.reqmgmt.requirement.service.impl.WorkflowServiceImpl;
import com.reqmgmt.requirement.vo.MyTaskVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * 我的待办Service实现类
 */
@Service
@RequiredArgsConstructor
public class MyTaskServiceImpl implements MyTaskService {
    private static final String RAW_STATUS_PENDING_JUDGEMENT = "pending_judgement";
    private static final String RAW_STATUS_PENDING_SPLIT = "pending_split";

    private final RawRequirementMapper rawRequirementMapper;
    private final ProductRequirementMapper productRequirementMapper;
    private final RequirementLogMapper requirementLogMapper;

    @Override
    public IPage<MyTaskVO> getPendingTasks(Integer page, Integer size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String roleKey = SecurityUtils.getCurrentRoleKey();

        List<MyTaskVO> allTasks = new ArrayList<>();

        // 根据角色查询对应的待处理需求
        switch (roleKey) {
            case "market" -> {
                // 市场部：自己创建、仍处于待判定阶段的原始需求
                LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(RawRequirement::getCreateBy, currentUserId)
                        .eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT)
                        .orderByDesc(RawRequirement::getUpdateTime);
                List<RawRequirement> list = rawRequirementMapper.selectList(wrapper);
                for (RawRequirement r : list) {
                    allTasks.add(toRawTaskVO(r, "补充信息"));
                }
            }
            case "pm" -> {
                // 项目经理：待判定的原始需求
                LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT)
                        .orderByDesc(RawRequirement::getUpdateTime);
                List<RawRequirement> list = rawRequirementMapper.selectList(wrapper);
                for (RawRequirement r : list) {
                    allTasks.add(toRawTaskVO(r, "评估承接"));
                }
            }
            case "product_director" -> {
                // 产品总监：待判定的原始需求（支持上收决策）
                LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT)
                        .orderByDesc(RawRequirement::getUpdateTime);
                List<RawRequirement> list = rawRequirementMapper.selectList(wrapper);
                for (RawRequirement r : list) {
                    allTasks.add(toRawTaskVO(r, "审批"));
                }
            }
            case "product_leader" -> {
                // 产品组长：待拆分的原始需求
                LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(RawRequirement::getStatus, RAW_STATUS_PENDING_SPLIT)
                        .orderByDesc(RawRequirement::getUpdateTime);
                List<RawRequirement> list = rawRequirementMapper.selectList(wrapper);
                for (RawRequirement r : list) {
                    allTasks.add(toRawTaskVO(r, "确认拆分"));
                }
            }
            case "product_manager" -> {
                // 产品经理：status=pending_pm/backlog/researching/designing 且assignee是自己的产品需求
                LambdaQueryWrapper<ProductRequirement> wrapper = new LambdaQueryWrapper<>();
                wrapper.in(ProductRequirement::getStatus, "pending_pm", "backlog", "researching", "designing")
                        .eq(ProductRequirement::getAssigneeId, currentUserId)
                        .orderByDesc(ProductRequirement::getUpdateTime);
                List<ProductRequirement> list = productRequirementMapper.selectList(wrapper);
                for (ProductRequirement r : list) {
                    String action = getActionForStatus(r.getStatus());
                    allTasks.add(toProductTaskVO(r, action));
                }
            }
            default -> {
                // 其他角色：无待办
            }
        }

        // 手动分页
        return manualPage(allTasks, page, size);
    }

    @Override
    public IPage<MyTaskVO> getDoneTasks(Integer page, Integer size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        // 查询 requirement_log 中 operator_id = 当前用户 且 action=status_change 的记录
        LambdaQueryWrapper<RequirementLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(RequirementLog::getOperatorId, currentUserId)
                .eq(RequirementLog::getAction, "status_change")
                .orderByDesc(RequirementLog::getCreateTime);
        List<RequirementLog> logs = requirementLogMapper.selectList(logWrapper);

        List<MyTaskVO> allTasks = new ArrayList<>();
        for (RequirementLog log : logs) {
            MyTaskVO vo = new MyTaskVO();
            vo.setId(log.getReqId());
            vo.setReqType(log.getReqType());

            // 获取需求标题和编号
            if ("raw".equals(log.getReqType())) {
                RawRequirement rawReq = rawRequirementMapper.selectById(log.getReqId());
                if (rawReq != null) {
                    vo.setReqNo(rawReq.getReqNo());
                    vo.setTitle(rawReq.getTitle());
                    vo.setPriority(rawReq.getPriority());
                    vo.setStatus(rawReq.getStatus());
                    vo.setStatusName(WorkflowServiceImpl.getStatusName(rawReq.getStatus()));
                }
            } else {
                ProductRequirement prodReq = productRequirementMapper.selectById(log.getReqId());
                if (prodReq != null) {
                    vo.setReqNo(prodReq.getReqNo());
                    vo.setTitle(prodReq.getTitle());
                    vo.setPriority(prodReq.getPriority());
                    vo.setStatus(prodReq.getStatus());
                    vo.setStatusName(WorkflowServiceImpl.getStatusName(prodReq.getStatus()));
                }
            }

            vo.setActionRequired(log.getNewValue());
            vo.setUpdatedTime(log.getCreateTime());
            allTasks.add(vo);
        }

        return manualPage(allTasks, page, size);
    }

    @Override
    public Map<String, Object> getStats() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String roleKey = SecurityUtils.getCurrentRoleKey();

        Map<String, Object> stats = new HashMap<>();

        // 待处理数量
        long pendingCount = 0;
        switch (roleKey) {
            case "market" -> pendingCount = rawRequirementMapper.selectCount(
                    new LambdaQueryWrapper<RawRequirement>()
                            .eq(RawRequirement::getCreateBy, currentUserId)
                            .eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT));
            case "pm" -> pendingCount = rawRequirementMapper.selectCount(
                    new LambdaQueryWrapper<RawRequirement>()
                            .eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT));
            case "product_director" -> pendingCount = rawRequirementMapper.selectCount(
                    new LambdaQueryWrapper<RawRequirement>()
                            .eq(RawRequirement::getStatus, RAW_STATUS_PENDING_JUDGEMENT));
            case "product_leader" -> pendingCount = rawRequirementMapper.selectCount(
                    new LambdaQueryWrapper<RawRequirement>()
                            .eq(RawRequirement::getStatus, RAW_STATUS_PENDING_SPLIT));
            case "product_manager" -> pendingCount = productRequirementMapper.selectCount(
                    new LambdaQueryWrapper<ProductRequirement>()
                            .in(ProductRequirement::getStatus, "pending_pm", "backlog", "researching", "designing")
                            .eq(ProductRequirement::getAssigneeId, currentUserId));
        }
        stats.put("pendingCount", pendingCount);

        // 今日已处理
        LocalDateTime todayStart = LocalDateTime.of(LocalDateTime.now().toLocalDate(), LocalTime.MIN);
        long todayDoneCount = requirementLogMapper.selectCount(
                new LambdaQueryWrapper<RequirementLog>()
                        .eq(RequirementLog::getOperatorId, currentUserId)
                        .eq(RequirementLog::getAction, "status_change")
                        .ge(RequirementLog::getCreateTime, todayStart));
        stats.put("todayDoneCount", todayDoneCount);

        // 本周已处理
        LocalDateTime weekStart = LocalDateTime.now().with(DayOfWeek.MONDAY).with(LocalTime.MIN);
        long weekDoneCount = requirementLogMapper.selectCount(
                new LambdaQueryWrapper<RequirementLog>()
                        .eq(RequirementLog::getOperatorId, currentUserId)
                        .eq(RequirementLog::getAction, "status_change")
                        .ge(RequirementLog::getCreateTime, weekStart));
        stats.put("weekDoneCount", weekDoneCount);

        return stats;
    }

    // ==================== 私有方法 ====================

    private MyTaskVO toRawTaskVO(RawRequirement r, String actionRequired) {
        MyTaskVO vo = new MyTaskVO();
        vo.setId(r.getId());
        vo.setReqType("raw");
        vo.setReqNo(r.getReqNo());
        vo.setTitle(r.getTitle());
        vo.setPriority(r.getPriority());
        vo.setStatus(r.getStatus());
        vo.setStatusName(WorkflowServiceImpl.getStatusName(r.getStatus()));
        vo.setActionRequired(actionRequired);
        vo.setCreateTime(r.getCreateTime());
        vo.setUpdatedTime(r.getUpdateTime());
        return vo;
    }

    private MyTaskVO toProductTaskVO(ProductRequirement r, String actionRequired) {
        MyTaskVO vo = new MyTaskVO();
        vo.setId(r.getId());
        vo.setReqType("product");
        vo.setReqNo(r.getReqNo());
        vo.setTitle(r.getTitle());
        vo.setPriority(r.getPriority());
        vo.setStatus(r.getStatus());
        vo.setStatusName(WorkflowServiceImpl.getStatusName(r.getStatus()));
        vo.setActionRequired(actionRequired);
        vo.setCreateTime(r.getCreateTime());
        vo.setUpdatedTime(r.getUpdateTime());
        return vo;
    }

    private String getActionForStatus(String status) {
        return switch (status) {
            case "pending_pm" -> "开始处理";
            case "backlog" -> "规划排期";
            case "researching" -> "完成调研";
            case "designing" -> "完成设计";
            default -> "处理";
        };
    }

    private <T> IPage<T> manualPage(List<T> list, Integer page, Integer size) {
        Page<T> result = new Page<>(page, size, list.size());
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, list.size());
        if (fromIndex < list.size()) {
            result.setRecords(list.subList(fromIndex, toIndex));
        } else {
            result.setRecords(Collections.emptyList());
        }
        return result;
    }
}
