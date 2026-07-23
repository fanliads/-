package com.reqmgmt.requirement.service.impl;

import com.reqmgmt.common.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 外部匿名提报的进程内固定窗口限流器。
 *
 * <p>生产环境仍应在网关层配置全局限流；这里作为应用侧兜底，避免单一来源在短时间内
 * 大量创建记录。客户端标识只使用容器看到的远端地址，避免信任可伪造的转发头。</p>
 */
@Component
public class ExternalSubmissionRateLimiter {
    static final int MAX_ATTEMPTS_PER_MINUTE = 10;
    static final long WINDOW_MILLIS = 60_000L;
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();
    private final Clock clock;

    public ExternalSubmissionRateLimiter() {
        this(Clock.systemUTC());
    }

    ExternalSubmissionRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void check(String clientAddress) {
        long now = clock.millis();
        String clientKey = clientAddress == null || clientAddress.isBlank() ? "unknown" : clientAddress;
        AtomicBoolean rejected = new AtomicBoolean(false);

        attempts.compute(clientKey, (key, current) -> {
            if (current == null || now - current.windowStartedAt() >= WINDOW_MILLIS) {
                return new AttemptWindow(now, 1);
            }
            if (current.count() >= MAX_ATTEMPTS_PER_MINUTE) {
                rejected.set(true);
                return current;
            }
            return new AttemptWindow(current.windowStartedAt(), current.count() + 1);
        });

        if (attempts.size() > MAX_TRACKED_CLIENTS) {
            attempts.entrySet().removeIf(entry -> now - entry.getValue().windowStartedAt() >= WINDOW_MILLIS);
        }
        if (rejected.get()) {
            throw new BusinessException(429, "提交过于频繁，请稍后再试");
        }
    }

    private record AttemptWindow(long windowStartedAt, int count) {
    }
}
