package com.reqmgmt.system.vo;

import lombok.Data;

@Data
public class DingTalkAuthConfigVO {

    private Boolean enabled;
    private String loginUrl;
    private String callbackPath;
    private String message;
}
