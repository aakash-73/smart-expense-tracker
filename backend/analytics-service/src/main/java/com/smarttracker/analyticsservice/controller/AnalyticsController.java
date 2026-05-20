package com.smarttracker.analyticsservice.controller;

import com.smarttracker.analyticsservice.model.Transaction;
import com.smarttracker.analyticsservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final TransactionRepository transactionRepository;

    /**
     * GET /api/analytics/summary/{userId}
     * Current-month totals + insight figures.
     */
    @GetMapping("/summary/{userId}")
    public Map<String, Object> getSummary(@PathVariable String userId) {
        YearMonth current = YearMonth.now();
        Instant from = current.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to   = current.atEndOfMonth().atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();

        List<Transaction> txs = transactionRepository
                .findByUserIdAndTimestampBetween(userId, from, to);

        double totalIncome   = txs.stream().filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0).sum();
        double totalExpenses = txs.stream().filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0).sum();
        double netSavings    = totalIncome - totalExpenses;
        double savingRate    = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        // Biggest expense category (all-time for this user for richer insights)
        List<Transaction> allExpenses = transactionRepository.findByUserId(userId).stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.toList());

        Map<String, Double> byCategory = allExpenses.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory() : "Other",
                        Collectors.summingDouble(t -> t.getAmount() != null ? t.getAmount() : 0)
                ));

        String biggestCat    = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("N/A");
        double biggestAmt    = byCategory.getOrDefault(biggestCat, 0.0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalIncome",             totalIncome);
        result.put("totalExpenses",           totalExpenses);
        result.put("netSavings",              netSavings);
        result.put("savingRate",              Math.round(savingRate * 10.0) / 10.0);
        result.put("transactionCount",        txs.size());
        result.put("biggestExpenseCategory",  biggestCat);
        result.put("biggestExpenseAmount",    biggestAmt);
        return result;
    }

    /**
     * GET /api/analytics/monthly/{userId}
     * Income / expense / savings for the last 6 months.
     */
    @GetMapping("/monthly/{userId}")
    public List<Map<String, Object>> getMonthly(@PathVariable String userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym   = current.minusMonths(i);
            Instant from   = ym.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
            Instant to     = ym.atEndOfMonth().atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();

            List<Transaction> txs = transactionRepository
                    .findByUserIdAndTimestampBetween(userId, from, to);

            double income   = txs.stream().filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0).sum();
            double expense  = txs.stream().filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0).sum();

            Map<String, Object> month = new LinkedHashMap<>();
            month.put("month",   ym.format(DateTimeFormatter.ofPattern("yyyy-MM")));
            month.put("label",   ym.format(DateTimeFormatter.ofPattern("MMM")));
            month.put("income",  income);
            month.put("expense", expense);
            month.put("savings", income - expense);
            result.add(month);
        }
        return result;
    }

    /**
     * GET /api/analytics/categories/{userId}
     * All-time expense totals per category (for pie chart).
     */
    @GetMapping("/categories/{userId}")
    public List<Map<String, Object>> getCategories(@PathVariable String userId) {
        List<Transaction> expenses = transactionRepository.findByUserId(userId).stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.toList());

        Map<String, Double> grouped = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory() : "Other",
                        Collectors.summingDouble(t -> t.getAmount() != null ? t.getAmount() : 0)
                ));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("category", e.getKey());
                    m.put("total",    Math.round(e.getValue() * 100.0) / 100.0);
                    return m;
                })
                .collect(Collectors.toList());
    }
}
