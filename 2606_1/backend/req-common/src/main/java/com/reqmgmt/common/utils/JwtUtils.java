package com.reqmgmt.common.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT工具类
 */
@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * 获取签名密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成JWT Token（含角色信息）
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param roleId   角色ID
     * @param roleKey  角色标识
     * @return JWT Token字符串
     */
    public String generateToken(Long userId, String username, Long roleId, String roleKey) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("roleId", roleId)
                .claim("roleKey", roleKey)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 生成JWT Token（仅含基本信息）
     *
     * @param userId   用户ID
     * @param username 用户名
     * @return JWT Token字符串
     */
    public String generateToken(Long userId, String username) {
        return generateToken(userId, username, null, null);
    }

    /**
     * 解析Token获取Claims
     *
     * @param token JWT Token
     * @return Claims对象
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException e) {
            log.warn("JWT Token验证失败: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.warn("JWT Token为空");
            return false;
        }
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public Long getUserId(String token) {
        Claims claims = parseToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * 从Token中获取角色ID
     *
     * @param token JWT Token
     * @return 角色ID
     */
    public Long getRoleId(String token) {
        Claims claims = parseToken(token);
        return claims.get("roleId", Long.class);
    }

    /**
     * 从Token中获取角色标识
     *
     * @param token JWT Token
     * @return 角色标识
     */
    public String getRoleKey(String token) {
        Claims claims = parseToken(token);
        return claims.get("roleKey", String.class);
    }
}
