package com.reqmgmt.requirement.vo;

import lombok.Data;

import java.util.List;

/**
 * 泛型分页结果
 */
@Data
public class PageResult<T> {

    private Long total;

    private List<T> list;

    private Integer page;

    private Integer size;

    public PageResult() {
    }

    public PageResult(Long total, List<T> list, Integer page, Integer size) {
        this.total = total;
        this.list = list;
        this.page = page;
        this.size = size;
    }
}
