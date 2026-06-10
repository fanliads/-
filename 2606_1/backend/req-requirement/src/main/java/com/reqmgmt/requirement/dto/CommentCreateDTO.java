package com.reqmgmt.requirement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 创建评论DTO
 */
@Data
public class CommentCreateDTO {

    @NotBlank(message = "评论内容不能为空")
    private String content;

    private Long parentId;
}
