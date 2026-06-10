package com.reqmgmt.requirement.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.reqmgmt.requirement.dto.*;
import com.reqmgmt.requirement.entity.ProductRequirement;
import com.reqmgmt.requirement.vo.*;

import java.util.List;
import java.util.Map;

/**
 * 产品需求Service接口
 */
public interface ProductRequirementService extends IService<ProductRequirement> {

    /**
     * 创建产品需求
     */
    Long createProductRequirement(ProductRequirementCreateDTO dto);

    /**
     * 获取详情
     */
    ProductRequirementDetailVO getDetail(Long id);

    /**
     * 更新产品需求
     */
    void updateProductRequirement(Long id, ProductRequirementUpdateDTO dto);

    /**
     * 删除产品需求
     */
    void deleteProductRequirement(Long id);

    /**
     * 作废产品需求
     */
    void voidProductRequirement(Long id, String remark);

    /**
     * 分页查询
     */
    PageResult<ProductRequirementListVO> pageQuery(ProductRequirementQueryDTO queryDTO);

    /**
     * 按原始需求分组查询
     */
    Map<String, List<ProductRequirementListVO>> groupedQuery(ProductRequirementQueryDTO queryDTO);

    /**
     * 获取统计信息
     */
    Map<String, Object> getStats();

    /**
     * 需求拆分
     */
    List<ProductRequirementListVO> splitRequirement(SplitDTO dto);

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
}
