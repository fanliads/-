package com.reqmgmt.system.config;

import com.reqmgmt.system.filter.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reqmgmt.common.response.R;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

/**
 * Spring Security配置
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private void applyExceptionHandling(HttpSecurity http) throws Exception {
        http.exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    R<Void> result = R.fail(401, "未登录或登录已过期");
                    response.getWriter().write(new ObjectMapper().writeValueAsString(result));
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    R<Void> result = R.fail(403, "没有访问权限");
                    response.getWriter().write(new ObjectMapper().writeValueAsString(result));
                })
        );
    }

    /**
     * 外部提报匿名入口使用独立安全链，避免被主认证链误拦截。
     */
    @Bean
    @Order(1)
    public SecurityFilterChain externalSubmitFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(new AntPathRequestMatcher("/api/raw-requirements/external-submit", HttpMethod.POST.name()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        applyExceptionHandling(http);
        return http.build();
    }

    /**
     * 安全过滤链配置
     */
    @Bean
    @Order(2)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF（前后端分离，使用JWT）
            .csrf(AbstractHttpConfigurer::disable)
            // 无状态会话
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // CORS配置
            .cors(Customizer.withDefaults())
            // 接口权限配置
            .authorizeHttpRequests(auth -> auth
                // 放行登录注册接口
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/dingtalk/config", "/api/auth/dingtalk/callback").permitAll()
                // 放行Swagger/Knife4j相关路径
                .requestMatchers("/doc.html", "/swagger-resources/**", "/webjars/**",
                        "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // 放行OPTIONS预检请求
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 放行错误路径
                .requestMatchers("/error").permitAll()
                // 其余接口需要认证
                .anyRequest().authenticated()
            )
            // 在UsernamePasswordAuthenticationFilter之前添加JWT过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        applyExceptionHandling(http);
        return http.build();
    }

    /**
     * 密码编码器
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 防止JWT过滤器被Servlet容器重复注册
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilterRegistration(JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
