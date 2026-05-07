package com.smarttracker.transactionservice.model;

import java.time.Instant;

import org.bson.types.ObjectId;
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
    private ObjectId id;

    private String userId;
    private String type; // "INCOME" or "EXPENSE"
    private String category;
    private Double amount;
    private String description;
    @Builder.Default
    private Instant timestamp = Instant.now(); // auto-set when object is created
}
