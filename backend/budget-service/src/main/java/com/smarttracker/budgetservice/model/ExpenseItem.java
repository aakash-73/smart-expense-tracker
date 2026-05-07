package com.smarttracker.budgetservice.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseItem {
    private String category;
    private double amount;
    private String note;
}
