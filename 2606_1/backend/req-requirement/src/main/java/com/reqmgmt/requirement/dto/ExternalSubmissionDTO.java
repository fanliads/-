package com.reqmgmt.requirement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/** 免登录外部原始需求提报。 */
@Data
public class ExternalSubmissionDTO {
    @NotBlank(message = "需求标题不能为空")
    @Size(max = 100, message = "需求标题不能超过100个字符")
    private String title;

    @NotBlank(message = "问题或需求描述不能为空")
    @Size(max = 4000, message = "需求描述不能超过4000个字符")
    private String description;

    @NotBlank(message = "姓名或称呼不能为空")
    @Size(max = 100, message = "姓名或称呼不能超过100个字符")
    private String proposer;

    @NotBlank(message = "联系方式不能为空")
    @Size(max = 200, message = "联系方式不能超过200个字符")
    private String proposerContact;

    @Size(max = 200, message = "公司或客户名称不能超过200个字符")
    private String company;

    @Size(max = 200, message = "项目名称不能超过200个字符")
    private String projectName;

    @Size(max = 4000, message = "期望结果不能超过4000个字符")
    private String expectedResult;

    @Size(max = 100, message = "业务线不能超过100个字符")
    private String businessLine;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedOnlineDate;

    @Pattern(regexp = "^$|^https?://[^\\s]+$", message = "资料链接格式不正确")
    @Size(max = 500, message = "资料链接不能超过500个字符")
    private String reqLink;

    @Size(max = 4000, message = "补充说明不能超过4000个字符")
    private String supplementary;

    @Pattern(regexp = "^(link|qrcode|wechat|dingtalk)$", message = "来源渠道不合法")
    private String sourceChannel;

    @Pattern(regexp = "^$|^(wechat|dingtalk)$", message = "身份来源不合法")
    private String identityProvider;

    @Size(max = 100, message = "身份名称不能超过100个字符")
    private String identityName;

    @Pattern(regexp = "^[A-Za-z0-9_-]{16,64}$", message = "提交标识格式不正确")
    private String clientRequestId;

    @AssertTrue(message = "请阅读并同意信息用途说明")
    private boolean privacyAccepted;
}
