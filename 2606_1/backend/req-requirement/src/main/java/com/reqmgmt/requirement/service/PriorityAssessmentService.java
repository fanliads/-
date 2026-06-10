package com.reqmgmt.requirement.service;

import com.reqmgmt.requirement.dto.PriorityAssessmentContextDTO;
import com.reqmgmt.requirement.entity.RawRequirement;
import com.reqmgmt.requirement.vo.PriorityAssessmentVO;

public interface PriorityAssessmentService {

    PriorityAssessmentVO assessOnCreate(RawRequirement rawRequirement);

    PriorityAssessmentVO reassess(Long rawRequirementId, PriorityAssessmentContextDTO context);

    PriorityAssessmentVO getLatestAssessment(Long rawRequirementId);
}
