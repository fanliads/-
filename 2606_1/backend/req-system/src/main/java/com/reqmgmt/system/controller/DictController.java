package com.reqmgmt.system.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.system.dto.DictDataCreateDTO;
import com.reqmgmt.system.dto.DictDataUpdateDTO;
import com.reqmgmt.system.service.SysDictService;
import com.reqmgmt.system.vo.DictDataVO;
import com.reqmgmt.system.vo.DictTypeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 字典管理控制器
 */
@RestController
@RequestMapping("/api/dict")
@RequiredArgsConstructor
@Tag(name = "字典管理", description = "字典类型和字典数据管理接口")
public class DictController {

    private final SysDictService sysDictService;

    @GetMapping("/type/list")
    @Operation(summary = "查询所有字典类型")
    public R<List<DictTypeVO>> listTypes() {
        return R.ok(sysDictService.listAllTypes());
    }

    @GetMapping("/data/list")
    @Operation(summary = "按字典编码查询字典数据")
    public R<List<DictDataVO>> listData(@RequestParam String dictCode) {
        return R.ok(sysDictService.listDataByCode(dictCode));
    }

    @PostMapping("/data")
    @Operation(summary = "新增字典数据")
    public R<Long> createData(@Valid @RequestBody DictDataCreateDTO dto) {
        return R.ok(sysDictService.createDictData(dto));
    }

    @PutMapping("/data/{id}")
    @Operation(summary = "修改字典数据")
    public R<Void> updateData(@PathVariable Long id, @RequestBody DictDataUpdateDTO dto) {
        sysDictService.updateDictData(id, dto);
        return R.ok();
    }

    @DeleteMapping("/data/{id}")
    @Operation(summary = "删除字典数据")
    public R<Void> deleteData(@PathVariable Long id) {
        sysDictService.deleteDictData(id);
        return R.ok();
    }
}
