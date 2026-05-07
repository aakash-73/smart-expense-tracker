package com.smarttracker.budgetservice.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BudgetEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate = null;

    public void publishBudgetEvent(String eventJson) {
        kafkaTemplate.send("budget-events", eventJson);
    }
}
