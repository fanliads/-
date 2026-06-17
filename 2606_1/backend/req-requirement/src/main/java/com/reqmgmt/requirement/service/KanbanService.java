package com.reqmgmt.requirement.service;

import com.reqmgmt.requirement.dto.KanbanMoveDTO;
import com.reqmgmt.requirement.dto.KanbanQueryDTO;
import com.reqmgmt.requirement.vo.KanbanColumnVO;
import com.reqmgmt.requirement.vo.ProductRequirementVO;
import com.reqmgmt.requirement.vo.RawRequirementVO;

import java.util.List;
import java.util.Map;

/**
 * 看板Service接口
 */
public interface KanbanService {

    /**
     * 获取原始需求看板数据（按状态分组）
     *
     * @param query 查询条件
     * @return key=状态, value=该状态下的需求列表
     */
    Map<String, List<RawRequirementVO>> getRawKanbanData(KanbanQueryDTO query);

    /**
     * 获取产品需求看板数据（按状态分组）
     *
     * @param query 查询条件
     * @return key=状态, value=该状态下的需求列表
     */
    Map<String, List<ProductRequirementVO>> getProductKanbanData(KanbanQueryDTO query);

    /**
     * 拖拽移动需求状态
     *
     * @param moveDTO 移动参数
     */
    void moveRequirement(KanbanMoveDTO moveDTO);

    /**
     * 获取看板列配置
     *
     * @param reqType 需求类型
     * @return 看板列配置列表
     */
    List<KanbanColumnVO> getKanbanColumns(String reqType);
}
