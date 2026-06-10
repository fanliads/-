package com.reqmgmt.requirement.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.entity.*;
import com.reqmgmt.requirement.mapper.*;
import com.reqmgmt.requirement.service.PriorityAssessmentService;
import com.reqmgmt.requirement.service.RawRequirementService;
import com.reqmgmt.requirement.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 原始需求Service实现类
 */
@Service
@RequiredArgsConstructor
public class RawRequirementServiceImpl extends ServiceImpl<RawRequirementMapper, RawRequirement> implements RawRequirementService {

    private final RequirementLogMapper requirementLogMapper;
    private final RequirementCommentMapper requirementCommentMapper;
    private final RequirementSupplementMapper requirementSupplementMapper;
    private final RequirementRelationMapper requirementRelationMapper;
    private final ProductRequirementMapper productRequirementMapper;
    private final PriorityAssessmentService priorityAssessmentService;
    private final ObjectMapper objectMapper;

    private static final String REQ_TYPE = "raw";

    private static final Map<String, String> STATUS_NAME_MAP = new LinkedHashMap<>();
    private static final Map<String, String> ACTION_NAME_MAP = new LinkedHashMap<>();
    private static final Map<String, String> SUPPLEMENT_TYPE_MAP = new LinkedHashMap<>();

    static {
        STATUS_NAME_MAP.put("pending_evaluate", "待评估");
        STATUS_NAME_MAP.put("evaluating", "评估中");
        STATUS_NAME_MAP.put("pending_accept", "待承接");
        STATUS_NAME_MAP.put("accepted", "已承接");
        STATUS_NAME_MAP.put("pending_director", "待产品总监判定");
        STATUS_NAME_MAP.put("pending_design", "待设计");
        STATUS_NAME_MAP.put("designing", "设计中");
        STATUS_NAME_MAP.put("designed", "已设计");
        STATUS_NAME_MAP.put("developing", "开发中");
        STATUS_NAME_MAP.put("online", "已上线");
        STATUS_NAME_MAP.put("rejected", "已拒绝");
        STATUS_NAME_MAP.put("suspended", "已挂起");
        STATUS_NAME_MAP.put("split", "已拆分待跟进");
        STATUS_NAME_MAP.put("closed", "已关闭");

        ACTION_NAME_MAP.put("create", "创建");
        ACTION_NAME_MAP.put("update", "更新");
        ACTION_NAME_MAP.put("status_change", "状态变更");
        ACTION_NAME_MAP.put("assign", "指派");
        ACTION_NAME_MAP.put("delete", "删除");
        ACTION_NAME_MAP.put("comment", "评论");
        ACTION_NAME_MAP.put("supplement", "补充");

        SUPPLEMENT_TYPE_MAP.put("customer_background", "客户背景");
        SUPPLEMENT_TYPE_MAP.put("tech_detail", "技术细节");
        SUPPLEMENT_TYPE_MAP.put("scope_clarify", "范围澄清");
        SUPPLEMENT_TYPE_MAP.put("other", "其他");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createRawRequirement(RawRequirementCreateDTO dto) {
        if (StrUtil.isAllBlank(dto.getReqLink(), dto.getRemark())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "需求单链接和需求备注至少完善一项");
        }

        RawRequirement entity = new RawRequirement();
        BeanUtil.copyProperties(dto, entity);

        if (StrUtil.isBlank(entity.getSource())) {
            entity.setSource("内部");
        }
        if (StrUtil.isBlank(entity.getProposer())) {
            entity.setProposer(SecurityUtils.getCurrentUsername());
        }
        if (StrUtil.isBlank(entity.getRegisterName())) {
            entity.setRegisterName(SecurityUtils.getCurrentUsername());
        }

        // 生成编号 RAW-YYYYMMDD-NNN
        entity.setReqNo(generateReqNo());
        entity.setStatus("pending_evaluate");
        entity.setCreateBy(SecurityUtils.getCurrentUserId());
        if (entity.getPriority() == null) {
            entity.setPriority("P2");
        }
        if (entity.getIsNonFunctional() == null) {
            entity.setIsNonFunctional(0);
        }
        if (entity.getIsUrgent() == null) {
            entity.setIsUrgent(0);
        }
        if (dto.getAssessmentContext() != null) {
            entity.setAiAssessmentContext(writeAssessmentContext(dto.getAssessmentContext()));
        }

        this.save(entity);

        // 记录日志
        saveLog(entity.getId(), "create", null, null, "创建原始需求");
        priorityAssessmentService.assessOnCreate(entity);

        return entity.getId();
    }

    @Override
    public RawRequirementDetailVO getDetail(Long id) {
        RawRequirement entity = this.getById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }

        RawRequirementDetailVO vo = new RawRequirementDetailVO();
        BeanUtil.copyProperties(entity, vo);
        vo.setStatusName(STATUS_NAME_MAP.getOrDefault(entity.getStatus(), entity.getStatus()));

        // 获取补充内容
        vo.setSupplements(getSupplements(id));

        // 获取关联的产品需求
        vo.setLinkedProducts(getLinkedProducts(id));
        vo.setLatestPriorityAssessment(priorityAssessmentService.getLatestAssessment(id));

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRawRequirement(Long id, RawRequirementUpdateDTO dto) {
        RawRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }

        // 记录字段变更日志
        logFieldChanges(existing, dto);

        // 更新非空字段
        LambdaUpdateWrapper<RawRequirement> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(RawRequirement::getId, id);

        if (dto.getTitle() != null) {
            updateWrapper.set(RawRequirement::getTitle, dto.getTitle());
        }
        if (dto.getDescription() != null) {
            updateWrapper.set(RawRequirement::getDescription, dto.getDescription());
        }
        if (dto.getSource() != null) {
            updateWrapper.set(RawRequirement::getSource, dto.getSource());
        }
        if (dto.getProposer() != null) {
            updateWrapper.set(RawRequirement::getProposer, dto.getProposer());
        }
        if (dto.getProposerContact() != null) {
            updateWrapper.set(RawRequirement::getProposerContact, dto.getProposerContact());
        }
        if (dto.getProjectName() != null) {
            updateWrapper.set(RawRequirement::getProjectName, dto.getProjectName());
        }
        if (dto.getReqLink() != null) {
            updateWrapper.set(RawRequirement::getReqLink, dto.getReqLink());
        }
        if (dto.getPriority() != null) {
            updateWrapper.set(RawRequirement::getPriority, dto.getPriority());
        }
        if (dto.getExpectedDate() != null) {
            updateWrapper.set(RawRequirement::getExpectedDate, dto.getExpectedDate());
        }
        if (dto.getReqType() != null) {
            updateWrapper.set(RawRequirement::getReqType, dto.getReqType());
        }
        if (dto.getAttachment() != null) {
            updateWrapper.set(RawRequirement::getAttachment, dto.getAttachment());
        }
        if (dto.getRemark() != null) {
            updateWrapper.set(RawRequirement::getRemark, dto.getRemark());
        }
        if (dto.getBusinessLine() != null) {
            updateWrapper.set(RawRequirement::getBusinessLine, dto.getBusinessLine());
        }
        if (dto.getBusinessLineId() != null) {
            updateWrapper.set(RawRequirement::getBusinessLineId, dto.getBusinessLineId());
        }
        if (dto.getRegisterName() != null) {
            updateWrapper.set(RawRequirement::getRegisterName, dto.getRegisterName());
        }
        if (dto.getProposeTime() != null) {
            updateWrapper.set(RawRequirement::getProposeTime, dto.getProposeTime());
        }
        if (dto.getProductDefinition() != null) {
            updateWrapper.set(RawRequirement::getProductDefinition, dto.getProductDefinition());
        }
        if (dto.getProductManager() != null) {
            updateWrapper.set(RawRequirement::getProductManager, dto.getProductManager());
        }
        if (dto.getProjectManager() != null) {
            updateWrapper.set(RawRequirement::getProjectManager, dto.getProjectManager());
        }
        if (dto.getIsUrgent() != null) {
            updateWrapper.set(RawRequirement::getIsUrgent, dto.getIsUrgent());
        }
        if (dto.getUrgentReason() != null) {
            updateWrapper.set(RawRequirement::getUrgentReason, dto.getUrgentReason());
        }
        if (dto.getExpectedOnlineDate() != null) {
            updateWrapper.set(RawRequirement::getExpectedOnlineDate, dto.getExpectedOnlineDate());
        }
        if (dto.getValueAssessment() != null) {
            updateWrapper.set(RawRequirement::getValueAssessment, dto.getValueAssessment());
        }
        if (dto.getAssessmentContext() != null) {
            updateWrapper.set(RawRequirement::getAiAssessmentContext, writeAssessmentContext(dto.getAssessmentContext()));
        }
        if (dto.getAssigneeId() != null) {
            Long oldAssigneeId = existing.getAssigneeId();
            updateWrapper.set(RawRequirement::getAssigneeId, dto.getAssigneeId());
            // 如果指派人变更，记录日志
            if (!Objects.equals(oldAssigneeId, dto.getAssigneeId())) {
                saveLog(id, "assign", "assigneeId",
                        oldAssigneeId != null ? oldAssigneeId.toString() : null,
                        dto.getAssigneeId().toString(), null);
            }
        }
        if (dto.getStatus() != null) {
            String oldStatus = existing.getStatus();
            updateWrapper.set(RawRequirement::getStatus, dto.getStatus());
            if (!Objects.equals(oldStatus, dto.getStatus())) {
                saveLog(id, "status_change", "status", oldStatus, dto.getStatus(), null);
            }
        }

        this.update(updateWrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRawRequirement(Long id) {
        RawRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }
        this.removeById(id);
        saveLog(id, "delete", null, null, "删除原始需求: " + existing.getTitle());
    }

    @Override
    public PageResult<RawRequirementListVO> pageQuery(RawRequirementQueryDTO queryDTO) {
        Page<RawRequirement> page = new Page<>(queryDTO.getPage(), queryDTO.getSize());

        LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();

        // 动态条件
        if (StrUtil.isNotBlank(queryDTO.getStatus())) {
            wrapper.eq(RawRequirement::getStatus, queryDTO.getStatus());
        }
        if (StrUtil.isNotBlank(queryDTO.getPriority())) {
            wrapper.eq(RawRequirement::getPriority, queryDTO.getPriority());
        }
        if (StrUtil.isNotBlank(queryDTO.getSource())) {
            wrapper.eq(RawRequirement::getSource, queryDTO.getSource());
        }
        if (queryDTO.getBusinessLineId() != null) {
            wrapper.eq(RawRequirement::getBusinessLineId, queryDTO.getBusinessLineId());
        }
        if (StrUtil.isNotBlank(queryDTO.getBusinessLine())) {
            wrapper.eq(RawRequirement::getBusinessLine, queryDTO.getBusinessLine());
        }
        if (StrUtil.isNotBlank(queryDTO.getRegisterName())) {
            wrapper.like(RawRequirement::getRegisterName, queryDTO.getRegisterName());
        }
        if (StrUtil.isNotBlank(queryDTO.getProjectManager())) {
            wrapper.eq(RawRequirement::getProjectManager, queryDTO.getProjectManager());
        }
        if (StrUtil.isNotBlank(queryDTO.getProductManager())) {
            wrapper.eq(RawRequirement::getProductManager, queryDTO.getProductManager());
        }
        if (queryDTO.getIsUrgent() != null) {
            wrapper.eq(RawRequirement::getIsUrgent, queryDTO.getIsUrgent());
        }
        if (queryDTO.getAssigneeId() != null) {
            wrapper.eq(RawRequirement::getAssigneeId, queryDTO.getAssigneeId());
        }
        if (StrUtil.isNotBlank(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(RawRequirement::getTitle, queryDTO.getKeyword())
                    .or().like(RawRequirement::getDescription, queryDTO.getKeyword())
                    .or().like(RawRequirement::getReqNo, queryDTO.getKeyword()));
        }
        if (StrUtil.isNotBlank(queryDTO.getStartDate())) {
            wrapper.ge(RawRequirement::getCreateTime, queryDTO.getStartDate() + " 00:00:00");
        }
        if (StrUtil.isNotBlank(queryDTO.getEndDate())) {
            wrapper.le(RawRequirement::getCreateTime, queryDTO.getEndDate() + " 23:59:59");
        }

        // 排序
        if (StrUtil.isNotBlank(queryDTO.getSortField()) && StrUtil.isNotBlank(queryDTO.getSortOrder())) {
            boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getSortOrder());
            switch (queryDTO.getSortField()) {
                case "createTime":
                    wrapper.orderBy(true, isAsc, RawRequirement::getCreateTime);
                    break;
                case "priority":
                    wrapper.orderBy(true, isAsc, RawRequirement::getPriority);
                    break;
                case "status":
                    wrapper.orderBy(true, isAsc, RawRequirement::getStatus);
                    break;
                default:
                    wrapper.orderByDesc(RawRequirement::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(RawRequirement::getCreateTime);
        }

        Page<RawRequirement> result = this.page(page, wrapper);

        // 转换为VO
        List<RawRequirementListVO> voList = result.getRecords().stream().map(entity -> {
            RawRequirementListVO vo = new RawRequirementListVO();
            BeanUtil.copyProperties(entity, vo);
            vo.setStatusName(STATUS_NAME_MAP.getOrDefault(entity.getStatus(), entity.getStatus()));
            if (entity.getExpectedDate() != null) {
                vo.setExpectedDate(entity.getExpectedDate().atStartOfDay());
            }
            return vo;
        }).collect(Collectors.toList());

        return new PageResult<>(result.getTotal(), voList, queryDTO.getPage(), queryDTO.getSize());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchChangeStatus(BatchStatusDTO dto) {
        List<RawRequirement> requirements = this.listByIds(dto.getIds());
        if (requirements.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "未找到对应需求");
        }

        for (RawRequirement req : requirements) {
            String oldStatus = req.getStatus();
            req.setStatus(dto.getTargetStatus());
            this.updateById(req);
            saveLog(req.getId(), "status_change", "status", oldStatus, dto.getTargetStatus(), dto.getRemark());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchAssign(BatchAssignDTO dto) {
        List<RawRequirement> requirements = this.listByIds(dto.getIds());
        if (requirements.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "未找到对应需求");
        }

        for (RawRequirement req : requirements) {
            Long oldAssigneeId = req.getAssigneeId();
            req.setAssigneeId(dto.getAssigneeId());
            this.updateById(req);
            saveLog(req.getId(), "assign", "assigneeId",
                    oldAssigneeId != null ? oldAssigneeId.toString() : null,
                    dto.getAssigneeId().toString(), null);
        }
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PriorityAssessmentVO reassessPriority(Long id, PriorityAssessmentContextDTO context) {
        return priorityAssessmentService.reassess(id, context);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void overridePriority(Long id, PriorityOverrideDTO dto) {
        RawRequirement existing = this.getById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }

        LambdaUpdateWrapper<RawRequirement> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(RawRequirement::getId, id)
                .set(RawRequirement::getEffectiveLevel, dto.getEffectiveLevel())
                .set(RawRequirement::getOverrideFlag, 1)
                .set(RawRequirement::getOverrideReason, dto.getOverrideReason())
                .set(RawRequirement::getOverrideBy, SecurityUtils.getCurrentUserId())
                .set(RawRequirement::getOverrideTime, java.time.LocalDateTime.now());
        this.update(updateWrapper);

        saveLog(id, "priority_override", "effectiveLevel", existing.getEffectiveLevel(), dto.getEffectiveLevel(), dto.getOverrideReason());
    }

    private static final Map<String, String> PRODUCT_STATUS_NAME_MAP = new LinkedHashMap<>();
    static {
        PRODUCT_STATUS_NAME_MAP.put("pending_assign", "待分配");
        PRODUCT_STATUS_NAME_MAP.put("in_design", "设计中");
        PRODUCT_STATUS_NAME_MAP.put("in_review", "评审中");
        PRODUCT_STATUS_NAME_MAP.put("in_dev", "开发中");
        PRODUCT_STATUS_NAME_MAP.put("in_test", "测试中");
        PRODUCT_STATUS_NAME_MAP.put("ready_release", "待发布");
        PRODUCT_STATUS_NAME_MAP.put("released", "已发布");
        PRODUCT_STATUS_NAME_MAP.put("closed", "已关闭");
    }

    private List<ProductRequirementListVO> getLinkedProducts(Long rawReqId) {
        LambdaQueryWrapper<RequirementRelation> relWrapper = new LambdaQueryWrapper<>();
        relWrapper.eq(RequirementRelation::getSourceType, "raw")
                .eq(RequirementRelation::getSourceId, rawReqId)
                .eq(RequirementRelation::getTargetType, "product")
                .eq(RequirementRelation::getRelationType, "parent_child");
        List<RequirementRelation> relations = requirementRelationMapper.selectList(relWrapper);
        if (relations.isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> productIds = relations.stream().map(RequirementRelation::getTargetId).collect(Collectors.toList());
        List<ProductRequirement> products = productRequirementMapper.selectBatchIds(productIds);
        return products.stream().map(entity -> {
            ProductRequirementListVO vo = new ProductRequirementListVO();
            BeanUtil.copyProperties(entity, vo);
            vo.setStatusName(PRODUCT_STATUS_NAME_MAP.getOrDefault(entity.getStatus(), entity.getStatus()));
            return vo;
        }).collect(Collectors.toList());
    }

    // ========== 私有方法 ==========

    /**
     * 生成需求编号 RAW-YYYYMMDD-NNN
     */
    private String generateReqNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "RAW-" + dateStr + "-";

        // 查询当天最大编号
        LambdaQueryWrapper<RawRequirement> wrapper = new LambdaQueryWrapper<>();
        wrapper.likeRight(RawRequirement::getReqNo, prefix)
                .orderByDesc(RawRequirement::getReqNo)
                .last("LIMIT 1");

        RawRequirement last = this.getOne(wrapper, false);
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

    /**
     * 记录字段变更日志
     */
    private void logFieldChanges(RawRequirement existing, RawRequirementUpdateDTO dto) {
        Map<String, String[]> fieldMap = new LinkedHashMap<>();
        fieldMap.put("title", new String[]{existing.getTitle(), dto.getTitle()});
        fieldMap.put("description", new String[]{existing.getDescription(), dto.getDescription()});
        fieldMap.put("source", new String[]{existing.getSource(), dto.getSource()});
        fieldMap.put("proposer", new String[]{existing.getProposer(), dto.getProposer()});
        fieldMap.put("proposerContact", new String[]{existing.getProposerContact(), dto.getProposerContact()});
        fieldMap.put("projectName", new String[]{existing.getProjectName(), dto.getProjectName()});
        fieldMap.put("reqLink", new String[]{existing.getReqLink(), dto.getReqLink()});
        fieldMap.put("priority", new String[]{existing.getPriority(), dto.getPriority()});
        fieldMap.put("expectedDate", new String[]{
                existing.getExpectedDate() != null ? existing.getExpectedDate().toString() : null,
                dto.getExpectedDate() != null ? dto.getExpectedDate().toString() : null});
        fieldMap.put("reqType", new String[]{existing.getReqType(), dto.getReqType()});
        fieldMap.put("remark", new String[]{existing.getRemark(), dto.getRemark()});
        fieldMap.put("businessLine", new String[]{existing.getBusinessLine(), dto.getBusinessLine()});
        fieldMap.put("registerName", new String[]{existing.getRegisterName(), dto.getRegisterName()});
        fieldMap.put("productDefinition", new String[]{existing.getProductDefinition(), dto.getProductDefinition()});
        fieldMap.put("productManager", new String[]{existing.getProductManager(), dto.getProductManager()});
        fieldMap.put("projectManager", new String[]{existing.getProjectManager(), dto.getProjectManager()});
        fieldMap.put("isUrgent", new String[]{existing.getIsUrgent() != null ? existing.getIsUrgent().toString() : null, dto.getIsUrgent() != null ? dto.getIsUrgent().toString() : null});
        fieldMap.put("urgentReason", new String[]{existing.getUrgentReason(), dto.getUrgentReason()});
        fieldMap.put("expectedOnlineDate", new String[]{
                existing.getExpectedOnlineDate() != null ? existing.getExpectedOnlineDate().toString() : null,
                dto.getExpectedOnlineDate() != null ? dto.getExpectedOnlineDate().toString() : null});
        fieldMap.put("valueAssessment", new String[]{existing.getValueAssessment(), dto.getValueAssessment()});

        for (Map.Entry<String, String[]> entry : fieldMap.entrySet()) {
            String fieldName = entry.getKey();
            String oldValue = entry.getValue()[0];
            String newValue = entry.getValue()[1];
            if (newValue != null && !Objects.equals(oldValue, newValue)) {
                saveLog(existing.getId(), "update", fieldName, oldValue, newValue, null);
            }
        }
    }

    /**
     * 保存操作日志（简化版）
     */
    private void saveLog(Long reqId, String action, String fieldName, String oldValue, String remark) {
        saveLog(reqId, action, fieldName, oldValue, null, remark);
    }

    /**
     * 保存操作日志（完整版）
     */
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

    private String writeAssessmentContext(PriorityAssessmentContextDTO context) {
        try {
            return objectMapper.writeValueAsString(context);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "AI评定上下文保存失败");
        }
    }
}
