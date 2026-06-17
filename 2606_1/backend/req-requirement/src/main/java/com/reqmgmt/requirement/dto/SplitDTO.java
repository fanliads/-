package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 需求拆分DTO
 */
@Data
public class SplitDTO {

    @NotNull(message = "原始需求ID不能为空")
    private Long rawReqId;

    private List<SplitItem> items;

    /**
     * 拆分的产品需求项
     */
    @Data
    public static class SplitItem {

        private String title;

        private String description;

        private String handler;

        private String priority;

        private Long businessLineId;

        private String productModule;

        private String reqType;
    }
}
