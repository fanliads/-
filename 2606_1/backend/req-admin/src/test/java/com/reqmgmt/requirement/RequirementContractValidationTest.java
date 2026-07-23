package com.reqmgmt.requirement;

import com.reqmgmt.requirement.dto.ExternalSubmissionDTO;
import com.reqmgmt.requirement.dto.ProductRequirementCreateDTO;
import com.reqmgmt.common.exception.BusinessException;
import com.reqmgmt.requirement.service.impl.ExternalSubmissionRateLimiter;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RequirementContractValidationTest {
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void acceptsMinimalExternalSubmission() {
        ExternalSubmissionDTO dto = validExternalSubmission();
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void rejectsExternalSubmissionWithoutContactAndConsent() {
        ExternalSubmissionDTO dto = validExternalSubmission();
        dto.setProposerContact(" ");
        dto.setPrivacyAccepted(false);
        Set<String> fields = validator.validate(dto).stream().map(item -> item.getPropertyPath().toString()).collect(java.util.stream.Collectors.toSet());
        assertThat(fields).contains("proposerContact", "privacyAccepted");
    }

    @Test
    void rejectsUnsafeExternalLinkAndChannel() {
        ExternalSubmissionDTO dto = validExternalSubmission();
        dto.setReqLink("javascript:alert(1)");
        dto.setSourceChannel("unknown");
        Set<String> fields = validator.validate(dto).stream().map(item -> item.getPropertyPath().toString()).collect(java.util.stream.Collectors.toSet());
        assertThat(fields).contains("reqLink", "sourceChannel");
    }

    @Test
    void acceptsMinimalProductCreation() {
        ProductRequirementCreateDTO dto = new ProductRequirementCreateDTO();
        dto.setTitle("统一需求 Peek");
        dto.setPriority("P2");
        dto.setStatus("pending_design");
        dto.setPrdUrl("https://example.com/prd/1");
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void rejectsInvalidProductPriorityStatusAndUrl() {
        ProductRequirementCreateDTO dto = new ProductRequirementCreateDTO();
        dto.setTitle("无效产品需求");
        dto.setPriority("HIGH");
        dto.setStatus("deleted");
        dto.setPrdUrl("file:///tmp/secret");
        Set<String> fields = validator.validate(dto).stream().map(item -> item.getPropertyPath().toString()).collect(java.util.stream.Collectors.toSet());
        assertThat(fields).contains("priority", "status", "prdUrl");
    }

    @Test
    void rejectsOversizedProductTitle() {
        ProductRequirementCreateDTO dto = new ProductRequirementCreateDTO();
        dto.setTitle("需".repeat(201));
        assertThat(validator.validate(dto)).anyMatch(item -> item.getPropertyPath().toString().equals("title"));
    }

    @Test
    void rateLimitsRepeatedExternalSubmissionsFromOneClient() {
        ExternalSubmissionRateLimiter limiter = new ExternalSubmissionRateLimiter();
        for (int attempt = 0; attempt < 10; attempt++) {
            limiter.check("127.0.0.1");
        }
        assertThat(org.assertj.core.api.Assertions.catchThrowable(() -> limiter.check("127.0.0.1")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("提交过于频繁，请稍后再试");
        limiter.check("127.0.0.2");
    }

    private ExternalSubmissionDTO validExternalSubmission() {
        ExternalSubmissionDTO dto = new ExternalSubmissionDTO();
        dto.setTitle("客户希望批量导入需求");
        dto.setDescription("当前需要逐条录入，影响实施效率。");
        dto.setProposer("王女士");
        dto.setProposerContact("wang@example.com");
        dto.setSourceChannel("qrcode");
        dto.setClientRequestId("request_260722_abcdef123456");
        dto.setPrivacyAccepted(true);
        return dto;
    }
}
