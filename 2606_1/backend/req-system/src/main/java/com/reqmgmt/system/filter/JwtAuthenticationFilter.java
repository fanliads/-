package com.reqmgmt.system.filter;

import com.reqmgmt.common.utils.JwtUtils;
import com.reqmgmt.common.utils.LoginUser;
import com.reqmgmt.system.service.SysUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT认证过滤器
 * 从请求头提取Bearer Token，解析并设置SecurityContext
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final SysUserService sysUserService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, @Lazy SysUserService sysUserService) {
        this.jwtUtils = jwtUtils;
        this.sysUserService = sysUserService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtils.validateToken(token)) {
            try {
                Long userId = jwtUtils.getUserId(token);
                String username = jwtUtils.getUsername(token);

                // 查询用户的角色和权限信息
                List<String> permissionKeys = sysUserService.getPermissionKeysByUserId(userId);
                Long roleId = sysUserService.getRoleIdByUserId(userId);
                String roleKey = sysUserService.getRoleKeyByRoleId(roleId);

                LoginUser loginUser = new LoginUser(userId, username, roleId, roleKey, permissionKeys);

                List<SimpleGrantedAuthority> authorities = permissionKeys != null
                        ? permissionKeys.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
                        : Collections.emptyList();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(loginUser, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception e) {
                log.warn("JWT Token解析失败: {}", e.getMessage());
                // Token无效或过期，放行，由后续Security配置决定是否拦截
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头提取Bearer Token
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
