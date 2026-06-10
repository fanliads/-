package com.reqmgmt.requirement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.reqmgmt.requirement.entity.StatusFlowConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 状态流转配置Mapper接口
 */
@Mapper
public interface StatusFlowConfigMapper extends BaseMapper<StatusFlowConfig> {

    /**
     * 查找从某状态可以流转到的目标状态配置
     *
     * @param reqType    需求类型
     * @param fromStatus 来源状态
     * @return 流转配置列表
     */
    @Select("SELECT * FROM status_flow_config WHERE req_type = #{reqType} AND from_status = #{fromStatus} AND status = 1 ORDER BY sort_order")
    List<StatusFlowConfig> selectByReqTypeAndFromStatus(@Param("reqType") String reqType,
                                                         @Param("fromStatus") String fromStatus);

    /**
     * 获取某需求类型的所有不重复状态（包含from和to状态）
     * 先收集所有from_status和to_status，再去重按首次出现的sort_order排序
     *
     * @param reqType 需求类型
     * @return 不重复的状态编码列表（按sort_order排序）
     */
    @Select("SELECT status FROM (" +
            "SELECT from_status AS status, MIN(sort_order) AS sort_order " +
            "FROM status_flow_config WHERE req_type = #{reqType} AND status = 1 GROUP BY from_status " +
            "UNION " +
            "SELECT to_status AS status, MIN(sort_order) AS sort_order " +
            "FROM status_flow_config WHERE req_type = #{reqType} AND status = 1 GROUP BY to_status" +
            ") t GROUP BY status ORDER BY MIN(sort_order)")
    List<String> selectAllStatuses(@Param("reqType") String reqType);
}
