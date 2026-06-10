package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 评论VO
 */
@Data
public class CommentVO {

    private Long id;

    private String content;

    private String userName;

    private Long parentId;

    private LocalDateTime createTime;
}
