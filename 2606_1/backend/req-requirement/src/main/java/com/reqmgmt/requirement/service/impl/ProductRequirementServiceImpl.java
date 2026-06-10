package com.reqmgmt.requirement.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.entity.*;
import com.reqmgmt.requirement.mapper.*;
import com.reqmgmt.requirement.service.ProductRequirementService;
import com.reqmgmt.requirement.vo.*;
import com.reqmgmt.common.service.SprintQueryService;
import com.reqmgmt.system.entity.SysDictData;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.mapper.SysDictDataMapper;
import com.reqmgmt.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 产品需求Service实现类
 */
@Service
@RequiredArgsConstructor
public class ProductRequirementServiceImpl extends ServiceImpl<ProductRequirementMapper, ProductRequirement> implements ProductRequirementService {

    private final RequirementLogMapper requirementLogMapper;
    private final RequirementCommentMapper requirementCommentMapper;
    private final RequirementSupplementMapper requirementSupplementMapper;
    private final RequirementRelationMapper requirementRelationMapper;
    private final RawRequirementMapper rawRequirementMapper;
    private final SprintQueryService sprintQueryService;
    private final SysDictDataMapper sysDictDataMapper;
    private final SysUserMapper sysUserMapper;

    private static final String REQ_TYPE = "product";

    private static final Map<String, String> STATUS_NAME_MAP = new LinkedHashMap<>();
    private static final Map<String, String> ACTION_NAME_MAP = new LinkedHashMap<>();
    private static final Map<String, String> SUPPLEMENT_TYPE_MAP = new LinkedHashMap<>();

    static {
        STATUS_NAME_MAP.put("pending_design", "待设计");
        STATUS_NAME_MAP.put("designing", "设计中");
        STATUS_NAME_MAP.put("developing", "开发中");
        STATUS_NAME_MAP.put("online", "已上线");
        STATUS_NAME_MAP.put("suspended", "已挂起");
        STATUS_NAME_MAP.put("closed", "已关闭");

        ACTION_NAME_MAP.put("create", "创建");
        ACTION_NAME_MAP.put("update", "更新");
        ACTION_NAME_MAP.put("status_change", "状态变更");
        ACTION_NAME_MAP.put("delete", "删除");
        ACTION_NAME_MAP.put("comment", "评论");
        ACTION_NAME_MAP.put("supplement", "补充");
        ACTION_NAME_MAP.put("split", "拆分");

        SUPPLEMENT_TYPE_MAP.put("customer_background", "客户背景");
        SUPPLEMENT_TYPE_MAP.put("tech_detail", "技术细节");
        SUPPLEMENT_TYPE_MAP.put("scope_clarify", "范围澄清");
        SUPPLEMENT_TYPE_MAP.put("other", "其他");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createProductRequirement(ProductRequirementCreateDTO dto) {
        ProductRequirement entity = new ProductRequirement();
        BeanUtil.copyProperties(dto, entity);

        // 生成编号 PRD-YYYYMMDD-NNN
        entity.setReqNo(generateReqNo());
        entity.setStatus("pending_design");
        entity.setCreateBy(SecurityUtils.getCurrentUserId());
        if (entity.getPriority() == null) {
            entity.setPriority("P2");
        }
        if (entity.getIsDirect() == null) {
            entity.setIsDirect(0);
        }
        if (StrUtil.isBlank(entity.getCreator())) {
            entity.setCreator(SecurityUtils.getCurrentUsername());
        }
        // workload 在 DB 是 DECIMAL 类型，空字符串会导致 MySQL Strict Mode 报错
        if (StrUtil.isBlank(entity.getWorkload())) {
            entity.setWorkload(null);
        }

        this.save(entity);

        // 如果关联了原始需求，建立关联关系
        if (dto.getRawReqId() != null) {
            RequirementRelation relation = new RequirementRelation();
            relation.setSourceType("raw");
            relation.setSourceId(dto.getRawReqId());
            relation.setTargetType("product");
            relation.setTargetId(entity.getId());
            relation.setRelationType("parent_child");
            relation.setCreateBy(SecurityUtils.getCurrentUserId());
            requirementRelationMapper.insert(relation);
        }

        saveLog(entity.getId(), "create", null, null, "创建产品需求");

        return entity.getId();
    }

    @Override
    public ProductRequirementDetailVO getDetail(Long id) {
        ProductRequirement entity = this.getById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }

        ProductRequirementDetailVO vo = new ProductRequirementDetailVO();
        BeanUtil.copyProperties(entity, vo);
        vo.setStatusName(STATUS_NAME_MAP.getOrDefault(entity.getStatus(), entity.getStatus()));
        vo.setSprintName(resolveSprintName(entity.getSprintId()));

        // 获取关联的原始需求标题
        if (entity.getRawReqId() != null) {
            RawRequirement rawReq = rawRequirementMapper.selectById(entity.getRawReqId());
            if (rawReq != null) {
                vo.setRawReqTitle(rawReq.getTitle());
            }
        }

        // 获取补充内容
        vo.setSupplements(getSupplements(id));

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProductRequirement(Long id, ProductRequirementUpdateDTO dto) {
        ProductRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }

        logFieldChanges(existing, dto);

        LambdaUpdateWrapper<ProductRequirement> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(ProductRequirement::getId, id);

        if (dto.getTitle() != null) {
            updateWrapper.set(ProductRequirement::getTitle, dto.getTitle());
        }
        if (dto.getDescription() != null) {
            updateWrapper.set(ProductRequirement::getDescription, dto.getDescription());
        }
        if (dto.getPriority() != null) {
            updateWrapper.set(ProductRequirement::getPriority, dto.getPriority());
        }
        if (dto.getBusinessLineId() != null) {
            updateWrapper.set(ProductRequirement::getBusinessLineId, dto.getBusinessLineId());
        }
        if (dto.getProductModule() != null) {
            updateWrapper.set(ProductRequirement::getProductModule, dto.getProductModule());
        }
        if (dto.getReqType() != null) {
            updateWrapper.set(ProductRequirement::getReqType, dto.getReqType());
        }
        if (dto.getSprintId() != null) {
            updateWrapper.set(ProductRequirement::getSprintId, dto.getSprintId() <= 0 ? null : dto.getSprintId());
        }
        if (dto.getWorkload() != null) {
            // workload 在 DB 是 DECIMAL 类型，空字符串转 null 避免 MySQL Strict Mode 报错
            String workload = StrUtil.isBlank(dto.getWorkload()) ? null : dto.getWorkload();
            updateWrapper.set(ProductRequirement::getWorkload, workload);
        }
        if (dto.getExpectedDate() != null) {
            updateWrapper.set(ProductRequirement::getExpectedDate, dto.getExpectedDate());
        }
        if (dto.getActualOnlineDate() != null) {
            updateWrapper.set(ProductRequirement::getActualOnlineDate, dto.getActualOnlineDate());
        }
        if (dto.getDesignDocUrl() != null) {
            updateWrapper.set(ProductRequirement::getDesignDocUrl, dto.getDesignDocUrl());
        }
        if (dto.getValueScore() != null) {
            updateWrapper.set(ProductRequirement::getValueScore, dto.getValueScore());
        }
        if (dto.getAssigneeId() != null) {
            Long oldAssigneeId = existing.getAssigneeId();
            updateWrapper.set(ProductRequirement::getAssigneeId, dto.getAssigneeId());
            if (!Objects.equals(oldAssigneeId, dto.getAssigneeId())) {
                saveLog(id, "assign", "assigneeId",
                        oldAssigneeId != null ? oldAssigneeId.toString() : null,
                        dto.getAssigneeId().toString(), null);
            }
        }
        if (dto.getStatus() != null) {
            String oldStatus = existing.getStatus();
            updateWrapper.set(ProductRequirement::getStatus, dto.getStatus());
            if (!Objects.equals(oldStatus, dto.getStatus())) {
                saveLog(id, "status_change", "status", oldStatus, dto.getStatus(), null);
            }
        }
        if (dto.getPrdUrl() != null) {
            updateWrapper.set(ProductRequirement::getPrdUrl, dto.getPrdUrl());
        }
        if (dto.getHandler() != null) {
            updateWrapper.set(ProductRequirement::getHandler, dto.getHandler());
        }
        if (dto.getCreator() != null) {
            updateWrapper.set(ProductRequirement::getCreator, dto.getCreator());
        }
        if (dto.getIsDirect() != null) {
            updateWrapper.set(ProductRequirement::getIsDirect, dto.getIsDirect());
        }

        this.update(updateWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProductRequirement(Long id) {
        ProductRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }
        this.removeById(id);
        saveLog(id, "delete", null, null, "删除产品需求: " + existing.getTitle());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void voidProductRequirement(Long id, String remark) {
        ProductRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }
        String oldStatus = existing.getStatus();
        existing.setStatus("closed");
        this.updateById(existing);
        saveLog(id, "status_change", "status", oldStatus, "closed", StrUtil.blankToDefault(remark, "产品需求作废"));
    }

    @Override
    public PageResult<ProductRequirementListVO> pageQuery(ProductRequirementQueryDTO queryDTO) {
        Page<ProductRequirement> page = new Page<>(queryDTO.getPage(), queryDTO.getSize());

        LambdaQueryWrapper<ProductRequirement> wrapper = buildQueryWrapper(queryDTO);

        Page<ProductRequirement> result = this.page(page, wrapper);

        List<ProductRequirementListVO> voList = result.getRecords().stream()
                .map(this::buildListVO)
                .collect(Collectors.toList());

        return new PageResult<>(result.getTotal(), voList, queryDTO.getPage(), queryDTO.getSize());
    }

    @Override
    public Map<String, List<ProductRequirementListVO>> groupedQuery(ProductRequirementQueryDTO queryDTO) {
        // 先查全量不分页
        LambdaQueryWrapper<ProductRequirement> wrapper = buildQueryWrapper(queryDTO);

        List<ProductRequirement> list = this.list(wrapper);

        List<ProductRequirementListVO> voList = list.stream()
                .map(this::buildListVO)
                .collect(Collectors.toList());

        // 按原始需求分组 (无原始需求则归入"直接创建需求")
        Map<String, List<ProductRequirementListVO>> result = new LinkedHashMap<>();
        List<ProductRequirementListVO> directList = new ArrayList<>();
        Map<Long, List<ProductRequirementListVO>> rawGroupMap = new LinkedHashMap<>();

        for (ProductRequirementListVO vo : voList) {
            if (vo.getRawReqId() != null) {
                rawGroupMap.computeIfAbsent(vo.getRawReqId(), k -> new ArrayList<>()).add(vo);
            } else {
                directList.add(vo);
            }
        }

        // 先放有直接父级的组
        for (Map.Entry<Long, List<ProductRequirementListVO>> entry : rawGroupMap.entrySet()) {
            String key = entry.getValue().get(0).getRawReqTitle();
            if (StrUtil.isBlank(key)) {
                key = "原始需求-" + entry.getKey();
            }
            result.put(key, entry.getValue());
        }

        // 最后放直接创建
        if (!directList.isEmpty()) {
            result.put("直接创建需求", directList);
        }

        return result;
    }

    @Override
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = this.count();
        long pendingDesign = this.count(new LambdaQueryWrapper<ProductRequirement>().eq(ProductRequirement::getStatus, "pending_design"));
        long designing = this.count(new LambdaQueryWrapper<ProductRequirement>().eq(ProductRequirement::getStatus, "designing"));
        long developing = this.count(new LambdaQueryWrapper<ProductRequirement>().eq(ProductRequirement::getStatus, "developing"));
        long suspended = this.count(new LambdaQueryWrapper<ProductRequirement>().eq(ProductRequirement::getStatus, "suspended"));
        long unscheduled = this.count(new LambdaQueryWrapper<ProductRequirement>().and(w -> w.isNull(ProductRequirement::getSprintId).or().eq(ProductRequirement::getSprintId, 0)));
        long direct = this.count(new LambdaQueryWrapper<ProductRequirement>().eq(ProductRequirement::getIsDirect, 1));

        stats.put("total", total);
        stats.put("pendingDesign", pendingDesign);
        stats.put("designing", designing);
        stats.put("developing", developing);
        stats.put("suspended", suspended);
        stats.put("unscheduled", unscheduled);
        stats.put("direct", direct);
        return stats;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ProductRequirementListVO> splitRequirement(SplitDTO dto) {
        RawRequirement rawReq = rawRequirementMapper.selectById(dto.getRawReqId());
        if (rawReq == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "原始需求不存在");
        }

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请至少添加一条产品需求");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentUsername = SecurityUtils.getCurrentUsername();
        List<ProductRequirementListVO> createdList = new ArrayList<>();
        int splitIndex = 1;

        for (SplitDTO.SplitItem item : dto.getItems()) {
            String title = StrUtil.trimToEmpty(item.getTitle());
            String description = StrUtil.trimToEmpty(item.getDescription());
            if (StrUtil.isAllBlank(title, description)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "拆分项标题和需求说明不能同时为空");
            }

            ProductRequirement productReq = new ProductRequirement();
            productReq.setTitle(resolveSplitTitle(rawReq, title, description, splitIndex));
            productReq.setDescription(StrUtil.isNotBlank(description) ? description : null);
            productReq.setPriority(item.getPriority() != null ? item.getPriority() : "P2");
            productReq.setBusinessLineId(item.getBusinessLineId());
            productReq.setHandler(StrUtil.isBlank(item.getHandler()) ? null : item.getHandler());
            productReq.setReqType(StrUtil.isBlank(item.getReqType()) ? null : item.getReqType());
            productReq.setRawReqId(dto.getRawReqId());
            productReq.setReqNo(generateReqNo());
            productReq.setStatus("pending_design");
            productReq.setIsDirect(0);
            productReq.setCreateBy(currentUserId);
            this.save(productReq);

            // 建立关联关系
            RequirementRelation relation = new RequirementRelation();
            relation.setSourceType("raw");
            relation.setSourceId(dto.getRawReqId());
            relation.setTargetType("product");
            relation.setTargetId(productReq.getId());
            relation.setRelationType("parent_child");
            relation.setCreateBy(currentUserId);
            requirementRelationMapper.insert(relation);

            // 记录产品需求创建日志
            saveLog(productReq.getId(), "create", null, null, "从原始需求[" + rawReq.getReqNo() + "]拆分创建");

            ProductRequirementListVO vo = new ProductRequirementListVO();
            BeanUtil.copyProperties(productReq, vo);
            vo.setStatusName(STATUS_NAME_MAP.getOrDefault(productReq.getStatus(), productReq.getStatus()));
            createdList.add(vo);
            splitIndex++;
        }

        // 更新原始需求状态为"已拆分"
        rawReq.setStatus("split");
        rawRequirementMapper.updateById(rawReq);

        // 记录原始需求日志
        RequirementLog rawLog = new RequirementLog();
        rawLog.setReqType("raw");
        rawLog.setReqId(dto.getRawReqId());
        rawLog.setOperatorId(currentUserId);
        rawLog.setOperatorName(currentUsername);
        rawLog.setAction("split");
        rawLog.setFieldName("status");
        rawLog.setOldValue(rawReq.getStatus());
        rawLog.setNewValue("split");
        rawLog.setRemark("需求拆分为" + dto.getItems().size() + "条产品需求");
        requirementLogMapper.insert(rawLog);

        return createdList;
    }

    private String resolveSplitTitle(RawRequirement rawReq, String title, String description, int splitIndex) {
        if (StrUtil.isNotBlank(title)) {
            return title;
        }
        if (StrUtil.isNotBlank(description)) {
            String normalized = StrUtil.replace(description, "\n", " ").trim();
            if (normalized.length() > 30) {
                return normalized.substring(0, 30) + "...";
            }
            return normalized;
        }
        return StrUtil.format("{}-拆分项{}", StrUtil.blankToDefault(rawReq.getTitle(), rawReq.getReqNo()), splitIndex);
    }

    @Override
    public List<RequirementLogVO> getLogs(Long id) {
        LambdaQueryWrapper<RequirementLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RequirementLog::getReqType, REQ_TYPE)
                .eq(RequirementLog::getReqId, id)
                .orderByDesc(RequirementLog::getCreateTime);

        List<RequirementLog> logs = requirementLogMapper.selectList(wrapper);

        return logs.stream().map(log -> {
            RequirementLogVO vo = new RequirementLogVO();
            BeanUtil.copyProperties(log, vo);
            vo.setActionName(ACTION_NAME_MAP.getOrDefault(log.getAction(), log.getAction()));
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<CommentVO> getComments(Long id) {
        LambdaQueryWrapper<RequirementComment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RequirementComment::getReqType, REQ_TYPE)
                .eq(RequirementComment::getReqId, id)
                .orderByAsc(RequirementComment::getCreateTime);

        List<RequirementComment> comments = requirementCommentMapper.selectList(wrapper);

        return comments.stream().map(comment -> {
            CommentVO vo = new CommentVO();
            BeanUtil.copyProperties(comment, vo);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addComment(Long id, CommentCreateDTO dto) {
        RequirementComment comment = new RequirementComment();
        comment.setReqType(REQ_TYPE);
        comment.setReqId(id);
        comment.setContent(dto.getContent());
        comment.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        comment.setUserId(SecurityUtils.getCurrentUserId());
        comment.setUserName(SecurityUtils.getCurrentUsername());
        requirementCommentMapper.insert(comment);

        saveLog(id, "comment", null, null, "添加评论");
    }

    @Override
    public List<SupplementVO> getSupplements(Long id) {
        LambdaQueryWrapper<RequirementSupplement> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RequirementSupplement::getReqType, REQ_TYPE)
                .eq(RequirementSupplement::getReqId, id)
                .orderByDesc(RequirementSupplement::getCreateTime);

        List<RequirementSupplement> supplements = requirementSupplementMapper.selectList(wrapper);

        return supplements.stream().map(sup -> {
            SupplementVO vo = new SupplementVO();
            BeanUtil.copyProperties(sup, vo);
            vo.setSupplementTypeName(SUPPLEMENT_TYPE_MAP.getOrDefault(sup.getSupplementType(), sup.getSupplementType()));
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addSupplement(Long id, SupplementCreateDTO dto) {
        RequirementSupplement supplement = new RequirementSupplement();
        supplement.setReqType(REQ_TYPE);
        supplement.setReqId(id);
        supplement.setSupplementType(dto.getSupplementType());
        supplement.setContent(dto.getContent());
        supplement.setAttachment(dto.getAttachment());
        supplement.setUserId(SecurityUtils.getCurrentUserId());
        supplement.setUserName(SecurityUtils.getCurrentUsername());
        requirementSupplementMapper.insert(supplement);

        saveLog(id, "supplement", null, null, "添加补充内容: " + SUPPLEMENT_TYPE_MAP.getOrDefault(dto.getSupplementType(), dto.getSupplementType()));
    }

    // ========== 私有方法 ==========

    private LambdaQueryWrapper<ProductRequirement> buildQueryWrapper(ProductRequirementQueryDTO queryDTO) {
        LambdaQueryWrapper<ProductRequirement> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(ProductRequirement::getStatus, queryDTO.getStatus());
        }
        if (StrUtil.isNotBlank(queryDTO.getPriority())) {
            wrapper.eq(ProductRequirement::getPriority, queryDTO.getPriority());
        }
        if (queryDTO.getBusinessLineId() != null) {
            wrapper.eq(ProductRequirement::getBusinessLineId, queryDTO.getBusinessLineId());
        }
        if (queryDTO.getAssigneeId() != null) {
            wrapper.eq(ProductRequirement::getAssigneeId, queryDTO.getAssigneeId());
        }
        if (queryDTO.getSprintId() != null) {
            wrapper.eq(ProductRequirement::getSprintId, queryDTO.getSprintId());
        }
        if (StrUtil.isNotBlank(queryDTO.getReqType())) {
            wrapper.eq(ProductRequirement::getReqType, queryDTO.getReqType());
        }
        if (StrUtil.isNotBlank(queryDTO.getHandler())) {
            wrapper.eq(ProductRequirement::getHandler, queryDTO.getHandler());
        }
        if (Boolean.TRUE.equals(queryDTO.getUnscheduled())) {
            wrapper.and(w -> w.isNull(ProductRequirement::getSprintId).or().eq(ProductRequirement::getSprintId, 0));
        }
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(ProductRequirement::getTitle, queryDTO.getKeyword())
                    .or().like(ProductRequirement::getDescription, queryDTO.getKeyword())
                    .or().like(ProductRequirement::getReqNo, queryDTO.getKeyword()));
        }

        wrapper.orderByDesc(ProductRequirement::getCreateTime);
        return wrapper;
    }

    private ProductRequirementListVO buildListVO(ProductRequirement entity) {
        ProductRequirementListVO vo = new ProductRequirementListVO();
        BeanUtil.copyProperties(entity, vo);
        vo.setStatusName(STATUS_NAME_MAP.getOrDefault(entity.getStatus(), entity.getStatus()));
        vo.setSprintName(resolveSprintName(entity.getSprintId()));
        vo.setBusinessLineName(resolveBusinessLineName(entity.getBusinessLineId()));
        vo.setAssigneeName(resolveAssigneeName(entity.getAssigneeId(), entity.getHandler()));
        vo.setCreateByName(resolveCreateByName(entity.getCreateBy(), entity.getCreator()));
        if (entity.getExpectedDate() != null) {
            vo.setExpectedDate(entity.getExpectedDate().atStartOfDay());
        }
        if (entity.getRawReqId() != null) {
            RawRequirement rawReq = rawRequirementMapper.selectById(entity.getRawReqId());
            if (rawReq != null) {
                vo.setRawReqTitle(rawReq.getTitle());
            }
        }
        return vo;
    }

    private String resolveSprintName(Long sprintId) {
        return sprintQueryService.getSprintName(sprintId);
    }

    private String resolveBusinessLineName(Long businessLineId) {
        if (businessLineId == null || businessLineId <= 0) {
            return null;
        }
        SysDictData dictData = sysDictDataMapper.selectOne(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getDictCode, "business_line")
                .eq(SysDictData::getValue, String.valueOf(businessLineId))
                .last("LIMIT 1"));
        return dictData != null ? dictData.getLabel() : null;
    }

    private String resolveAssigneeName(Long assigneeId, String fallbackHandler) {
        if (assigneeId != null && assigneeId > 0) {
            SysUser user = sysUserMapper.selectById(assigneeId);
            if (user != null) {
                return StrUtil.blankToDefault(user.getRealName(), user.getUsername());
            }
        }
        return StrUtil.isBlank(fallbackHandler) ? null : fallbackHandler;
    }

    private String resolveCreateByName(Long createBy, String fallbackCreator) {
        if (createBy != null && createBy > 0) {
            SysUser user = sysUserMapper.selectById(createBy);
            if (user != null) {
                return StrUtil.blankToDefault(user.getRealName(), user.getUsername());
            }
        }
        return StrUtil.isBlank(fallbackCreator) ? null : fallbackCreator;
    }

    private String generateReqNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PRD-" + dateStr + "-";

        LambdaQueryWrapper<ProductRequirement> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(ProductRequirement::getReqNo, prefix)
                .orderByDesc(ProductRequirement::getReqNo)
                .last("LIMIT 1");

        ProductRequirement last = this.getOne(wrapper, false);
        int seq = 1;
        if (last != null && last.getReqNo() != null) {
            String lastReqNo = last.getReqNo();
            String seqStr = lastReqNo.substring(lastReqNo.lastIndexOf("-") + 1);
            try {
                seq = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                seq = 1;
            }
        }

        return prefix + String.format("%03d", seq);
    }

    private void logFieldChanges(ProductRequirement existing, ProductRequirementUpdateDTO dto) {
        Map<String, String[]> fieldMap = new LinkedHashMap<>();
        fieldMap.put("title", new String[]{existing.getTitle(), dto.getTitle()});
        fieldMap.put("description", new String[]{existing.getDescription(), dto.getDescription()});
        fieldMap.put("priority", new String[]{existing.getPriority(), dto.getPriority()});
        fieldMap.put("productModule", new String[]{existing.getProductModule(), dto.getProductModule()});
        fieldMap.put("reqType", new String[]{existing.getReqType(), dto.getReqType()});
        fieldMap.put("workload", new String[]{existing.getWorkload(), dto.getWorkload()});
        fieldMap.put("expectedDate", new String[]{
                existing.getExpectedDate() != null ? existing.getExpectedDate().toString() : null,
                dto.getExpectedDate() != null ? dto.getExpectedDate().toString() : null});

        for (Map.Entry<String, String[]> entry : fieldMap.entrySet()) {
            String fieldName = entry.getKey();
            String oldValue = entry.getValue()[0];
            String newValue = entry.getValue()[1];
            if (newValue != null && !Objects.equals(oldValue, newValue)) {
                saveLog(existing.getId(), "update", fieldName, oldValue, newValue, null);
            }
        }
    }

    private void saveLog(Long reqId, String action, String fieldName, String oldValue, String remark) {
        saveLog(reqId, action, fieldName, oldValue, null, remark);
    }

    private void saveLog(Long reqId, String action, String fieldName, String oldValue, String newValue, String remark) {
        RequirementLog log = new RequirementLog();
        log.setReqType(REQ_TYPE);
        log.setReqId(reqId);
        log.setOperatorId(SecurityUtils.getCurrentUserId());
        log.setOperatorName(SecurityUtils.getCurrentUsername());
        log.setAction(action);
        log.setFieldName(fieldName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setRemark(remark);
        requirementLogMapper.insert(log);
    }
}
