package com.reqmgmt.sprint.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.entity.ProductRequirement;
import com.reqmgmt.requirement.mapper.ProductRequirementMapper;
import com.reqmgmt.sprint.entity.Sprint;
import com.reqmgmt.sprint.entity.SprintTeamConfig;
import com.reqmgmt.sprint.mapper.SprintMapper;
import com.reqmgmt.sprint.mapper.SprintTeamConfigMapper;
import com.reqmgmt.sprint.dto.SprintCreateDTO;
import com.reqmgmt.sprint.dto.SprintTeamConfigDTO;
import com.reqmgmt.sprint.dto.SprintUpdateDTO;
import com.reqmgmt.sprint.service.SprintService;
import com.reqmgmt.sprint.vo.SprintDetailVO;
import com.reqmgmt.sprint.vo.SprintOptionVO;
import com.reqmgmt.sprint.vo.SprintRequirementVO;
import com.reqmgmt.sprint.vo.SprintTeamConfigVO;
import com.reqmgmt.system.entity.SysDictData;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.mapper.SysDictDataMapper;
import com.reqmgmt.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 迭代Service实现类
 */
@Service
@RequiredArgsConstructor
public class SprintServiceImpl extends ServiceImpl<SprintMapper, Sprint> implements SprintService {

    private final ProductRequirementMapper productRequirementMapper;
    private final SysUserMapper sysUserMapper;
    private final SysDictDataMapper sysDictDataMapper;
    private final SprintTeamConfigMapper sprintTeamConfigMapper;

    @Override
    public List<Sprint> listSprints() {
        return this.list(new LambdaQueryWrapper<Sprint>()
                .orderByDesc(Sprint::getStartDate)
                .orderByDesc(Sprint::getId));
    }

    @Override
    public List<SprintOptionVO> listOptions() {
        return listSprints().stream().map(item -> {
            SprintOptionVO vo = new SprintOptionVO();
            vo.setId(item.getId());
            vo.setName(item.getName());
            vo.setTeamName(item.getTeamName());
            vo.setCadenceType(item.getCadenceType());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<SprintTeamConfigVO> listTeamConfigs() {
        return sprintTeamConfigMapper.selectList(new LambdaQueryWrapper<SprintTeamConfig>()
                        .orderByAsc(SprintTeamConfig::getTeamName))
                .stream()
                .map(item -> {
                    SprintTeamConfigVO vo = new SprintTeamConfigVO();
                    BeanUtil.copyProperties(item, vo);
                    return vo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public SprintDetailVO getDetail(Long id) {
        Sprint sprint = this.getById(id);
        if (sprint == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "迭代不存在");
        }

        SprintDetailVO detail = new SprintDetailVO();
        BeanUtil.copyProperties(sprint, detail);
        detail.setRequirements(listRequirementsBySprintId(id));
        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createSprint(SprintCreateDTO dto) {
        validateCadenceType(dto.getCadenceType());
        validateDateRange(dto.getStartDate(), dto.getEndDate());
        checkDuplicateWindow(null, dto.getTeamName(), dto.getCadenceType(), dto.getStartDate(), dto.getEndDate());

        Sprint sprint = new Sprint();
        BeanUtil.copyProperties(dto, sprint);
        sprint.setTeamName(normalizeBusinessLineName(dto.getTeamName()));
        if (StrUtil.isBlank(sprint.getName())) {
            sprint.setName(buildDefaultSprintName(sprint.getTeamName(), dto.getCadenceType(), dto.getStartDate(), dto.getEndDate()));
        }
        if (StrUtil.isBlank(sprint.getStatus())) {
            sprint.setStatus("planning");
        }
        sprint.setAutoCreated(0);
        sprint.setCreateBy(SecurityUtils.getCurrentUserId());
        this.save(sprint);
        ensureTeamConfig(sprint.getTeamName(), dto.getCadenceType());
        return sprint.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSprint(Long id, SprintUpdateDTO dto) {
        Sprint sprint = this.getById(id);
        if (sprint == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "迭代不存在");
        }

        String teamName = dto.getTeamName() != null ? dto.getTeamName() : sprint.getTeamName();
        String cadenceType = dto.getCadenceType() != null ? dto.getCadenceType() : sprint.getCadenceType();
        LocalDate startDate = dto.getStartDate() != null ? dto.getStartDate() : sprint.getStartDate();
        LocalDate endDate = dto.getEndDate() != null ? dto.getEndDate() : sprint.getEndDate();
        validateCadenceType(cadenceType);
        validateDateRange(startDate, endDate);
        checkDuplicateWindow(id, teamName, cadenceType, startDate, endDate);

        if (dto.getName() != null) {
            sprint.setName(dto.getName());
        }
        if (dto.getTeamName() != null) {
            sprint.setTeamName(dto.getTeamName());
        }
        if (dto.getCadenceType() != null) {
            sprint.setCadenceType(dto.getCadenceType());
        }
        if (dto.getStartDate() != null) {
            sprint.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            sprint.setEndDate(dto.getEndDate());
        }
        if (dto.getStatus() != null) {
            sprint.setStatus(dto.getStatus());
        }
        if (dto.getGoal() != null) {
            sprint.setGoal(dto.getGoal());
        }
        this.updateById(sprint);
        ensureTeamConfig(teamName, cadenceType);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveTeamConfig(SprintTeamConfigDTO dto) {
        validateCadenceType(dto.getDefaultCadenceType());
        String teamName = StrUtil.blankToDefault(dto.getTeamName(), "默认团队");
        SprintTeamConfig config = sprintTeamConfigMapper.selectOne(new LambdaQueryWrapper<SprintTeamConfig>()
                .eq(SprintTeamConfig::getTeamName, teamName)
                .last("LIMIT 1"));
        if (config == null) {
            config = new SprintTeamConfig();
            config.setTeamName(teamName);
            config.setCreateBy(SecurityUtils.getCurrentUserId());
        }
        config.setDefaultCadenceType(dto.getDefaultCadenceType());
        config.setAutoCreateEnabled(dto.getAutoCreateEnabled() == null ? 1 : dto.getAutoCreateEnabled());
        if (config.getId() == null) {
            sprintTeamConfigMapper.insert(config);
        } else {
            sprintTeamConfigMapper.updateById(config);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoCreateUpcomingSprints() {
        List<SprintTeamConfig> configs = sprintTeamConfigMapper.selectList(new LambdaQueryWrapper<SprintTeamConfig>()
                .eq(SprintTeamConfig::getAutoCreateEnabled, 1));
        for (SprintTeamConfig config : configs) {
            Sprint latest = this.getOne(new LambdaQueryWrapper<Sprint>()
                    .eq(Sprint::getTeamName, config.getTeamName())
                    .eq(Sprint::getCadenceType, config.getDefaultCadenceType())
                    .orderByDesc(Sprint::getEndDate)
                    .last("LIMIT 1"), false);
            if (latest == null || latest.getEndDate() == null || latest.getEndDate().isAfter(LocalDate.now().plusDays(1))) {
                continue;
            }
            LocalDate nextStart = latest.getEndDate().plusDays(1);
            LocalDate nextEnd = "biweekly".equals(config.getDefaultCadenceType()) ? nextStart.plusDays(13) : nextStart.plusDays(6);
            if (existsDuplicateWindow(config.getTeamName(), config.getDefaultCadenceType(), nextStart, nextEnd)) {
                continue;
            }
            Sprint sprint = new Sprint();
            sprint.setName(buildDefaultSprintName(config.getTeamName(), config.getDefaultCadenceType(), nextStart, nextEnd));
            sprint.setTeamName(config.getTeamName());
            sprint.setCadenceType(config.getDefaultCadenceType());
            sprint.setStartDate(nextStart);
            sprint.setEndDate(nextEnd);
            sprint.setStatus("planning");
            sprint.setAutoCreated(1);
            this.save(sprint);
        }
    }

    @Scheduled(cron = "0 10 1 * * ?")
    public void scheduledAutoCreateUpcomingSprints() {
        autoCreateUpcomingSprints();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void bindRequirement(Long sprintId, Long requirementId) {
        ensureSprintExists(sprintId);
        ProductRequirement requirement = productRequirementMapper.selectById(requirementId);
        if (requirement == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "产品需求不存在");
        }
        requirement.setSprintId(sprintId);
        productRequirementMapper.updateById(requirement);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeRequirement(Long sprintId, Long requirementId) {
        ensureSprintExists(sprintId);
        ProductRequirement requirement = productRequirementMapper.selectById(requirementId);
        if (requirement == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "产品需求不存在");
        }
        if (!Objects.equals(requirement.getSprintId(), sprintId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该需求不属于当前迭代");
        }
        // 使用 LambdaUpdateWrapper 确保 null 值能写入数据库
        // updateById 在 MyBatis-Plus 默认 NOT_NULL 策略下会跳过 null 字段
        LambdaUpdateWrapper<ProductRequirement> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductRequirement::getId, requirementId)
                .set(ProductRequirement::getSprintId, null);
        productRequirementMapper.update(null, updateWrapper);
    }

    private void ensureSprintExists(Long sprintId) {
        if (this.getById(sprintId) == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "迭代不存在");
        }
    }

    private void validateCadenceType(String cadenceType) {
        if (!"weekly".equals(cadenceType) && !"biweekly".equals(cadenceType)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "仅支持周迭代或双周迭代");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "迭代日期范围不合法");
        }
    }

    private void checkDuplicateWindow(Long id, String teamName, String cadenceType, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Sprint> wrapper = new LambdaQueryWrapper<Sprint>()
                .eq(Sprint::getTeamName, teamName)
                .eq(Sprint::getCadenceType, cadenceType)
                .eq(Sprint::getStartDate, startDate)
                .eq(Sprint::getEndDate, endDate);
        if (id != null) {
            wrapper.ne(Sprint::getId, id);
        }
        if (this.count(wrapper) > 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "同一团队在当前时间窗已存在相同周期迭代");
        }
    }

    private boolean existsDuplicateWindow(String teamName, String cadenceType, LocalDate startDate, LocalDate endDate) {
        return this.count(new LambdaQueryWrapper<Sprint>()
                .eq(Sprint::getTeamName, teamName)
                .eq(Sprint::getCadenceType, cadenceType)
                .eq(Sprint::getStartDate, startDate)
                .eq(Sprint::getEndDate, endDate)) > 0;
    }

    private List<SprintRequirementVO> listRequirementsBySprintId(Long sprintId) {
        List<ProductRequirement> requirements = productRequirementMapper.selectList(new LambdaQueryWrapper<ProductRequirement>()
                        .eq(ProductRequirement::getSprintId, sprintId)
                        .orderByAsc(ProductRequirement::getStatus)
                        .orderByDesc(ProductRequirement::getPriority)
                        .orderByDesc(ProductRequirement::getId));
        Map<Long, String> businessLineNameMap = loadBusinessLineNameMap();
        Map<Long, String> userNameMap = loadUserNameMap(requirements.stream()
                .map(ProductRequirement::getAssigneeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return requirements.stream()
                .map(item -> {
                    SprintRequirementVO vo = new SprintRequirementVO();
                    vo.setId(item.getId());
                    vo.setReqNo(item.getReqNo());
                    vo.setTitle(item.getTitle());
                    vo.setPriority(item.getPriority());
                    vo.setStatus(item.getStatus());
                    vo.setStatusName(mapStatusName(item.getStatus()));
                    vo.setProductModule(item.getProductModule());
                    vo.setBusinessLineId(item.getBusinessLineId());
                    vo.setBusinessLineName(item.getBusinessLineId() != null ? businessLineNameMap.get(item.getBusinessLineId()) : null);
                    vo.setAssigneeName(resolveAssigneeName(item, userNameMap));
                    return vo;
                })
                .sorted(Comparator.comparing(SprintRequirementVO::getStatus, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toList());
    }

    private Map<Long, String> loadUserNameMap(Set<Long> userIds) {
        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return sysUserMapper.selectBatchIds(new HashSet<>(userIds)).stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(SysUser::getId, user -> StringUtils.hasText(user.getRealName()) ? user.getRealName() : user.getUsername(), (a, b) -> a));
    }

    private Map<Long, String> loadBusinessLineNameMap() {
        // 前端使用字典数据的 id 作为 businessLineId，因此以 id 为 key 映射 label
        return sysDictDataMapper.selectList(new LambdaQueryWrapper<SysDictData>()
                        .eq(SysDictData::getDictCode, "business_line")
                        .eq(SysDictData::getStatus, 1)
                        .orderByAsc(SysDictData::getSort))
                .stream()
                .collect(Collectors.toMap(SysDictData::getId, SysDictData::getLabel, (a, b) -> a));
    }

    private String resolveAssigneeName(ProductRequirement item, Map<Long, String> userNameMap) {
        if (item.getAssigneeId() != null && userNameMap.containsKey(item.getAssigneeId())) {
            return userNameMap.get(item.getAssigneeId());
        }
        return StringUtils.hasText(item.getHandler()) ? item.getHandler() : null;
    }

    private void ensureTeamConfig(String teamName, String cadenceType) {
        String normalizedTeamName = StrUtil.blankToDefault(teamName, "默认团队");
        SprintTeamConfig config = sprintTeamConfigMapper.selectOne(new LambdaQueryWrapper<SprintTeamConfig>()
                .eq(SprintTeamConfig::getTeamName, normalizedTeamName)
                .last("LIMIT 1"));
        if (config != null) {
            return;
        }
        SprintTeamConfig entity = new SprintTeamConfig();
        entity.setTeamName(normalizedTeamName);
        entity.setDefaultCadenceType(cadenceType);
        entity.setAutoCreateEnabled(1);
        entity.setCreateBy(SecurityUtils.getCurrentUserId());
        sprintTeamConfigMapper.insert(entity);
    }

    private String buildDefaultSprintName(String teamName, String cadenceType, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            String cadenceName = "biweekly".equals(cadenceType) ? "双周迭代" : "周迭代";
            return teamName + "-" + cadenceName;
        }
        String code = getBusinessLineCode(teamName);
        String yy = String.format("%02d", startDate.getYear() % 100);
        String mm = String.format("%02d", startDate.getMonthValue());
        String weekNo = String.format("%02d", getMonthWeekNumber(startDate));
        return code + yy + mm + "_" + weekNo;
    }

    private String normalizeBusinessLineName(String teamName) {
        return StrUtil.blankToDefault(teamName, "校园G端");
    }

    private String getBusinessLineCode(String businessLineName) {
        return switch (businessLineName) {
            case "校园G端" -> "XY";
            case "市监G端" -> "SJ";
            case "B端团餐" -> "TC";
            case "技术支撑" -> "JX";
            default -> "SP";
        };
    }

    private int getMonthWeekNumber(LocalDate date) {
        return ((date.getDayOfMonth() - 1) / 7) + 1;
    }

    private String mapStatusName(String status) {
        return switch (status) {
            case "pending_filter" -> "待产品组长过滤";
            case "pending_assign" -> "待指派";
            case "dispatched" -> "已分发";
            case "hold" -> "已挂起";
            case "in_design" -> "设计中";
            case "in_review" -> "评审中";
            case "in_dev" -> "开发中";
            case "in_test" -> "测试中";
            case "ready_release" -> "待发布";
            case "released" -> "已发布";
            case "closed" -> "已关闭";
            default -> status;
        };
    }
}
