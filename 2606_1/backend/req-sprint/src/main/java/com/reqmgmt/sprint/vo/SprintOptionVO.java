package com.reqmgmt.sprint.vo;

import lombok.Data;

/**
 * 迭代下拉选项
 */
@Data
public class SprintOptionVO {

    private Long id;

    private String name;

    private String teamName;

    private String cadenceType;
}
