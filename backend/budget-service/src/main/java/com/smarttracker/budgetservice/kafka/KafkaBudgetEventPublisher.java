package com.smarttracker.budgetservice.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KafkaBudgetEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate = null;

    public void publishBudgetCreatedEvent(String userId, String month, double estimatedIncome) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "BUDGET_CREATED");
        event.put("userId", userId);
        event.put("month", month);
        event.put("estimatedIncome", estimatedIncome);

        String topic = "budget-events";
        kafkaTemplate.send(topic, userId, event.toString());
        System.out.println("✅ Published Kafka event: " + event);
    }
}
