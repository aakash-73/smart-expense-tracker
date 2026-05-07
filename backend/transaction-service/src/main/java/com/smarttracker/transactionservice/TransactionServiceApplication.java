package com.smarttracker.transactionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class TransactionServiceApplication {

	public static void main(String[] args) {
		// Load the .env file
		Dotenv dotenv = Dotenv.configure()
			.directory("../") // Go up from transaction-service to backend/
			.filename(".env") // .env file is in backend/
			.load();

		// Set environment property for Spring to pick up
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));

		SpringApplication.run(TransactionServiceApplication.class, args);
	}
}
