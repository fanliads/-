package com.reqmgmt.requirement.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.dto.ExecuteActionDTO;
import com.reqmgmt.requirement.dto.SubmitRequirementDTO;
import com.reqmgmt.requirement.service.WorkflowService;
import com.reqmgmt.requirement.vo.ActionVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 审批流转控制器
 */
@RestController
@RequestMapping("/api/workflow")
@RequiredArgsConstructor
@Tag(name = "审批流转", description = "需求审批流转相关接口")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping("/submit")
    @Operation(summary = "提交新需求")
    public R<Map<String, Object>> submitRequirement(@Valid @RequestBody SubmitRequirementDTO dto) {
        return R.ok(workflowService.submitRequirement(dto));
    }

    @GetMapping("/actions/{reqType}/{reqId}")
    @Operation(summary = "获取可执行操作列表")
    public R<List<ActionVO>> getAvailableActions(@PathVariable String reqType, @PathVariable Long reqId) {
        return R.ok(workflowService.getAvailableActions(reqType, reqId));
    }

    @PostMapping("/execute")
    @Operation(summary = "执行审批/流转操作")
    public R<Void> executeAction(@Valid @RequestBody ExecuteActionDTO dto) {
        workflowService.executeAction(dto);
        return R.ok();
    }

    @GetMapping("/flow-config/{reqType}")
    @Operation(summary = "获取状态流转配置")
    public R<List<Map<String, Object>>> getFlowConfig(@PathVariable String reqType) {
        return R.ok(workflowService.getFlowConfig(reqType));
    }
}
