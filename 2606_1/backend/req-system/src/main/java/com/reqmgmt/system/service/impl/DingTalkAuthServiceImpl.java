package com.reqmgmt.system.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.reqmgmt.system.entity.ExternalIdentityMapping;
import com.reqmgmt.system.entity.SysUser;
import com.reqmgmt.system.mapper.ExternalIdentityMappingMapper;
import com.reqmgmt.system.service.DingTalkAuthService;
import com.reqmgmt.system.service.SysUserService;
import com.reqmgmt.system.vo.DingTalkAuthConfigVO;
import com.reqmgmt.system.vo.DingTalkCallbackResultVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DingTalkAuthServiceImpl implements DingTalkAuthService {

    private final ExternalIdentityMappingMapper externalIdentityMappingMapper;
    private final SysUserService sysUserService;

    @Value("${auth.dingtalk.enabled:false}")
    private boolean enabled;

    @Value("${auth.dingtalk.login-url:}")
    private String loginUrl;

    @Value("${auth.dingtalk.callback-path:/login/dingtalk/callback}")
    private String callbackPath;

    public DingTalkAuthServiceImpl(ExternalIdentityMappingMapper externalIdentityMappingMapper, SysUserService sysUserService) {
        this.externalIdentityMappingMapper = externalIdentityMappingMapper;
        this.sysUserService = sysUserService;
    }

    @Override
    public DingTalkAuthConfigVO getLoginConfig() {
        DingTalkAuthConfigVO vo = new DingTalkAuthConfigVO();
        vo.setEnabled(enabled);
        vo.setLoginUrl(loginUrl);
        vo.setCallbackPath(callbackPath);
        vo.setMessage(enabled ? "钉钉登录已启用" : "钉钉登录尚未启用，当前仅预留架构");
        return vo;
    }

    @Override
    public DingTalkCallbackResultVO handleCallback(String authCode, String state) {
        DingTalkCallbackResultVO result = new DingTalkCallbackResultVO();
        if (!enabled) {
            result.setSuccess(false);
            result.setMessage("钉钉登录未启用，当前环境仅保留回调入口");
            return result;
        }
        if (StrUtil.isBlank(authCode)) {
            result.setSuccess(false);
            result.setMessage("缺少authCode");
            return result;
        }

        ExternalIdentityMapping mapping = externalIdentityMappingMapper.selectOne(
                new LambdaQueryWrapper<ExternalIdentityMapping>()
                        .eq(ExternalIdentityMapping::getProvider, "dingtalk")
                        .eq(ExternalIdentityMapping::getExternalUserId, authCode)
                        .eq(ExternalIdentityMapping::getStatus, 1)
                        .last("LIMIT 1")
        );
        if (mapping == null) {
            result.setSuccess(false);
            result.setMessage("未找到钉钉身份映射，当前回调仅完成架构预留");
            return result;
        }

        SysUser user = sysUserService.getById(mapping.getUserId());
        if (user == null) {
            result.setSuccess(false);
            result.setMessage("映射的内部用户不存在");
            return result;
        }

        result.setSuccess(true);
        result.setMessage(StrUtil.blankToDefault(state, "钉钉登录成功"));
        result.setLogin(sysUserService.buildLoginVO(user));
        return result;
    }
}
