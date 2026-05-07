package com.smarttracker.budgetservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttracker.budgetservice.model.Budget;
import com.smarttracker.budgetservice.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.apache.ignite.Ignite;
import org.apache.ignite.cache.CacheMode;
import org.apache.ignite.configuration.CacheConfiguration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.cache.Cache;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository = null;
    private final KafkaTemplate<String, String> kafkaTemplate = null;
    private final Ignite ignite = null;
    private Cache<String, Budget> budgetCache;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String TOPIC = "budget-events";

    @PostConstruct
    public void initCache() {
        CacheConfiguration<String, Budget> cfg = new CacheConfiguration<>("budgetCache");
        cfg.setCacheMode(CacheMode.PARTITIONED);
        budgetCache = ignite.getOrCreateCache(cfg);
    }

    public Budget saveOrUpdateBudget(Budget budget) {
        // Save to DB
        Budget saved = budgetRepository.save(budget);

        // Cache
        String cacheKey = budget.getUserId() + ":" + budget.getMonth();
        budgetCache.put(cacheKey, saved);

        // Kafka Publish
        try {
            String budgetJson = objectMapper.writeValueAsString(saved);
            kafkaTemplate.send(TOPIC, budgetJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing budget for Kafka", e);
        }

        return saved;
    }

    public Optional<Budget> getBudget(String userId, String month) {
        String key = userId + ":" + month;
        Budget cached = budgetCache.get(key);
        if (cached != null) return Optional.of(cached);
        return budgetRepository.findByUserIdAndMonth(userId, month);
    }
}
