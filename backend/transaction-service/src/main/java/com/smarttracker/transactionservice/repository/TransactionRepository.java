package com.smarttracker.transactionservice.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.smarttracker.transactionservice.model.Transaction;

public interface TransactionRepository extends MongoRepository<Transaction, ObjectId> {
    List<Transaction> findByUserId(String userId);
}
