package com.reqmgmt.requirement.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.service.ProductRequirementService;
import com.reqmgmt.requirement.service.RawRequirementService;
import com.reqmgmt.requirement.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 原始需求控制器
 */
@RestController
@RequestMapping("/api/raw-requirements")
@RequiredArgsConstructor
@Tag(name = "原始需求管理", description = "原始需求增删改查接口")
public class RawRequirementController {

    private final RawRequirementService rawRequirementService;
    private final ProductRequirementService productRequirementService;

    @PostMapping
    @Operation(summary = "创建原始需求")
    public R<Long> create(@Valid @RequestBody RawRequirementCreateDTO dto) {
        Long id = rawRequirementService.createRawRequirement(dto);
        return R.ok(id);
    }

    @PostMapping("/external-submit")
    @Operation(summary = "外部提报创建原始需求")
    public R<Long> externalSubmit(@Valid @RequestBody RawRequirementCreateDTO dto) {
        Long id = rawRequirementService.createExternalRawRequirement(dto);
        return R.ok(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取原始需求详情")
    public R<RawRequirementDetailVO> getDetail(@PathVariable Long id) {
        return R.ok(rawRequirementService.getDetail(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新原始需求")
    public R<Void> update(@PathVariable Long id, @RequestBody RawRequirementUpdateDTO dto) {
        rawRequirementService.updateRawRequirement(id, dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除原始需求")
    public R<Void> delete(@PathVariable Long id) {
        rawRequirementService.deleteRawRequirement(id);
        return R.ok();
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询原始需求")
    public R<PageResult<RawRequirementListVO>> pageQuery(RawRequirementQueryDTO queryDTO) {
        return R.ok(rawRequirementService.pageQuery(queryDTO));
    }

    @PostMapping("/batch/status")
    @Operation(summary = "批量变更状态")
    public R<Void> batchChangeStatus(@Valid @RequestBody BatchStatusDTO dto) {
        rawRequirementService.batchChangeStatus(dto);
        return R.ok();
    }

    @PostMapping("/batch/assign")
    @Operation(summary = "批量指派")
    public R<Void> batchAssign(@Valid @RequestBody BatchAssignDTO dto) {
        rawRequirementService.batchAssign(dto);
        return R.ok();
    }

    @GetMapping("/{id}/logs")
    @Operation(summary = "获取需求操作日志")
    public R<List<RequirementLogVO>> getLogs(@PathVariable Long id) {
        return R.ok(rawRequirementService.getLogs(id));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "获取评论列表")
    public R<List<CommentVO>> getComments(@PathVariable Long id) {
        return R.ok(rawRequirementService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "添加评论")
    public R<Void> addComment(@PathVariable Long id, @Valid @RequestBody CommentCreateDTO dto) {
        rawRequirementService.addComment(id, dto);
        return R.ok();
    }

    @GetMapping("/{id}/supplements")
    @Operation(summary = "获取补充内容列表")
    public R<List<SupplementVO>> getSupplements(@PathVariable Long id) {
        return R.ok(rawRequirementService.getSupplements(id));
    }

    @PostMapping("/{id}/supplements")
    @Operation(summary = "添加补充内容")
    public R<Void> addSupplement(@PathVariable Long id, @Valid @RequestBody SupplementCreateDTO dto) {
        rawRequirementService.addSupplement(id, dto);
        return R.ok();
    }

    @PostMapping("/{id}/priority-assessment")
    @Operation(summary = "手动触发系统优先级重新判定")
    public R<PriorityAssessmentVO> reassessPriority(@PathVariable Long id,
                                                    @RequestBody(required = false) PriorityAssessmentRequestDTO dto) {
        return R.ok(rawRequirementService.reassessPriority(id, dto != null ? dto.getContext() : null));
    }

    @PostMapping("/{id}/priority-override")
    @Operation(summary = "人工覆盖当前生效优先级")
    public R<Void> overridePriority(@PathVariable Long id, @Valid @RequestBody PriorityOverrideDTO dto) {
        rawRequirementService.overridePriority(id, dto);
        return R.ok();
    }

    @PostMapping("/{id}/split")
    @Operation(summary = "需求拆分")
    public R<List<ProductRequirementListVO>> split(@PathVariable Long id, @Valid @RequestBody SplitDTO dto) {
        dto.setRawReqId(id);
        return R.ok(productRequirementService.splitRequirement(dto));
    }
}
