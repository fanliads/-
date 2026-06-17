package com.reqmgmt.sprint.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.reqmgmt.sprint.dto.SprintCreateDTO;
import com.reqmgmt.sprint.dto.SprintTeamConfigDTO;
import com.reqmgmt.sprint.dto.SprintUpdateDTO;
import com.reqmgmt.sprint.entity.Sprint;
import com.reqmgmt.sprint.vo.SprintDetailVO;
import com.reqmgmt.sprint.vo.SprintOptionVO;
import com.reqmgmt.sprint.vo.SprintTeamConfigVO;

import java.util.List;

/**
 * 迭代Service接口
 */
public interface SprintService extends IService<Sprint> {

    List<Sprint> listSprints();

    List<SprintOptionVO> listOptions();

    List<SprintTeamConfigVO> listTeamConfigs();

    SprintDetailVO getDetail(Long id);

    Long createSprint(SprintCreateDTO dto);

    void updateSprint(Long id, SprintUpdateDTO dto);

    void saveTeamConfig(SprintTeamConfigDTO dto);

    void autoCreateUpcomingSprints();

    void bindRequirement(Long sprintId, Long requirementId);

    void removeRequirement(Long sprintId, Long requirementId);
}
