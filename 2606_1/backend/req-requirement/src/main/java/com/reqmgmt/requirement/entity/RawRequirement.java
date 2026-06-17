package com.reqmgmt.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 原始需求实体
 */
@Data
@TableName("raw_requirement")
public class RawRequirement {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("req_no")
    private String reqNo;

    @TableField("title")
    private String title;

    @TableField("description")
    private String description;

    @TableField("source")
    private String source;

    @TableField("submit_origin")
    private String submitOrigin;

    @TableField("proposer")
    private String proposer;

    @TableField("proposer_contact")
    private String proposerContact;

    @TableField("project_name")
    private String projectName;

    @TableField("req_link")
    private String reqLink;

    @TableField("priority")
    private String priority;

    @TableField("system_level")
    private String systemLevel;

    @TableField("effective_level")
    private String effectiveLevel;

    @TableField("strategy_hint")
    private String strategyHint;

    @TableField("rule_hits")
    private String ruleHits;

    @TableField("explanation_summary")
    private String explanationSummary;

    @TableField("missing_fields")
    private String missingFields;

    @TableField("override_flag")
    private Integer overrideFlag;

    @TableField("override_reason")
    private String overrideReason;

    @TableField("override_by")
    private Long overrideBy;

    @TableField("override_time")
    private LocalDateTime overrideTime;

    @TableField("status")
    private String status;

    @TableField("assignee_id")
    private Long assigneeId;

    @TableField("current_handler_id")
    private Long currentHandlerId;

    @TableField(exist = false)
    private String currentHandler;

    @TableField("business_line_id")
    private Long businessLineId;

    @TableField("req_type")
    private String reqType;

    @TableField("expected_date")
    private LocalDate expectedDate;

    @TableField("attachment")
    private String attachment;

    @TableField("remark")
    private String remark;

    @TableField("is_non_functional")
    private Integer isNonFunctional;

    @TableField("business_line")
    private String businessLine;

    @TableField("register_name")
    private String registerName;

    @TableField("propose_time")
    private LocalDate proposeTime;

    @TableField("product_definition")
    private String productDefinition;

    @TableField("product_manager")
    private String productManager;

    @TableField("project_manager")
    private String projectManager;

    @TableField("is_urgent")
    private Integer isUrgent;

    @TableField("urgent_reason")
    private String urgentReason;

    @TableField("expected_online_date")
    private LocalDate expectedOnlineDate;

    @TableField("value_assessment")
    private String valueAssessment;

    @TableField("ai_assessment_context")
    private String aiAssessmentContext;

    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
