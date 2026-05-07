package com.smarttracker.authservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * OAuth2 Google login is disabled until real Google credentials are configured.
 * To re-enable: add spring-boot-starter-oauth2-client to pom.xml and
 * set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env with real values.
 */
@RestController
@RequestMapping("/api/auth")
public class OAuthController {

    @GetMapping("/oauth-success")
    public ResponseEntity<String> oauthSuccess() {
        return ResponseEntity.badRequest()
                .body("Google OAuth2 is not configured. Please set up real Google credentials.");
    }
}
