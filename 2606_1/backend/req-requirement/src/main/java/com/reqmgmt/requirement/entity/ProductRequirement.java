package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 产品需求实体
 */
@Data
@TableName("product_requirement")
public class ProductRequirement {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("req_no")
    private String reqNo;

    @TableField("title")
    private String title;

    @TableField("description")
    private String description;

    /**
     * 优先级：P0-P3
     */
    @TableField("priority")
    private String priority;

    @TableField("business_line_id")
    private Long businessLineId;

    @TableField("product_module")
    private String productModule;

    @TableField("req_type")
    private String reqType;

    @TableField("sprint_id")
    private Long sprintId;

    @TableField("workload")
    private String workload;

    @TableField("value_score")
    private Integer valueScore;

    @TableField("status")
    private String status;

    @TableField("assignee_id")
    private Long assigneeId;

    @TableField("raw_req_id")
    private Long rawReqId;

    @TableField("expected_date")
    private LocalDate expectedDate;

    @TableField("actual_online_date")
    private LocalDate actualOnlineDate;

    @TableField("design_doc_url")
    private String designDocUrl;

    @TableField("prd_url")
    private String prdUrl;

    @TableField("handler")
    private String handler;

    @TableField("creator")
    private String creator;

    @TableField("is_direct")
    private Integer isDirect;

    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
