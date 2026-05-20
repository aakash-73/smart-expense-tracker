package com.smarttracker.analyticsservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Read-only view of the transactions collection (owned by transaction-service).
 * Analytics-service reads from this collection but never writes to it.
 */
@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;

    private String userId;
    private String type;        // "INCOME" or "EXPENSE"
    private String category;
    private Double amount;
    private String description;
    private Instant timestamp;
}
