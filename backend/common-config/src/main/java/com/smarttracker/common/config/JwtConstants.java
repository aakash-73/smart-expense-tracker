package com.smarttracker.common.config;

public class JwtConstants {
    public static final String SECRET = "ReplaceWithASecureSecretKey";
    public static final long EXPIRATION_TIME = 86400000; // 1 day in ms
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
}
