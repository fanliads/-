package com.reqmgmt.requirement.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.dto.KanbanMoveDTO;
import com.reqmgmt.requirement.dto.KanbanQueryDTO;
import com.reqmgmt.requirement.service.KanbanService;
import com.reqmgmt.requirement.vo.KanbanColumnVO;
import com.reqmgmt.requirement.vo.ProductRequirementVO;
import com.reqmgmt.requirement.vo.RawRequirementVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 看板控制器
 */
@RestController
@RequestMapping("/api/kanban")
@RequiredArgsConstructor
@Tag(name = "看板管理", description = "看板视图相关接口")
public class KanbanController {

    private final KanbanService kanbanService;

    @GetMapping("/raw")
    @Operation(summary = "获取原始需求看板数据")
    public R<Map<String, List<RawRequirementVO>>> getRawKanbanData(KanbanQueryDTO query) {
        query.setReqType("raw");
        return R.ok(kanbanService.getRawKanbanData(query));
    }

    @GetMapping("/product")
    @Operation(summary = "获取产品需求看板数据")
    public R<Map<String, List<ProductRequirementVO>>> getProductKanbanData(KanbanQueryDTO query) {
        query.setReqType("product");
        return R.ok(kanbanService.getProductKanbanData(query));
    }

    @PutMapping("/move")
    @Operation(summary = "拖拽移动需求状态")
    public R<Void> moveRequirement(@RequestBody KanbanMoveDTO moveDTO) {
        kanbanService.moveRequirement(moveDTO);
        return R.ok();
    }

    @GetMapping("/columns")
    @Operation(summary = "获取看板列配置")
    public R<List<KanbanColumnVO>> getKanbanColumns(@RequestParam String reqType) {
        return R.ok(kanbanService.getKanbanColumns(reqType));
    }
}
