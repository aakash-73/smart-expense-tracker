package com.smarttracker.transactionservice.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smarttracker.transactionservice.model.Transaction;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findTop5ByUserIdOrderByTimestampDesc(String userId);
}
