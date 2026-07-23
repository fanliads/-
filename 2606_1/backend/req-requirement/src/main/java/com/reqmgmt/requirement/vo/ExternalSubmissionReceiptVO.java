package com.reqmgmt.requirement.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/** 外部提报成功后返回的最小受理凭证。 */
@Data
@AllArgsConstructor
public class ExternalSubmissionReceiptVO {
    private Long id;
    private String reqNo;
    private LocalDateTime submittedAt;
    private boolean duplicate;
}
