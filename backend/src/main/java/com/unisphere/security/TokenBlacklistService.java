package com.unisphere.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private final Map<String, Long> localBlacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, long expirationMs) {
        try {
            String key = BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(key, "true", expirationMs, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.warn("Redis connection failed. Falling back to local in-memory token blacklist.");
            localBlacklist.put(token, System.currentTimeMillis() + expirationMs);
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            Long expiry = localBlacklist.get(token);
            if (expiry != null) {
                if (System.currentTimeMillis() > expiry) {
                    localBlacklist.remove(token);
                    return false;
                }
                return true;
            }
            return false;
        }
    }
}
