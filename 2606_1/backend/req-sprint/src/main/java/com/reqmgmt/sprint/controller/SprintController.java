package com.reqmgmt.sprint.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.sprint.dto.SprintCreateDTO;
import com.reqmgmt.sprint.dto.SprintTeamConfigDTO;
import com.reqmgmt.sprint.dto.SprintUpdateDTO;
import com.reqmgmt.sprint.entity.Sprint;
import com.reqmgmt.sprint.service.SprintService;
import com.reqmgmt.sprint.vo.SprintDetailVO;
import com.reqmgmt.sprint.vo.SprintOptionVO;
import com.reqmgmt.sprint.vo.SprintTeamConfigVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 迭代控制器
 */
@RestController
@RequestMapping("/api/sprint")
@RequiredArgsConstructor
@Tag(name = "迭代管理", description = "迭代增删改查接口")
public class SprintController {

    private final SprintService sprintService;

    @GetMapping("/list")
    @Operation(summary = "获取迭代列表")
    public R<List<Sprint>> list() {
        return R.ok(sprintService.listSprints());
    }

    @GetMapping("/options")
    @Operation(summary = "获取迭代下拉选项")
    public R<List<SprintOptionVO>> options() {
        return R.ok(sprintService.listOptions());
    }

    @GetMapping("/team-configs")
    @Operation(summary = "获取团队迭代配置")
    public R<List<SprintTeamConfigVO>> teamConfigs() {
        return R.ok(sprintService.listTeamConfigs());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取迭代详情")
    public R<SprintDetailVO> getById(@PathVariable Long id) {
        return R.ok(sprintService.getDetail(id));
    }

    @PostMapping
    @Operation(summary = "创建迭代")
    public R<Long> save(@Valid @RequestBody SprintCreateDTO dto) {
        return R.ok(sprintService.createSprint(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新迭代")
    public R<Void> update(@PathVariable Long id, @RequestBody SprintUpdateDTO dto) {
        sprintService.updateSprint(id, dto);
        return R.ok();
    }

    @PostMapping("/team-configs")
    @Operation(summary = "保存团队迭代配置")
    public R<Void> saveTeamConfig(@Valid @RequestBody SprintTeamConfigDTO dto) {
        sprintService.saveTeamConfig(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除迭代")
    public R<Void> delete(@PathVariable Long id) {
        sprintService.removeById(id);
        return R.ok();
    }

    @PutMapping("/{id}/requirements/{requirementId}")
    @Operation(summary = "纳入迭代")
    public R<Void> bindRequirement(@PathVariable Long id, @PathVariable Long requirementId) {
        sprintService.bindRequirement(id, requirementId);
        return R.ok();
    }

    @DeleteMapping("/{id}/requirements/{requirementId}")
    @Operation(summary = "移出迭代")
    public R<Void> removeRequirement(@PathVariable Long id, @PathVariable Long requirementId) {
        sprintService.removeRequirement(id, requirementId);
        return R.ok();
    }
}
