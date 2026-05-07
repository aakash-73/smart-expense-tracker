package com.smarttracker.authservice;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class AuthServiceApplication {

    public static void main(String[] args) {
        // Load .env from ../ (backend directory)
        Dotenv dotenv = Dotenv.configure()
                .directory("../")           // One level up from auth-service to backend/
                .filename(".env")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // Load JWT_SECRET from .env into Spring Boot environment
        String jwtSecret = dotenv.get("JWT_SECRET");
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new RuntimeException("JWT_SECRET not found in .env file");
        }

        Map<String, Object> props = new HashMap<>();
        props.put("JWT_SECRET", jwtSecret);

        // Run Spring Boot with custom props
        SpringApplication app = new SpringApplication(AuthServiceApplication.class);
        app.setDefaultProperties(props);
        app.run(args);
    }
}
