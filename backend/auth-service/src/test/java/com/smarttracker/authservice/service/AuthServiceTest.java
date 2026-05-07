package com.smarttracker.authservice.service;

import com.smarttracker.authservice.config.JwtUtil;
import com.smarttracker.authservice.model.User;
import com.smarttracker.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerUser_Success() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password123");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        String result = authService.registerUser(user);

        assertEquals("User registered successfully", result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void loginUser_Success() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("testuser")).thenReturn("mockedJwtToken");

        String token = authService.loginUser("testuser", "password123");

        assertEquals("mockedJwtToken", token);
    }
    
    @Test
    void loginUser_InvalidCredentials() {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            authService.loginUser("testuser", "wrongPassword");
        });

        assertEquals("Invalid credentials!", exception.getMessage());
    }
}
