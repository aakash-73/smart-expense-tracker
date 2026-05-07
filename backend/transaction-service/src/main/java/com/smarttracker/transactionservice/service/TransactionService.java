package com.smarttracker.transactionservice.service;

import java.util.List;

import com.smarttracker.transactionservice.model.Transaction;

public interface TransactionService {
    Transaction createTransaction(Transaction transaction);
    List<Transaction> getTransactionsByUserId(String userId);
}
