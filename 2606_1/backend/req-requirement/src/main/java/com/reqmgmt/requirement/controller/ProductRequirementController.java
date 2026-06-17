package com.reqmgmt.requirement.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.service.ProductRequirementService;
import com.reqmgmt.requirement.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 产品需求控制器
 */
@RestController
@RequestMapping("/api/product-requirements")
@RequiredArgsConstructor
@Tag(name = "产品需求管理", description = "产品需求增删改查接口")
public class ProductRequirementController {

    private final ProductRequirementService productRequirementService;

    @PostMapping
    @Operation(summary = "创建产品需求")
    public R<Long> create(@Valid @RequestBody ProductRequirementCreateDTO dto) {
        Long id = productRequirementService.createProductRequirement(dto);
        return R.ok(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取产品需求详情")
    public R<ProductRequirementDetailVO> getDetail(@PathVariable Long id) {
        return R.ok(productRequirementService.getDetail(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新产品需求")
    public R<Void> update(@PathVariable Long id, @RequestBody ProductRequirementUpdateDTO dto) {
        productRequirementService.updateProductRequirement(id, dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除产品需求")
    public R<Void> delete(@PathVariable Long id) {
        productRequirementService.deleteProductRequirement(id);
        return R.ok();
    }

    @PostMapping("/{id}/void")
    @Operation(summary = "作废产品需求")
    public R<Void> voidRequirement(@PathVariable Long id, @RequestBody(required = false) ProductRequirementVoidDTO dto) {
        productRequirementService.voidProductRequirement(id, dto != null ? dto.getRemark() : null);
        return R.ok();
    }

    @GetMapping("/page")
    @Operation(summary = "分页查询产品需求")
    public R<PageResult<ProductRequirementListVO>> pageQuery(ProductRequirementQueryDTO queryDTO) {
        return R.ok(productRequirementService.pageQuery(queryDTO));
    }

    @GetMapping("/grouped")
    @Operation(summary = "按原始需求分组查询产品需求")
    public R<Map<String, List<ProductRequirementListVO>>> groupedQuery(ProductRequirementQueryDTO queryDTO) {
        return R.ok(productRequirementService.groupedQuery(queryDTO));
    }

    @GetMapping("/stats")
    @Operation(summary = "获取产品需求统计")
    public R<Map<String, Object>> stats() {
        return R.ok(productRequirementService.getStats());
    }

    @PostMapping("/split")
    @Operation(summary = "需求拆分")
    public R<Void> split(@Valid @RequestBody SplitDTO dto) {
        productRequirementService.splitRequirement(dto);
        return R.ok();
    }

    @GetMapping("/{id}/logs")
    @Operation(summary = "获取操作日志")
    public R<List<RequirementLogVO>> getLogs(@PathVariable Long id) {
        return R.ok(productRequirementService.getLogs(id));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "获取评论列表")
    public R<List<CommentVO>> getComments(@PathVariable Long id) {
        return R.ok(productRequirementService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "添加评论")
    public R<Void> addComment(@PathVariable Long id, @Valid @RequestBody CommentCreateDTO dto) {
        productRequirementService.addComment(id, dto);
        return R.ok();
    }

    @GetMapping("/{id}/supplements")
    @Operation(summary = "获取补充内容列表")
    public R<List<SupplementVO>> getSupplements(@PathVariable Long id) {
        return R.ok(productRequirementService.getSupplements(id));
    }

    @PostMapping("/{id}/supplements")
    @Operation(summary = "添加补充内容")
    public R<Void> addSupplement(@PathVariable Long id, @Valid @RequestBody SupplementCreateDTO dto) {
        productRequirementService.addSupplement(id, dto);
        return R.ok();
    }
}
