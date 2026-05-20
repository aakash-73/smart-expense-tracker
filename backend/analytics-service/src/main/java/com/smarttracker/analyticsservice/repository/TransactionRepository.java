package com.smarttracker.analyticsservice.repository;

import com.smarttracker.analyticsservice.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findByUserIdAndTimestampBetween(String userId, Instant from, Instant to);
}
