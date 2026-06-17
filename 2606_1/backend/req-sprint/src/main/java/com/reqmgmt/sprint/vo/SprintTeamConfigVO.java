package com.reqmgmt.sprint.vo;

import lombok.Data;

@Data
public class SprintTeamConfigVO {

    private Long id;

    private String teamName;

    private String defaultCadenceType;

    private Integer autoCreateEnabled;
}
