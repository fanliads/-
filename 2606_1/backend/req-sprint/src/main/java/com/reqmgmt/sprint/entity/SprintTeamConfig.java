package com.reqmgmt.sprint.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sprint_team_config")
public class SprintTeamConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("team_name")
    private String teamName;

    @TableField("default_cadence_type")
    private String defaultCadenceType;

    @TableField("auto_create_enabled")
    private Integer autoCreateEnabled;

    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
