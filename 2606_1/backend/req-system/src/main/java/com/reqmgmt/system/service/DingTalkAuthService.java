package com.reqmgmt.system.service;

import com.reqmgmt.system.vo.DingTalkAuthConfigVO;
import com.reqmgmt.system.vo.DingTalkCallbackResultVO;

public interface DingTalkAuthService {

    DingTalkAuthConfigVO getLoginConfig();

    DingTalkCallbackResultVO handleCallback(String authCode, String state);
}
