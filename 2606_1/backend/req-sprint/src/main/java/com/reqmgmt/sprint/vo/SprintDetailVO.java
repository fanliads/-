package com.reqmgmt.sprint.vo;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 迭代详情VO
 */
@Data
public class SprintDetailVO {

    private Long id;

    private String name;

    private String teamName;

    private String cadenceType;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private String goal;

    private List<SprintRequirementVO> requirements;
}
