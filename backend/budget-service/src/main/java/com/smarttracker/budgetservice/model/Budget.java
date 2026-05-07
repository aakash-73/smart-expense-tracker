package com.smarttracker.budgetservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "budgets")
public class Budget {
    @Id
    private String id;
    private String userId;
    private double estimatedIncome;
    private double savingsGoal;
    private String month;
    private List<ExpenseItem> expenses;
}
