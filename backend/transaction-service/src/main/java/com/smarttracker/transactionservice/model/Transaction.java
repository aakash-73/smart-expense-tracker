package com.smarttracker.transactionservice.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    private String id;          // hex string — MongoDB auto-generates ObjectId on insert

    private String userId;
    private String type;        // "INCOME" or "EXPENSE"
    private String category;
    private Double amount;
    private String description;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
