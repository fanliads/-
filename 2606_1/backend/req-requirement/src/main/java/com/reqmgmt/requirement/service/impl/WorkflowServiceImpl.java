package com.reqmgmt.requirement.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.requirement.dto.ExecuteActionDTO;
import com.reqmgmt.requirement.dto.SubmitRequirementDTO;
import com.reqmgmt.requirement.entity.ProductRequirement;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.entity.RequirementLog;
import com.reqmgmt.requirement.mapper.ProductRequirementMapper;
import com.reqmgmt.requirement.mapper.RawRequirementMapper;
import com.reqmgmt.requirement.mapper.RequirementLogMapper;
import com.reqmgmt.requirement.service.NotificationService;
import com.reqmgmt.requirement.service.WorkflowService;
import com.reqmgmt.requirement.service.notification.NotificationMessage;
import com.reqmgmt.requirement.vo.ActionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.hutool.core.util.StrUtil;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 审批流转Service实现类
 */
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {
    private static final String SUBMIT_ORIGIN_EXTERNAL = "external";
    private static final Long SYSTEM_OPERATOR_ID = 0L;
    private static final String SYSTEM_OPERATOR_NAME = "系统";


    private final RawRequirementMapper rawRequirementMapper;
    private final ProductRequirementMapper productRequirementMapper;
    private final RequirementLogMapper requirementLogMapper;
    private final NotificationService notificationService;

    /**
     * 状态流转配置：定义每种角色在每个状态下可以执行的操作
     * key: status, value: List of {actionName, toStatus, roles, needApproval}
     */
    private static final Map<String, List<Map<String, Object>>> RAW_FLOW_CONFIG = new LinkedHashMap<>();
    private static final Map<String, List<Map<String, Object>>> PRODUCT_FLOW_CONFIG = new LinkedHashMap<>();

    static {
        // 原始需求流转配置
        RAW_FLOW_CONFIG.put("pending_judgement", List.of(
                Map.of("actionName", "确认推进", "toStatus", "pending_split", "roles", List.of("pm", "product_director"), "needApproval", false),
                Map.of("actionName", "拒绝", "toStatus", "rejected", "roles", List.of("pm"), "needApproval", true),
                Map.of("actionName", "挂起", "toStatus", "suspended", "roles", List.of("pm"), "needApproval", true)
        ));
        RAW_FLOW_CONFIG.put("pending_split", List.of(
                Map.of("actionName", "进入开发", "toStatus", "in_progress", "roles", List.of("pm", "product_director", "product_leader"), "needApproval", false),
                Map.of("actionName", "挂起", "toStatus", "suspended", "roles", List.of("pm", "product_director", "product_leader"), "needApproval", true),
                Map.of("actionName", "拒绝", "toStatus", "rejected", "roles", List.of("pm", "product_director"), "needApproval", true)
        ));
        RAW_FLOW_CONFIG.put("in_progress", List.of(
                Map.of("actionName", "标记上线", "toStatus", "online", "roles", List.of("pm", "product_manager", "product_leader"), "needApproval", false),
                Map.of("actionName", "关闭", "toStatus", "closed", "roles", List.of("pm", "product_manager", "product_leader"), "needApproval", true),
                Map.of("actionName", "挂起", "toStatus", "suspended", "roles", List.of("pm", "product_manager", "product_leader"), "needApproval", true)
        ));
        RAW_FLOW_CONFIG.put("online", List.of(
                Map.of("actionName", "关闭", "toStatus", "closed", "roles", List.of("pm", "product_manager", "product_leader"), "needApproval", false),
                Map.of("actionName", "挂起", "toStatus", "suspended", "roles", List.of("pm", "product_manager", "product_leader"), "needApproval", true)
        ));
        RAW_FLOW_CONFIG.put("suspended", List.of(
                Map.of("actionName", "恢复到待判定", "toStatus", "pending_judgement", "roles", List.of("pm", "product_director", "product_leader"), "needApproval", false),
                Map.of("actionName", "恢复到待拆分", "toStatus", "pending_split", "roles", List.of("pm", "product_director", "product_leader"), "needApproval", false),
                Map.of("actionName", "恢复到开发中", "toStatus", "in_progress", "roles", List.of("pm", "product_director", "product_leader"), "needApproval", false)
        ));
        RAW_FLOW_CONFIG.put("rejected", List.of());
        RAW_FLOW_CONFIG.put("closed", List.of());

        // 产品需求流转配置
        PRODUCT_FLOW_CONFIG.put("pending_pm", List.of(
                Map.of("actionName", "开始评估", "toStatus", "researching", "roles", List.of("product_manager"), "needApproval", false),
                Map.of("actionName", "加入待办", "toStatus", "backlog", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("backlog", List.of(
                Map.of("actionName", "开始调研", "toStatus", "researching", "roles", List.of("product_manager"), "needApproval", false),
                Map.of("actionName", "开始设计", "toStatus", "designing", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("researching", List.of(
                Map.of("actionName", "调研完成", "toStatus", "backlog", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("designing", List.of(
                Map.of("actionName", "确认完成", "toStatus", "pending_confirm", "roles", List.of("product_manager"), "needApproval", false),
                Map.of("actionName", "挂起", "toStatus", "suspended", "roles", List.of("product_manager"), "needApproval", true)
        ));
        PRODUCT_FLOW_CONFIG.put("pending_confirm", List.of(
                Map.of("actionName", "确认通过", "toStatus", "developing", "roles", List.of("product_manager", "product_leader"), "needApproval", false),
                Map.of("actionName", "退回修改", "toStatus", "designing", "roles", List.of("product_manager", "product_leader"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("developing", List.of(
                Map.of("actionName", "开发完成", "toStatus", "testing", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("testing", List.of(
                Map.of("actionName", "测试通过", "toStatus", "completed", "roles", List.of("product_manager"), "needApproval", false),
                Map.of("actionName", "退回开发", "toStatus", "developing", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("completed", List.of(
                Map.of("actionName", "发起价值评估", "toStatus", "value_review", "roles", List.of("product_manager"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("value_review", List.of(
                Map.of("actionName", "评估完成", "toStatus", "closed", "roles", List.of("product_leader"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("suspended", List.of(
                Map.of("actionName", "恢复", "toStatus", "backlog", "roles", List.of("product_manager", "product_leader"), "needApproval", false)
        ));
        PRODUCT_FLOW_CONFIG.put("closed", List.of());
    }

    /**
     * 状态名称映射
     */
    private static final Map<String, String> STATUS_NAME_MAP = Map.ofEntries(
            Map.entry("pending_judgement", "待判定"),
            Map.entry("pending_split", "待拆分"),
            Map.entry("in_progress", "开发中"),
            Map.entry("pending_pm", "待产品经理处理"),
            Map.entry("backlog", "待办"),
            Map.entry("researching", "调研中"),
            Map.entry("designing", "设计中"),
            Map.entry("pending_confirm", "待确认"),
            Map.entry("developing", "开发中"),
            Map.entry("testing", "测试中"),
            Map.entry("completed", "已完成"),
            Map.entry("value_review", "价值评估中"),
            Map.entry("suspended", "已挂起"),
            Map.entry("rejected", "已拒绝"),
            Map.entry("closed", "已关闭")
    );

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> submitRequirement(SubmitRequirementDTO dto) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        // 创建原始需求
        RawRequirement rawReq = new RawRequirement();
        rawReq.setTitle(dto.getTitle());
        rawReq.setDescription(dto.getDescription());
        rawReq.setSource(dto.getSource());
        rawReq.setSubmitOrigin(StrUtil.blankToDefault(dto.getSubmitOrigin(), "internal"));
        rawReq.setProposer(dto.getProposer());
        rawReq.setProjectName(dto.getProjectName());
        rawReq.setPriority(dto.getPriority() != null ? dto.getPriority() : "P2");
        rawReq.setStatus("pending_judgement");
        rawReq.setCreateBy(currentUserId);
        rawReq.setBusinessLine(dto.getBusinessLine());
        rawReq.setProductDefinition(dto.getProductDefinition());
        rawReq.setProductManager(dto.getProductManager());
        rawReq.setProjectManager(dto.getProjectManager());

        // 生成需求编号 RAW-20260101-001
        String reqNo = generateReqNo("RAW");
        rawReq.setReqNo(reqNo);

        rawRequirementMapper.insert(rawReq);

        // 记录操作日志
        saveLog(rawReq.getId(), "raw", "submit", null, "pending_judgement", currentUserId, "提交新需求");

        // 自动通知项目经理角色（这里简化处理：通知所有pm角色用户）
        // 实际项目中应查询pm角色的用户列表，这里发送给占位用户ID
        sendNotification(null, "新需求待判定",
                String.format("新需求「%s」已提交，请及时判定", dto.getTitle()),
                "workflow", "raw", rawReq.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("id", rawReq.getId());
        result.put("reqNo", rawReq.getReqNo());
        return result;
    }

    @Override
    public List<ActionVO> getAvailableActions(String reqType, Long reqId) {
        String currentRole = SecurityUtils.getCurrentRoleKey();
        String currentStatus = getCurrentStatus(reqType, reqId);

        Map<String, List<Map<String, Object>>> config = "product".equals(reqType) ? PRODUCT_FLOW_CONFIG : RAW_FLOW_CONFIG;
        List<Map<String, Object>> actions = config.getOrDefault(currentStatus, Collections.emptyList());

        List<ActionVO> result = new ArrayList<>();
        for (Map<String, Object> action : actions) {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) action.get("roles");
            if (roles.contains(currentRole)) {
                if ("raw".equals(reqType) && !isRawActionAllowed(reqId, currentStatus, (String) action.get("toStatus"))) {
                    continue;
                }
                ActionVO vo = new ActionVO();
                vo.setActionName((String) action.get("actionName"));
                vo.setToStatus((String) action.get("toStatus"));
                vo.setNeedApproval((Boolean) action.get("needApproval"));
                result.add(vo);
            }
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void executeAction(ExecuteActionDTO dto) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentRoleKey();
        String currentStatus = getCurrentStatus(dto.getReqType(), dto.getReqId());

        if ("raw".equals(dto.getReqType()) && !isRawActionAllowed(dto.getReqId(), currentStatus, dto.getToStatus())) {
            throw new RuntimeException("当前需求不支持该操作");
        }

        // 1. 校验流转合法性
        Map<String, List<Map<String, Object>>> config = "product".equals(dto.getReqType()) ? PRODUCT_FLOW_CONFIG : RAW_FLOW_CONFIG;
        List<Map<String, Object>> actions = config.getOrDefault(currentStatus, Collections.emptyList());

        boolean validTransition = false;
        for (Map<String, Object> action : actions) {
            if (dto.getToStatus().equals(action.get("toStatus"))) {
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) action.get("roles");
                if (roles.contains(currentRole)) {
                    validTransition = true;
                    break;
                }
            }
        }

        if (!validTransition) {
            throw new RuntimeException("非法的状态流转操作");
        }

        // 2. 更新需求状态
        if ("raw".equals(dto.getReqType())) {
            RawRequirement rawReq = rawRequirementMapper.selectById(dto.getReqId());
            if (rawReq == null) {
                throw new RuntimeException("需求不存在");
            }
            rawReq.setStatus(dto.getToStatus());
            rawReq.setUpdateTime(LocalDateTime.now());
            rawRequirementMapper.updateById(rawReq);
        } else {
            ProductRequirement prodReq = productRequirementMapper.selectById(dto.getReqId());
            if (prodReq == null) {
                throw new RuntimeException("需求不存在");
            }
            prodReq.setStatus(dto.getToStatus());
            prodReq.setUpdateTime(LocalDateTime.now());
            productRequirementMapper.updateById(prodReq);
        }

        // 3. 记录操作日志
        saveLog(dto.getReqId(), dto.getReqType(), "status_change", currentStatus, dto.getToStatus(), currentUserId, dto.getRemark());

        // 4. 触发站内通知 - 通知下一环节处理人
        String nextRole = getNextHandlerRole(dto.getToStatus(), dto.getReqType());
        if (nextRole != null) {
            String titleSuffix = getStatusName(dto.getToStatus());
            String reqTitle = getReqTitle(dto.getReqType(), dto.getReqId());
            sendNotification(null,
                    "需求状态变更",
                    String.format("需求「%s」已变更为「%s」，请及时处理", reqTitle, titleSuffix),
                    "workflow", dto.getReqType(), dto.getReqId());
        }
    }

    @Override
    public void sendNotification(Long userId, String title, String content, String type, String refType, Long refId) {
        notificationService.notify(NotificationMessage.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .type(type)
                .refType(refType)
                .refId(refId)
                .build());
    }

    @Override
    public List<Map<String, Object>> getFlowConfig(String reqType) {
        Map<String, List<Map<String, Object>>> config = "product".equals(reqType) ? PRODUCT_FLOW_CONFIG : RAW_FLOW_CONFIG;
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : config.entrySet()) {
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("status", entry.getKey());
            node.put("statusName", STATUS_NAME_MAP.getOrDefault(entry.getKey(), entry.getKey()));
            node.put("actions", entry.getValue());
            result.add(node);
        }
        return result;
    }

    // ==================== 私有方法 ====================

    /**
     * 获取需求当前状态
     */
    private String getCurrentStatus(String reqType, Long reqId) {
        if ("raw".equals(reqType)) {
            RawRequirement rawReq = rawRequirementMapper.selectById(reqId);
            if (rawReq == null) {
                throw new RuntimeException("需求不存在");
            }
            return rawReq.getStatus();
        } else {
            ProductRequirement prodReq = productRequirementMapper.selectById(reqId);
            if (prodReq == null) {
                throw new RuntimeException("需求不存在");
            }
            return prodReq.getStatus();
        }
    }

    /**
     * 获取需求标题
     */
    private String getReqTitle(String reqType, Long reqId) {
        if ("raw".equals(reqType)) {
            RawRequirement rawReq = rawRequirementMapper.selectById(reqId);
            return rawReq != null ? rawReq.getTitle() : "";
        } else {
            ProductRequirement prodReq = productRequirementMapper.selectById(reqId);
            return prodReq != null ? prodReq.getTitle() : "";
        }
    }

    private boolean isRawActionAllowed(Long reqId, String currentStatus, String toStatus) {
        RawRequirement rawReq = rawRequirementMapper.selectById(reqId);
        if (rawReq == null) {
            throw new RuntimeException("需求不存在");
        }
        boolean external = SUBMIT_ORIGIN_EXTERNAL.equalsIgnoreCase(rawReq.getSubmitOrigin());
        if (external && "pending_judgement".equals(currentStatus)) {
            return "pending_split".equals(toStatus) || "rejected".equals(toStatus) || "suspended".equals(toStatus);
        }
        if (external && "pending_split".equals(currentStatus)) {
            return !"pending_judgement".equals(toStatus);
        }
        return true;
    }

    /**
     * 获取下一个处理人角色
     */
    private String getNextHandlerRole(String toStatus, String reqType) {
        return switch (toStatus) {
            case "pending_judgement" -> "pm";
            case "pending_split" -> "product_director";
            case "in_progress" -> "product_manager";
            case "pending_pm", "backlog", "researching", "designing" -> "product_manager";
            case "pending_confirm" -> "product_leader";
            case "value_review" -> "product_leader";
            default -> null;
        };
    }

    /**
     * 获取状态中文名
     */
    public static String getStatusName(String status) {
        return STATUS_NAME_MAP.getOrDefault(status, status);
    }

    /**
     * 生成需求编号
     */
    private String generateReqNo(String prefix) {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = rawRequirementMapper.selectCount(
                new LambdaQueryWrapper<RawRequirement>().likeRight(RawRequirement::getReqNo, prefix + "-" + datePart)
        );
        return String.format("%s-%s-%03d", prefix, datePart, count + 1);
    }

    /**
     * 保存操作日志
     */
    private void saveLog(Long requirementId, String requirementType, String action,
                         String oldValue, String newValue, Long operatorId, String remark) {
        RequirementLog log = new RequirementLog();
        log.setReqId(requirementId);
        log.setReqType(requirementType);
        log.setAction(action);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setRemark(remark);
        log.setOperatorId(operatorId != null ? operatorId : SYSTEM_OPERATOR_ID);
        log.setOperatorName(resolveOperatorName(operatorId));
        requirementLogMapper.insert(log);
    }

    private String resolveOperatorName(Long operatorId) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        if (StrUtil.isNotBlank(currentUsername)) {
            return currentUsername;
        }
        if (operatorId != null && operatorId.equals(SYSTEM_OPERATOR_ID)) {
            return SYSTEM_OPERATOR_NAME;
        }
        return SYSTEM_OPERATOR_NAME;
    }
}
