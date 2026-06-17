package com.reqmgmt.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.reqmgmt.system.dto.DictDataCreateDTO;
import com.reqmgmt.system.dto.DictDataUpdateDTO;
import com.reqmgmt.system.entity.SysDictData;
import com.reqmgmt.system.entity.SysDictType;
import com.reqmgmt.system.vo.DictDataVO;
import com.reqmgmt.system.vo.DictTypeVO;

import java.util.List;

/**
 * 字典管理Service接口
 */
public interface SysDictService extends IService<SysDictData> {

    /**
     * 查询所有字典类型
     */
    List<DictTypeVO> listAllTypes();

    /**
     * 按字典编码查询字典数据
     */
    List<DictDataVO> listDataByCode(String dictCode);

    /**
     * 新增字典数据
     */
    Long createDictData(DictDataCreateDTO dto);

    /**
     * 修改字典数据
     */
    void updateDictData(Long id, DictDataUpdateDTO dto);

    /**
     * 删除字典数据
     */
    void deleteDictData(Long id);
}
