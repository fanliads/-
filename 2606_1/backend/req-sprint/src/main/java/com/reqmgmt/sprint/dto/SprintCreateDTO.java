package com.reqmgmt.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * 创建迭代DTO
 */
@Data
public class SprintCreateDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String teamName;

    @NotBlank
    private String cadenceType;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String status;

    private String goal;
}
