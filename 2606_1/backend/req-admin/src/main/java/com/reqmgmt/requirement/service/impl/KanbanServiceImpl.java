package com.reqmgmt.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.reqmgmt.requirement.constant.RequirementStatus;
import com.reqmgmt.requirement.dto.KanbanMoveDTO;
import com.reqmgmt.requirement.dto.KanbanQueryDTO;
import com.reqmgmt.requirement.entity.ProductRequirement;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.entity.RequirementLog;
import com.reqmgmt.requirement.entity.StatusFlowConfig;
import com.reqmgmt.requirement.mapper.ProductRequirementMapper;
import com.reqmgmt.requirement.mapper.RawRequirementMapper;
import com.reqmgmt.requirement.mapper.RequirementLogMapper;
import com.reqmgmt.requirement.mapper.StatusFlowConfigMapper;
import com.reqmgmt.requirement.service.KanbanService;
import com.reqmgmt.requirement.vo.KanbanColumnVO;
import com.reqmgmt.requirement.vo.ProductRequirementVO;
import com.reqmgmt.requirement.vo.RawRequirementVO;
import com.reqmgmt.sprint.entity.Sprint;
import com.reqmgmt.sprint.mapper.SprintMapper;
import com.reqmgmt.system.entity.SysDictData;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.mapper.SysDictDataMapper;
import com.reqmgmt.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 看板Service实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KanbanServiceImpl implements KanbanService {

    private static final Map<String, String> LEGACY_RAW_STATUS_MAP = new HashMap<>();
    private static final Map<String, String> LEGACY_PRODUCT_STATUS_MAP = new HashMap<>();

    static {
        LEGACY_RAW_STATUS_MAP.put("待评估", "pending_evaluate");
        LEGACY_RAW_STATUS_MAP.put("评估中", "evaluating");
        LEGACY_RAW_STATUS_MAP.put("待承接", "accepted");
        LEGACY_RAW_STATUS_MAP.put("已承接", "accepted");
        LEGACY_RAW_STATUS_MAP.put("待产品总监判定", "pending_director");
        LEGACY_RAW_STATUS_MAP.put("待总监判定", "pending_director");
        LEGACY_RAW_STATUS_MAP.put("待设计", "pending_design");
        LEGACY_RAW_STATUS_MAP.put("设计中", "designing");
        LEGACY_RAW_STATUS_MAP.put("已设计", "designed");
        LEGACY_RAW_STATUS_MAP.put("开发中", "developing");
        LEGACY_RAW_STATUS_MAP.put("已上线", "online");
        LEGACY_RAW_STATUS_MAP.put("拒绝", "rejected");
        LEGACY_RAW_STATUS_MAP.put("已拒绝", "rejected");
        LEGACY_RAW_STATUS_MAP.put("挂起", "suspended");
        LEGACY_RAW_STATUS_MAP.put("已挂起", "suspended");
        LEGACY_RAW_STATUS_MAP.put("已拆分待跟进", "split");
        LEGACY_RAW_STATUS_MAP.put("已关闭", "closed");

        LEGACY_PRODUCT_STATUS_MAP.put("待分配", "pending_assign");
        LEGACY_PRODUCT_STATUS_MAP.put("待指派", "pending_assign");
        LEGACY_PRODUCT_STATUS_MAP.put("待组长过滤", "pending_leader_filter");
        LEGACY_PRODUCT_STATUS_MAP.put("待产品经理接手", "pending_pm");
        LEGACY_PRODUCT_STATUS_MAP.put("待办需求", "backlog");
        LEGACY_PRODUCT_STATUS_MAP.put("调研中", "researching");
        LEGACY_PRODUCT_STATUS_MAP.put("设计中", "designing");
        LEGACY_PRODUCT_STATUS_MAP.put("等待确认", "waiting_confirm");
        LEGACY_PRODUCT_STATUS_MAP.put("研发中", "developing");
        LEGACY_PRODUCT_STATUS_MAP.put("开发中", "developing");
        LEGACY_PRODUCT_STATUS_MAP.put("测试中", "testing");
        LEGACY_PRODUCT_STATUS_MAP.put("已上线", "online");
        LEGACY_PRODUCT_STATUS_MAP.put("已挂起", "suspended");
        LEGACY_PRODUCT_STATUS_MAP.put("已关闭", "closed");
    }

    private final RawRequirementMapper rawRequirementMapper;
    private final ProductRequirementMapper productRequirementMapper;
    private final StatusFlowConfigMapper statusFlowConfigMapper;
    private final RequirementLogMapper requirementLogMapper;
    private final SysUserMapper sysUserMapper;
    private final SysDictDataMapper sysDictDataMapper;
    private final SprintMapper sprintMapper;

    @Override
    public Map<String, List<RawRequirementVO>> getRawKanbanData(KanbanQueryDTO query) {
        // 构建查询条件
        LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getPriority())) {
            wrapper.eq(RawRequirement::getPriority, query.getPriority());
        }
        if (query.getBusinessLineId() != null) {
            wrapper.eq(RawRequirement::getBusinessLineId, query.getBusinessLineId());
        }
        if (query.getAssigneeId() != null) {
            wrapper.eq(RawRequirement::getAssigneeId, query.getAssigneeId());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(RawRequirement::getTitle, query.getKeyword())
                    .or().like(RawRequirement::getReqNo, query.getKeyword()));
        }
        wrapper.orderByDesc(RawRequirement::getPriority, RawRequirement::getCreateTime);

        List<RawRequirement> list = rawRequirementMapper.selectList(wrapper);

        // 转换为VO并按状态分组
        Map<String, String> businessLineNameMap = loadBusinessLineNameMap();
        Map<Long, String> userNameMap = loadUserNameMap(extractRawUserIds(list));
        Map<String, List<RawRequirementVO>> grouped = list.stream()
                .map(item -> convertToRawVO(item, businessLineNameMap, userNameMap))
                .collect(Collectors.groupingBy(RawRequirementVO::getStatus, LinkedHashMap::new, Collectors.toList()));
        return alignColumns("raw", grouped);
    }

    @Override
    public Map<String, List<ProductRequirementVO>> getProductKanbanData(KanbanQueryDTO query) {
        // 构建查询条件
        LambdaQueryWrapper<ProductRequirement> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getPriority())) {
            wrapper.eq(ProductRequirement::getPriority, query.getPriority());
        }
        if (query.getBusinessLineId() != null) {
            wrapper.eq(ProductRequirement::getBusinessLineId, query.getBusinessLineId());
        }
        if (query.getAssigneeId() != null) {
            wrapper.eq(ProductRequirement::getAssigneeId, query.getAssigneeId());
        }
        if (query.getSprintId() != null) {
            wrapper.eq(ProductRequirement::getSprintId, query.getSprintId());
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.and(w -> w.like(ProductRequirement::getTitle, query.getKeyword())
                    .or().like(ProductRequirement::getReqNo, query.getKeyword()));
        }
        wrapper.orderByDesc(ProductRequirement::getPriority, ProductRequirement::getCreateTime);

        List<ProductRequirement> list = productRequirementMapper.selectList(wrapper);

        // 转换为VO并按状态分组
        Map<String, String> businessLineNameMap = loadBusinessLineNameMap();
        Map<Long, String> userNameMap = loadUserNameMap(extractProductUserIds(list));
        Map<Long, String> sprintNameMap = loadSprintNameMap(extractSprintIds(list));
        Map<String, List<ProductRequirementVO>> grouped = list.stream()
                .map(item -> convertToProductVO(item, businessLineNameMap, userNameMap, sprintNameMap))
                .collect(Collectors.groupingBy(ProductRequirementVO::getStatus, LinkedHashMap::new, Collectors.toList()));
        return alignColumns("product", grouped);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void moveRequirement(KanbanMoveDTO moveDTO) {
        String reqType = moveDTO.getReqType();

        // 1. 校验状态流转合法性
        List<StatusFlowConfig> flowConfigs = statusFlowConfigMapper.selectByReqTypeAndFromStatus(
                reqType, moveDTO.getFromStatus());

        boolean isValidFlow = flowConfigs.stream()
                .anyMatch(config -> config.getToStatus().equals(moveDTO.getToStatus()));

        if (!isValidFlow) {
            throw new RuntimeException("不允许的状态流转: " + moveDTO.getFromStatus() + " -> " + moveDTO.getToStatus());
        }

        // 2. 更新状态
        if ("raw".equals(reqType)) {
            RawRequirement raw = rawRequirementMapper.selectById(moveDTO.getReqId());
            if (raw == null) {
                throw new RuntimeException("原始需求不存在: " + moveDTO.getReqId());
            }
            raw.setStatus(moveDTO.getToStatus());
            raw.setUpdateTime(LocalDateTime.now());
            rawRequirementMapper.updateById(raw);
        } else if ("product".equals(reqType)) {
            ProductRequirement product = productRequirementMapper.selectById(moveDTO.getReqId());
            if (product == null) {
                throw new RuntimeException("产品需求不存在: " + moveDTO.getReqId());
            }
            product.setStatus(moveDTO.getToStatus());
            product.setUpdateTime(LocalDateTime.now());
            productRequirementMapper.updateById(product);
        } else {
            throw new RuntimeException("未知需求类型: " + reqType);
        }

        // 3. 记录日志
        RequirementLog requirementLog = new RequirementLog();
        requirementLog.setReqId(moveDTO.getReqId());
        requirementLog.setReqType(reqType);
        requirementLog.setAction("status_change");
        requirementLog.setOldValue(moveDTO.getFromStatus());
        requirementLog.setNewValue(moveDTO.getToStatus());
        requirementLog.setCreateTime(LocalDateTime.now());
        requirementLogMapper.insert(requirementLog);
    }

    @Override
    public List<KanbanColumnVO> getKanbanColumns(String reqType) {
        // 从配置表获取所有状态
        List<String> statuses = statusFlowConfigMapper.selectAllStatuses(reqType);

        // 如果配置表中没有数据，使用默认状态
        if (statuses == null || statuses.isEmpty()) {
            Map<String, String> statusMap = "raw".equals(reqType)
                    ? RequirementStatus.RAW_STATUS_MAP
                    : RequirementStatus.PRODUCT_STATUS_MAP;
            List<KanbanColumnVO> columns = new ArrayList<>();
            int order = 0;
            for (Map.Entry<String, String> entry : statusMap.entrySet()) {
                KanbanColumnVO column = new KanbanColumnVO();
                column.setStatus(entry.getKey());
                column.setStatusName(entry.getValue());
                column.setSortOrder(order++);
                columns.add(column);
            }
            return columns;
        }

        // 使用配置表中的状态
        return statuses.stream().map(status -> {
            KanbanColumnVO column = new KanbanColumnVO();
            column.setStatus(status);
            column.setStatusName(RequirementStatus.getStatusName(reqType, status));
            return column;
        }).collect(Collectors.toList());
    }

    /**
     * 转换原始需求实体为VO
     */
    private RawRequirementVO convertToRawVO(RawRequirement raw,
                                           Map<String, String> businessLineNameMap,
                                           Map<Long, String> userNameMap) {
        RawRequirementVO vo = new RawRequirementVO();
        vo.setId(raw.getId());
        vo.setReqNo(raw.getReqNo());
        vo.setTitle(raw.getTitle());
        vo.setPriority(raw.getPriority());
        String normalizedStatus = normalizeStatus("raw", raw.getStatus());
        vo.setStatus(normalizedStatus);
        vo.setStatusName(RequirementStatus.getStatusName("raw", normalizedStatus));
        vo.setSource(raw.getSource());
        vo.setExpectedDate(raw.getExpectedDate() != null ? raw.getExpectedDate().atStartOfDay() : null);
        vo.setCreateTime(raw.getCreateTime());
        vo.setProposerName(raw.getProposer());
        vo.setProjectName(raw.getProjectName());
        vo.setBusinessLineName(resolveBusinessLineName(raw.getBusinessLineId(), raw.getBusinessLine(), businessLineNameMap));
        vo.setAssigneeName(resolveRawAssigneeName(raw, userNameMap));
        return vo;
    }

    /**
     * 转换产品需求实体为VO
     */
    private ProductRequirementVO convertToProductVO(ProductRequirement product,
                                                   Map<String, String> businessLineNameMap,
                                                   Map<Long, String> userNameMap,
                                                   Map<Long, String> sprintNameMap) {
        ProductRequirementVO vo = new ProductRequirementVO();
        vo.setId(product.getId());
        vo.setReqNo(product.getReqNo());
        vo.setTitle(product.getTitle());
        vo.setDescription(product.getDescription());
        vo.setPriority(product.getPriority());
        String normalizedStatus = normalizeStatus("product", product.getStatus());
        vo.setStatus(normalizedStatus);
        vo.setStatusName(RequirementStatus.getStatusName("product", normalizedStatus));
        vo.setProductModule(product.getProductModule());
        vo.setWorkload(product.getWorkload());
        vo.setExpectedDate(product.getExpectedDate() != null ? product.getExpectedDate().atStartOfDay() : null);
        vo.setCreateTime(product.getCreateTime());
        vo.setBusinessLineName(resolveBusinessLineName(product.getBusinessLineId(), null, businessLineNameMap));
        vo.setAssigneeName(resolveProductAssigneeName(product, userNameMap));
        vo.setSprintName(product.getSprintId() != null ? sprintNameMap.get(product.getSprintId()) : null);
        return vo;
    }

    private Set<Long> extractRawUserIds(List<RawRequirement> list) {
        Set<Long> ids = new HashSet<>();
        for (RawRequirement item : list) {
            if (item.getAssigneeId() != null) {
                ids.add(item.getAssigneeId());
            }
            if (item.getCurrentHandlerId() != null) {
                ids.add(item.getCurrentHandlerId());
            }
        }
        return ids;
    }

    private Set<Long> extractProductUserIds(List<ProductRequirement> list) {
        return list.stream()
                .map(ProductRequirement::getAssigneeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Set<Long> extractSprintIds(List<ProductRequirement> list) {
        return list.stream()
                .map(ProductRequirement::getSprintId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Map<Long, String> loadUserNameMap(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return sysUserMapper.selectBatchIds(userIds).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(SysUser::getId, user -> StringUtils.hasText(user.getRealName()) ? user.getRealName() : user.getUsername(), (a, b) -> a));
    }

    private Map<String, String> loadBusinessLineNameMap() {
        return sysDictDataMapper.selectList(new LambdaQueryWrapper<SysDictData>()
                        .eq(SysDictData::getDictCode, "business_line")
                        .eq(SysDictData::getStatus, 1)
                        .orderByAsc(SysDictData::getSort))
                .stream()
                .filter(item -> StringUtils.hasText(item.getValue()))
                .collect(Collectors.toMap(SysDictData::getValue, SysDictData::getLabel, (a, b) -> a));
    }

    private Map<Long, String> loadSprintNameMap(Set<Long> sprintIds) {
        if (sprintIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return sprintMapper.selectBatchIds(sprintIds).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Sprint::getId, Sprint::getName, (a, b) -> a));
    }

    private String resolveBusinessLineName(Long businessLineId, String fallback, Map<String, String> businessLineNameMap) {
        if (StringUtils.hasText(fallback) && businessLineNameMap.containsKey(fallback)) {
            return businessLineNameMap.get(fallback);
        }
        return StringUtils.hasText(fallback) ? fallback : null;
    }

    private String resolveRawAssigneeName(RawRequirement raw, Map<Long, String> userNameMap) {
        if (raw.getCurrentHandlerId() != null && userNameMap.containsKey(raw.getCurrentHandlerId())) {
            return userNameMap.get(raw.getCurrentHandlerId());
        }
        if (raw.getAssigneeId() != null && userNameMap.containsKey(raw.getAssigneeId())) {
            return userNameMap.get(raw.getAssigneeId());
        }
        return StringUtils.hasText(raw.getCurrentHandler()) ? raw.getCurrentHandler() : null;
    }

    private String resolveProductAssigneeName(ProductRequirement product, Map<Long, String> userNameMap) {
        if (product.getAssigneeId() != null && userNameMap.containsKey(product.getAssigneeId())) {
            return userNameMap.get(product.getAssigneeId());
        }
        return StringUtils.hasText(product.getHandler()) ? product.getHandler() : null;
    }

    private String normalizeStatus(String reqType, String status) {
        if (!StringUtils.hasText(status)) {
            return status;
        }
        Map<String, String> legacyMap = "raw".equals(reqType) ? LEGACY_RAW_STATUS_MAP : LEGACY_PRODUCT_STATUS_MAP;
        return legacyMap.getOrDefault(status, status);
    }

    private <T> Map<String, List<T>> alignColumns(String reqType, Map<String, List<T>> grouped) {
        LinkedHashMap<String, List<T>> aligned = new LinkedHashMap<>();
        for (KanbanColumnVO column : getKanbanColumns(reqType)) {
            aligned.put(column.getStatus(), grouped.getOrDefault(column.getStatus(), new ArrayList<>()));
        }
        for (Map.Entry<String, List<T>> entry : grouped.entrySet()) {
            aligned.putIfAbsent(entry.getKey(), entry.getValue());
        }
        return aligned;
    }
}
