package com.smarttracker.budgetservice.controller;

import com.smarttracker.budgetservice.model.Budget;
import com.smarttracker.budgetservice.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /** GET /api/budgets/user/{userId} — all budget categories for a user */
    @GetMapping("/user/{userId}")
    public List<Budget> getBudgets(@PathVariable String userId) {
        return budgetService.getBudgetsByUser(userId);
    }

    /** POST /api/budgets — create a new budget category */
    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        Budget saved = budgetService.createBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** DELETE /api/budgets/{id} — remove a budget category */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
