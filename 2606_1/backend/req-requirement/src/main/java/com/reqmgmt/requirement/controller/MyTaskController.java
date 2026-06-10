package com.reqmgmt.requirement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.reqmgmt.common.response.R;
import com.reqmgmt.requirement.service.MyTaskService;
import com.reqmgmt.requirement.vo.MyTaskVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 我的待办控制器
 */
@RestController
@RequestMapping("/api/my-tasks")
@RequiredArgsConstructor
@Tag(name = "我的待办", description = "我的待办相关接口")
public class MyTaskController {

    private final MyTaskService myTaskService;

    @GetMapping("/pending")
    @Operation(summary = "获取待我处理列表")
    public R<IPage<MyTaskVO>> getPendingTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return R.ok(myTaskService.getPendingTasks(page, size));
    }

    @GetMapping("/done")
    @Operation(summary = "获取已处理列表")
    public R<IPage<MyTaskVO>> getDoneTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return R.ok(myTaskService.getDoneTasks(page, size));
    }

    @GetMapping("/stats")
    @Operation(summary = "待办统计")
    public R<Map<String, Object>> getStats() {
        return R.ok(myTaskService.getStats());
    }
}
