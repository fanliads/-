package com.reqmgmt.requirement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.vo.*;

import java.util.List;

/**
 * 原始需求Service接口
 */
public interface RawRequirementService extends IService<RawRequirement> {

    /**
     * 创建原始需求
     */
    Long createRawRequirement(RawRequirementCreateDTO dto);

    /**
     * 外部提报创建原始需求
     */
    Long createExternalRawRequirement(RawRequirementCreateDTO dto);

    /**
     * 获取详情
     */
    RawRequirementDetailVO getDetail(Long id);

    /**
     * 更新原始需求
     */
    void updateRawRequirement(Long id, RawRequirementUpdateDTO dto);

    /**
     * 删除原始需求
     */
    void deleteRawRequirement(Long id);

    /**
     * 分页查询
     */
    PageResult<RawRequirementListVO> pageQuery(RawRequirementQueryDTO queryDTO);

    /**
     * 批量变更状态
     */
    void batchChangeStatus(BatchStatusDTO dto);

    /**
     * 批量指派
     */
    void batchAssign(BatchAssignDTO dto);

    /**
     * 获取操作日志
     */
    List<RequirementLogVO> getLogs(Long id);

    /**
     * 获取评论列表
     */
    List<CommentVO> getComments(Long id);

    /**
     * 添加评论
     */
    void addComment(Long id, CommentCreateDTO dto);

    /**
     * 获取补充内容列表
     */
    List<SupplementVO> getSupplements(Long id);

    /**
     * 添加补充内容
     */
    void addSupplement(Long id, SupplementCreateDTO dto);

    PriorityAssessmentVO reassessPriority(Long id, PriorityAssessmentContextDTO context);

    void overridePriority(Long id, PriorityOverrideDTO dto);
}
