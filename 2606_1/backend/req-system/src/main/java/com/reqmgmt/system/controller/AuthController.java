package com.reqmgmt.system.controller;

import com.reqmgmt.common.response.R;
import com.reqmgmt.common.utils.JwtUtils;
import com.reqmgmt.common.utils.LoginUser;
import com.reqmgmt.common.utils.SecurityUtils;
import com.reqmgmt.system.dto.LoginDTO;
import com.reqmgmt.system.service.DingTalkAuthService;
import com.reqmgmt.system.service.SysUserService;
import com.reqmgmt.system.vo.DingTalkAuthConfigVO;
import com.reqmgmt.system.vo.DingTalkCallbackResultVO;
import com.reqmgmt.system.vo.LoginVO;
import com.reqmgmt.system.vo.UserInfoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "登录/登出/刷新Token等接口")
public class AuthController {

    private final SysUserService sysUserService;
    private final JwtUtils jwtUtils;
    private final DingTalkAuthService dingTalkAuthService;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户名密码登录，返回JWT Token")
    public R<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        log.info("用户登录: {}", loginDTO.getUsername());
        LoginVO loginVO = sysUserService.login(loginDTO);
        return R.ok(loginVO);
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "退出登录")
    public R<Void> logout() {
        // JWT无状态，客户端清除token即可
        // 如需服务端使token失效，可将token加入Redis黑名单
        log.info("用户登出");
        return R.ok();
    }

    @GetMapping("/info")
    @Operation(summary = "获取当前用户信息", description = "根据Token获取当前登录用户信息")
    public R<UserInfoVO> info() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return R.fail(401, "未登录或登录已过期");
        }
        UserInfoVO userInfoVO = sysUserService.getUserInfo(userId);
        return R.ok(userInfoVO);
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新Token", description = "验证旧token，生成新token返回")
    public R<Map<String, Object>> refresh() {
        LoginUser loginUser = SecurityUtils.getLoginUser();
        if (loginUser == null) {
            return R.fail(401, "未登录或登录已过期");
        }
        // 生成新Token
        String newToken = jwtUtils.generateToken(
                loginUser.getUserId(),
                loginUser.getUsername(),
                loginUser.getRoleId(),
                loginUser.getRoleKey()
        );
        return R.ok(Map.of("token", newToken));
    }

    @GetMapping("/dingtalk/config")
    @Operation(summary = "获取钉钉登录配置")
    public R<DingTalkAuthConfigVO> getDingTalkConfig() {
        return R.ok(dingTalkAuthService.getLoginConfig());
    }

    @GetMapping("/dingtalk/callback")
    @Operation(summary = "钉钉登录回调预留接口")
    public R<DingTalkCallbackResultVO> dingTalkCallback(@RequestParam(required = false) String authCode,
                                                        @RequestParam(required = false) String state) {
        return R.ok(dingTalkAuthService.handleCallback(authCode, state));
    }
}
