package com.smarttracker.budgetservice.service;

import com.smarttracker.budgetservice.model.Budget;
import com.smarttracker.budgetservice.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public List<Budget> getBudgetsByUser(String userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public void deleteBudget(String id) {
        budgetRepository.deleteById(id);
    }
}
