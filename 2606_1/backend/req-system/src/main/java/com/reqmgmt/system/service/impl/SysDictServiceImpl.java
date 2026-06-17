package com.reqmgmt.system.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.common.exception.ErrorCode;
import com.reqmgmt.system.dto.DictDataCreateDTO;
import com.reqmgmt.system.dto.DictDataUpdateDTO;
import com.reqmgmt.system.entity.SysDictData;
import com.reqmgmt.system.entity.SysDictType;
import com.reqmgmt.system.mapper.SysDictDataMapper;
import com.reqmgmt.system.mapper.SysDictTypeMapper;
import com.reqmgmt.system.service.SysDictService;
import com.reqmgmt.system.vo.DictDataVO;
import com.reqmgmt.system.vo.DictTypeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 字典管理Service实现类
 */
@Service
@RequiredArgsConstructor
public class SysDictServiceImpl extends ServiceImpl<SysDictDataMapper, SysDictData> implements SysDictService {

    private final SysDictTypeMapper sysDictTypeMapper;

    @Override
    public List<DictTypeVO> listAllTypes() {
        List<SysDictType> types = sysDictTypeMapper.selectList(
                new LambdaQueryWrapper<SysDictType>()
                        .eq(SysDictType::getStatus, 1)
                        .orderByAsc(SysDictType::getId)
        );
        return types.stream().map(type -> {
            DictTypeVO vo = new DictTypeVO();
            BeanUtil.copyProperties(type, vo);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<DictDataVO> listDataByCode(String dictCode) {
        List<SysDictData> dataList = list(
                new LambdaQueryWrapper<SysDictData>()
                        .eq(SysDictData::getDictCode, dictCode)
                        .eq(SysDictData::getStatus, 1)
                        .orderByAsc(SysDictData::getSort)
        );
        return dataList.stream().map(data -> {
            DictDataVO vo = new DictDataVO();
            BeanUtil.copyProperties(data, vo);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public Long createDictData(DictDataCreateDTO dto) {
        // 查找字典类型
        SysDictType dictType = sysDictTypeMapper.selectOne(
                new LambdaQueryWrapper<SysDictType>()
                        .eq(SysDictType::getDictCode, dto.getDictCode())
        );
        if (dictType == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "字典编码不存在: " + dto.getDictCode());
        }

        SysDictData entity = new SysDictData();
        BeanUtil.copyProperties(dto, entity);
        entity.setDictTypeId(dictType.getId());
        if (entity.getSort() == null) {
            entity.setSort(0);
        }
        if (entity.getStatus() == null) {
            entity.setStatus(1);
        }
        save(entity);
        return entity.getId();
    }

    @Override
    public void updateDictData(Long id, DictDataUpdateDTO dto) {
        SysDictData entity = getById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "字典数据不存在");
        }
        if (dto.getLabel() != null) {
            entity.setLabel(dto.getLabel());
        }
        if (dto.getValue() != null) {
            entity.setValue(dto.getValue());
        }
        if (dto.getSort() != null) {
            entity.setSort(dto.getSort());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        updateById(entity);
    }

    @Override
    public void deleteDictData(Long id) {
        SysDictData entity = getById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "字典数据不存在");
        }
        removeById(id);
    }
}
