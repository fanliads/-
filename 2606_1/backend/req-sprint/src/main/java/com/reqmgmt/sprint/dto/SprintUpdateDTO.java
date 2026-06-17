package com.reqmgmt.sprint.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 更新迭代DTO
 */
@Data
public class SprintUpdateDTO {

    private String name;

    private String teamName;

    private String cadenceType;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private String goal;
}
