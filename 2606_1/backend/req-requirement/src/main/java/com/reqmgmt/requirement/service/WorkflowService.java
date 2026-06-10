package com.reqmgmt.requirement.service;

import com.reqmgmt.requirement.dto.ExecuteActionDTO;
import com.reqmgmt.requirement.dto.SubmitRequirementDTO;
import com.reqmgmt.requirement.vo.ActionVO;

import java.util.List;
import java.util.Map;

/**
 * 审批流转Service接口
 */
public interface WorkflowService {

    /**
     * 提交新需求
     * 创建原始需求 + 发送通知
     *
     * @param dto 提交参数
     * @return 新创建的需求ID和编号
     */
    Map<String, Object> submitRequirement(SubmitRequirementDTO dto);

    /**
     * 获取当前用户对某需求可执行的操作列表
     *
     * @param reqType 需求类型 raw/product
     * @param reqId   需求ID
     * @return 可执行操作列表
     */
    List<ActionVO> getAvailableActions(String reqType, Long reqId);

    /**
     * 执行审批/流转操作
     *
     * @param dto 执行参数
     */
    void executeAction(ExecuteActionDTO dto);

    /**
     * 发送站内通知
     *
     * @param userId  接收用户ID
     * @param title   通知标题
     * @param content 通知内容
     * @param type    通知类型
     * @param refType 关联类型
     * @param refId   关联ID
     */
    void sendNotification(Long userId, String title, String content, String type, String refType, Long refId);

    /**
     * 获取完整的状态流转配置
     *
     * @param reqType 需求类型
     * @return 流转配置列表
     */
    List<Map<String, Object>> getFlowConfig(String reqType);
}
