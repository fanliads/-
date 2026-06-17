package com.reqmgmt.sprint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SprintTeamConfigDTO {

    @NotBlank
    private String teamName;

    @NotBlank
    private String defaultCadenceType;

    private Integer autoCreateEnabled;
}
