package com.reqmgmt.system.vo;

import lombok.Data;

@Data
public class DingTalkCallbackResultVO {

    private Boolean success;
    private String message;
    private LoginVO login;
}
