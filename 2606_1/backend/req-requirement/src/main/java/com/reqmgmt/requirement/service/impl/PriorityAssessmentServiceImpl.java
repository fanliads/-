package com.reqmgmt.requirement.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.dto.PriorityAssessmentContextDTO;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.entity.RequirementLog;
import com.reqmgmt.requirement.mapper.RawRequirementMapper;
import com.reqmgmt.requirement.mapper.RequirementLogMapper;
import com.reqmgmt.requirement.service.PriorityAssessmentService;
import com.reqmgmt.requirement.service.ai.AIProvider;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentPayload;
import com.reqmgmt.requirement.service.ai.PriorityAssessmentResult;
import com.reqmgmt.requirement.vo.PriorityAssessmentVO;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.service.SysUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriorityAssessmentServiceImpl implements PriorityAssessmentService {

    private static final String REQ_TYPE = "raw";
    private static final String ACTION = "ai_priority_assessment";
    private static final Long EXTERNAL_OPERATOR_ID = 0L;
    private static final String EXTERNAL_OPERATOR_NAME = "外部提报用户";
    private static final String LEVEL_P0 = "P0";
    private static final String LEVEL_P1 = "P1";
    private static final String LEVEL_P2 = "P2";
    private static final String LEVEL_P3 = "P3";

    private static final List<String> REQUIRED_CONTEXT_FIELDS = List.of(
            "projectName", "customerName", "contractNo", "contractAmount", "deliveryRisk",
            "paymentRisk", "acceptanceRisk", "securityOrComplianceRisk", "majorIncidentRisk",
            "govSupervision", "strategicCustomer", "coreProductLine", "projectType", "reusability",
            "benchmarkCase", "contractScope", "rigidDeliveryDate", "estimatedWorkload", "businessOwner", "specialRemark"
    );
    private static final List<String> CRITICAL_CONTEXT_FIELDS = List.of(
            "projectName", "customerName", "projectType", "rigidDeliveryDate"
    );

    private final RawRequirementMapper rawRequirementMapper;
    private final RequirementLogMapper requirementLogMapper;
    private final AIProvider aiProvider;
    private final ObjectMapper objectMapper;
    private final SysUserService sysUserService;

    @Value("${ai.priority.rules-text:按固定业务规则输出一级A类（P0）、一级B类（P1）、二级（P2）、三级（P3），AI仅做解释增强。}")
    private String rulesText;

    @Override
    public PriorityAssessmentVO assessOnCreate(RawRequirement rawRequirement) {
        PriorityAssessmentContextDTO context = parseContext(rawRequirement.getAiAssessmentContext());
        return doAssess(rawRequirement, context, "auto_create");
    }

    @Override
    public PriorityAssessmentVO reassess(Long rawRequirementId, PriorityAssessmentContextDTO context) {
        RawRequirement rawRequirement = rawRequirementMapper.selectById(rawRequirementId);
        if (rawRequirement == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "需求不存在");
        }
        return doAssess(rawRequirement, context, "manual_reassess");
    }

    @Override
    public PriorityAssessmentVO getLatestAssessment(Long rawRequirementId) {
        RequirementLog latest = requirementLogMapper.selectOne(new LambdaQueryWrapper<RequirementLog>()
                .eq(RequirementLog::getReqType, REQ_TYPE)
                .eq(RequirementLog::getReqId, rawRequirementId)
                .eq(RequirementLog::getAction, ACTION)
                .orderByDesc(RequirementLog::getCreateTime)
                .last("LIMIT 1"));
        if (latest == null) {
            return null;
        }

        RawRequirement requirement = rawRequirementMapper.selectById(rawRequirementId);
        PriorityAssessmentVO vo = new PriorityAssessmentVO();
        if (requirement != null) {
            vo.setPriority(requirement.getPriority());
            vo.setPriorityLabel(toLevelLabel(requirement.getPriority()));
            vo.setSystemLevel(requirement.getSystemLevel());
            vo.setSystemLevelLabel(toLevelLabel(requirement.getSystemLevel()));
            vo.setEffectiveLevel(requirement.getEffectiveLevel());
            vo.setEffectiveLevelLabel(toLevelLabel(requirement.getEffectiveLevel()));
            vo.setStrategyHint(requirement.getStrategyHint());
            vo.setRuleHits(parseStringList(requirement.getRuleHits()));
            vo.setReason(StrUtil.blankToDefault(requirement.getExplanationSummary(), latest.getRemark()));
            vo.setMissingFields(parseStringList(requirement.getMissingFields()));
            vo.setOverrideFlag(requirement.getOverrideFlag() != null && requirement.getOverrideFlag() == 1);
            vo.setOverrideReason(requirement.getOverrideReason());
            vo.setOverrideTime(requirement.getOverrideTime());
            vo.setOverrideBy(resolveUserDisplayName(requirement.getOverrideBy()));
        } else {
            vo.setPriority(latest.getNewValue());
            vo.setPriorityLabel(toLevelLabel(latest.getNewValue()));
            vo.setReason(latest.getRemark());
        }
        vo.setSource(latest.getFieldName());
        vo.setSuccess(true);
        vo.setAssessedAt(latest.getCreateTime());
        if (StrUtil.isNotBlank(latest.getOldValue())) {
            try {
                Map<String, Object> meta = objectMapper.readValue(latest.getOldValue(), new TypeReference<>() {});
                vo.setTraceSummary(String.valueOf(meta.getOrDefault("traceSummary", "")));
            } catch (Exception e) {
                vo.setTraceSummary(latest.getOldValue());
            }
        }
        return vo;
    }

    private PriorityAssessmentVO doAssess(RawRequirement rawRequirement, PriorityAssessmentContextDTO overrideContext, String triggerSource) {
        PriorityAssessmentContextDTO effectiveContext = mergeContext(parseContext(rawRequirement.getAiAssessmentContext()), overrideContext);
        String contextJson = writeContext(effectiveContext);
        List<String> missingFields = collectMissingFields(rawRequirement, effectiveContext);
        boolean incomplete = hasCriticalMissingFields(missingFields);

        RuleEvaluation evaluation = evaluateRule(effectiveContext);
        PriorityAssessmentResult aiResult = aiProvider.assessPriority(PriorityAssessmentPayload.builder()
                .requirementId(rawRequirement.getId())
                .title(rawRequirement.getTitle())
                .description(rawRequirement.getDescription())
                .source(rawRequirement.getSource())
                .businessLine(rawRequirement.getBusinessLine())
                .expectedOnlineDate(rawRequirement.getExpectedOnlineDate() != null ? rawRequirement.getExpectedOnlineDate().toString() : null)
                .currentLevel(evaluation.level())
                .currentLevelLabel(toLevelLabel(evaluation.level()))
                .strategyHint(evaluation.strategyHint())
                .ruleHits(evaluation.ruleHits())
                .context(buildContextMap(rawRequirement, effectiveContext))
                .rulesText(rulesText)
                .build());

        String explanation = buildExplanation(evaluation, aiResult, missingFields, incomplete);
        persistAssessment(rawRequirement, contextJson, evaluation, explanation, aiResult, missingFields, triggerSource);

        PriorityAssessmentVO vo = new PriorityAssessmentVO();
        vo.setPriority(evaluation.level());
        vo.setPriorityLabel(toLevelLabel(evaluation.level()));
        vo.setSystemLevel(evaluation.level());
        vo.setSystemLevelLabel(toLevelLabel(evaluation.level()));
        vo.setEffectiveLevel(evaluation.level());
        vo.setEffectiveLevelLabel(toLevelLabel(evaluation.level()));
        vo.setStrategyHint(evaluation.strategyHint());
        vo.setRuleHits(evaluation.ruleHits());
        vo.setReason(explanation);
        vo.setTraceSummary(aiResult.getTraceSummary());
        vo.setSource(StrUtil.blankToDefault(aiResult.getSource(), "rule-engine"));
        vo.setSuccess(!incomplete);
        vo.setMissingFields(missingFields);
        vo.setOverrideFlag(rawRequirement.getOverrideFlag() != null && rawRequirement.getOverrideFlag() == 1);
        vo.setAssessedAt(LocalDateTime.now());
        return vo;
    }

    private void persistAssessment(RawRequirement rawRequirement, String contextJson, RuleEvaluation evaluation,
                                   String explanation, PriorityAssessmentResult aiResult,
                                   List<String> missingFields, String triggerSource) {
        String effectiveLevel = rawRequirement.getOverrideFlag() != null && rawRequirement.getOverrideFlag() == 1
                && StrUtil.isNotBlank(rawRequirement.getEffectiveLevel())
                ? rawRequirement.getEffectiveLevel()
                : evaluation.level();

        LambdaUpdateWrapper<RawRequirement> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(RawRequirement::getId, rawRequirement.getId())
                .set(RawRequirement::getAiAssessmentContext, contextJson)
                .set(RawRequirement::getPriority, evaluation.level())
                .set(RawRequirement::getSystemLevel, evaluation.level())
                .set(RawRequirement::getEffectiveLevel, effectiveLevel)
                .set(RawRequirement::getStrategyHint, evaluation.strategyHint())
                .set(RawRequirement::getRuleHits, writeStringList(evaluation.ruleHits()))
                .set(RawRequirement::getExplanationSummary, explanation)
                .set(RawRequirement::getMissingFields, writeStringList(missingFields));
        rawRequirementMapper.update(null, updateWrapper);

        RequirementLog log = new RequirementLog();
        log.setReqType(REQ_TYPE);
        log.setReqId(rawRequirement.getId());
        log.setOperatorId(resolveOperatorId());
        log.setOperatorName(resolveOperatorName());
        log.setAction(ACTION);
        log.setFieldName(StrUtil.blankToDefault(aiResult.getSource(), triggerSource));
        log.setOldValue(writeMeta(triggerSource, evaluation, aiResult, missingFields));
        log.setNewValue(evaluation.level());
        log.setRemark(explanation);
        requirementLogMapper.insert(log);
    }

    private String buildExplanation(RuleEvaluation evaluation, PriorityAssessmentResult aiResult,
                                    List<String> missingFields, boolean incomplete) {
        StringBuilder sb = new StringBuilder();
        if (incomplete) {
            sb.append("信息不足，当前按已知字段给出暂定分级");
        }
        if (!evaluation.ruleHits().isEmpty()) {
            if (!sb.isEmpty()) {
                sb.append("；");
            }
            sb.append("命中规则：").append(String.join("；", evaluation.ruleHits()));
        }
        if (StrUtil.isNotBlank(evaluation.strategyHint())) {
            if (!sb.isEmpty()) {
                sb.append("；");
            }
            sb.append("处理策略：").append(evaluation.strategyHint());
        }
        if (StrUtil.isNotBlank(aiResult.getReason())) {
            if (!sb.isEmpty()) {
                sb.append("；");
            }
            sb.append(aiResult.getReason());
        }
        if (!missingFields.isEmpty()) {
            if (!sb.isEmpty()) {
                sb.append("；");
            }
            sb.append("缺失字段: ").append(String.join(", ", missingFields));
        }
        return sb.toString();
    }

    private String writeMeta(String triggerSource, RuleEvaluation evaluation, PriorityAssessmentResult result, List<String> missingFields) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "triggerSource", triggerSource,
                    "traceSummary", StrUtil.blankToDefault(result.getTraceSummary(), ""),
                    "rawTraceId", StrUtil.blankToDefault(result.getRawTraceId(), ""),
                    "missingFields", missingFields,
                    "ruleHits", evaluation.ruleHits(),
                    "strategyHint", StrUtil.blankToDefault(evaluation.strategyHint(), "")
            ));
        } catch (Exception e) {
            return StrUtil.blankToDefault(result.getTraceSummary(), triggerSource);
        }
    }

    private List<String> collectMissingFields(RawRequirement rawRequirement, PriorityAssessmentContextDTO context) {
        List<String> missing = new ArrayList<>();
        if (StrUtil.isBlank(rawRequirement.getTitle())) {
            missing.add("title");
        }
        if (StrUtil.isBlank(rawRequirement.getDescription())) {
            missing.add("description");
        }
        Map<String, Object> contextMap = buildContextMap(rawRequirement, context);
        for (String field : REQUIRED_CONTEXT_FIELDS) {
            Object value = contextMap.get(field);
            if (value == null || StrUtil.isBlank(String.valueOf(value))) {
                missing.add(field);
            }
        }
        return missing;
    }

    private boolean hasCriticalMissingFields(List<String> missingFields) {
        if (missingFields == null || missingFields.isEmpty()) {
            return false;
        }
        return missingFields.stream().anyMatch(CRITICAL_CONTEXT_FIELDS::contains);
    }

    private RuleEvaluation evaluateRule(PriorityAssessmentContextDTO context) {
        List<String> hits = new ArrayList<>();
        if (isYes(context.getDeliveryRisk()) || isYes(context.getPaymentRisk()) || isYes(context.getAcceptanceRisk())) {
            hits.add("存在履约/回款/验收风险");
        }
        if (isYes(context.getSecurityOrComplianceRisk()) || isYes(context.getMajorIncidentRisk())) {
            hits.add("涉及安全/合规/重大故障");
        }
        if (isYes(context.getGovSupervision())) {
            hits.add("省级硬性督办");
        }
        if (!hits.isEmpty()) {
            return new RuleEvaluation(LEVEL_P0, "紧急红线、资源优先保障、可加急", hits);
        }

        hits = new ArrayList<>();
        if (isYes(context.getStrategicCustomer())) {
            hits.add("战略项目/标杆客户");
        }
        if (containsAnyKeyword(context.getProjectType(), "战略项目", "标杆项目")) {
            hits.add("战略项目");
        }
        if (isYes(context.getCoreProductLine())) {
            hits.add("核心产品线迭代");
        }
        if (!hits.isEmpty()) {
            return new RuleEvaluation(LEVEL_P1, "战略迭代、纳入月度计划、禁止临时插单", hits);
        }

        hits = new ArrayList<>();
        if (containsKeyword(context.getProjectType(), "常规营收")) {
            hits.add("常规营收项目");
        }
        if (containsAnyKeyword(context.getReusability(), "可复用", "复用", "技术建设")) {
            hits.add("可复用技术建设");
        }
        if (!hits.isEmpty()) {
            return new RuleEvaluation(LEVEL_P2, "正常均衡排期、按项目价值优先", hits);
        }

        hits = new ArrayList<>();
        if (containsKeyword(context.getProjectType(), "专属定制")) {
            hits.add("专属定制");
        }
        if (isYes(context.getBenchmarkCase()) || containsAnyKeyword(context.getBenchmarkCase(), "未签约样板", "样板")) {
            hits.add("未签约样板");
        }
        if (!hasRigidDeliveryDate(context.getRigidDeliveryDate())) {
            hits.add("无刚性节点");
        }
        return new RuleEvaluation(LEVEL_P3, "错峰处理、不占用主线资源、不加急", hits);
    }

    private Map<String, Object> buildContextMap(RawRequirement rawRequirement, PriorityAssessmentContextDTO context) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("projectName", StrUtil.blankToDefault(context.getProjectName(), rawRequirement.getProjectName()));
        map.put("customerName", context.getCustomerName());
        map.put("contractNo", context.getContractNo());
        map.put("contractAmount", context.getContractAmount());
        map.put("deliveryRisk", context.getDeliveryRisk());
        map.put("paymentRisk", context.getPaymentRisk());
        map.put("acceptanceRisk", context.getAcceptanceRisk());
        map.put("securityOrComplianceRisk", context.getSecurityOrComplianceRisk());
        map.put("majorIncidentRisk", context.getMajorIncidentRisk());
        map.put("govSupervision", context.getGovSupervision());
        map.put("strategicCustomer", context.getStrategicCustomer());
        map.put("coreProductLine", context.getCoreProductLine());
        map.put("projectType", context.getProjectType());
        map.put("reusability", context.getReusability());
        map.put("benchmarkCase", context.getBenchmarkCase());
        map.put("contractScope", context.getContractScope());
        map.put("rigidDeliveryDate", context.getRigidDeliveryDate());
        map.put("estimatedWorkload", context.getEstimatedWorkload());
        map.put("businessOwner", context.getBusinessOwner());
        map.put("expectedOnlineTime", context.getExpectedOnlineTime());
        map.put("specialRemark", StrUtil.blankToDefault(context.getSpecialRemark(), rawRequirement.getRemark()));
        return map;
    }

    private PriorityAssessmentContextDTO mergeContext(PriorityAssessmentContextDTO existing, PriorityAssessmentContextDTO overrideContext) {
        PriorityAssessmentContextDTO merged = existing != null ? existing : new PriorityAssessmentContextDTO();
        if (overrideContext != null) {
            BeanUtil.copyProperties(overrideContext, merged, "class");
        }
        return merged;
    }

    private PriorityAssessmentContextDTO parseContext(String contextJson) {
        if (StrUtil.isBlank(contextJson)) {
            return new PriorityAssessmentContextDTO();
        }
        try {
            return objectMapper.readValue(contextJson, PriorityAssessmentContextDTO.class);
        } catch (Exception e) {
            log.warn("解析优先级评定上下文失败");
            return new PriorityAssessmentContextDTO();
        }
    }

    private String writeContext(PriorityAssessmentContextDTO context) {
        try {
            return objectMapper.writeValueAsString(context);
        } catch (Exception e) {
            throw new IllegalStateException("写入优先级评定上下文失败", e);
        }
    }

    private String writeStringList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values != null ? values : List.of());
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> parseStringList(String value) {
        if (StrUtil.isBlank(value)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of(value);
        }
    }

    private String toLevelLabel(String level) {
        if (LEVEL_P0.equalsIgnoreCase(level)) return "一级A类（P0）";
        if (LEVEL_P1.equalsIgnoreCase(level)) return "一级B类（P1）";
        if (LEVEL_P2.equalsIgnoreCase(level)) return "二级（P2）";
        if (LEVEL_P3.equalsIgnoreCase(level)) return "三级（P3）";
        return level;
    }

    private boolean isYes(String value) {
        if (StrUtil.isBlank(value)) {
            return false;
        }
        return Arrays.asList("是", "yes", "true", "1", "y").contains(value.trim().toLowerCase());
    }

    private boolean containsKeyword(String value, String keyword) {
        return StrUtil.isNotBlank(value) && StrUtil.containsIgnoreCase(value, keyword);
    }

    private boolean containsAnyKeyword(String value, String... keywords) {
        if (StrUtil.isBlank(value) || keywords == null || keywords.length == 0) {
            return false;
        }
        for (String keyword : keywords) {
            if (StrUtil.containsIgnoreCase(value, keyword)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasRigidDeliveryDate(String value) {
        if (StrUtil.isBlank(value)) {
            return false;
        }
        String normalized = value.trim().toLowerCase();
        return !Arrays.asList("否", "no", "false", "0", "n", "无", "未确定", "待定").contains(normalized);
    }

    private Long resolveOperatorId() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return currentUserId != null ? currentUserId : EXTERNAL_OPERATOR_ID;
    }

    private String resolveOperatorName() {
        String currentUsername = SecurityUtils.getCurrentUsername();
        return StrUtil.isNotBlank(currentUsername) ? currentUsername : EXTERNAL_OPERATOR_NAME;
    }

    private String resolveUserDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        if (EXTERNAL_OPERATOR_ID.equals(userId)) {
            return EXTERNAL_OPERATOR_NAME;
        }
        SysUser user = sysUserService.getById(userId);
        if (user == null) {
            return String.valueOf(userId);
        }
        return StrUtil.blankToDefault(user.getRealName(), user.getUsername());
    }

    private record RuleEvaluation(String level, String strategyHint, List<String> ruleHits) {
    }
}
