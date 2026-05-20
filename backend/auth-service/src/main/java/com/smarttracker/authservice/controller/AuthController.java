package com.smarttracker.authservice.controller;

import com.smarttracker.authservice.model.User;
import com.smarttracker.authservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register — accepts { username, email, password } */
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody User user) {
        authService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** POST /api/auth/login — accepts { email, password }, returns raw JWT string */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        String token = authService.loginUser(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(token);
    }
}
