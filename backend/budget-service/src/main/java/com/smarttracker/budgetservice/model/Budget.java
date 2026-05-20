package com.smarttracker.budgetservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "budget_categories")
public class Budget {
    @Id
    private String id;

    private String userId;
    private String category;
    private double monthlyLimit;
    private String icon;        // emoji, e.g. "🛒"
}
