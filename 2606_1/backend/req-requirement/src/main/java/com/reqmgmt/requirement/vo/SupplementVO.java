package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 补充内容VO
 */
@Data
public class SupplementVO {

    private Long id;

    private String supplementType;

    private String supplementTypeName;

    private String content;

    private String attachment;

    private String userName;

    private LocalDateTime createTime;
}
