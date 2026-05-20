package com.smarttracker.authservice.service;

import com.smarttracker.authservice.model.User;
import com.smarttracker.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
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
    private JwtService jwtService;

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
        user.setEmail("test@example.com");
        user.setPassword("Password1!");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password1!")).thenReturn("hashedPassword");

        // registerUser returns void — just verify it does not throw and saves the user
        assertDoesNotThrow(() -> authService.registerUser(user));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_DuplicateEmail_ThrowsConflict() {
        User existing = new User();
        existing.setEmail("test@example.com");

        User user = new User();
        user.setUsername("newuser");
        user.setEmail("test@example.com");
        user.setPassword("Password1!");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existing));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.registerUser(user));

        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void loginUser_Success() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("hashedPassword");
        user.setRoles(List.of("ROLE_USER"));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1!", "hashedPassword")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mockedJwtToken");

        String token = authService.loginUser("test@example.com", "Password1!");

        assertEquals("mockedJwtToken", token);
    }

    @Test
    void loginUser_WrongPassword_ThrowsUnauthorized() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.loginUser("test@example.com", "wrongPassword"));

        assertEquals(401, ex.getStatusCode().value());
    }

    @Test
    void loginUser_EmailNotFound_ThrowsUnauthorized() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> authService.loginUser("nobody@example.com", "anyPassword"));

        assertEquals(401, ex.getStatusCode().value());
    }
}
