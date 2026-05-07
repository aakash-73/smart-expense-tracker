package com.smarttracker.budgetservice;

import org.apache.ignite.Ignite;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BudgetServiceApplication {

    public static void main(String[] args) {
        IgniteConfiguration cfg = new IgniteConfiguration();
        cfg.setIgniteInstanceName("budgetServiceIgniteNode");
        Ignite ignite = Ignition.start(cfg);
        SpringApplication.run(BudgetServiceApplication.class, args);
    }
}
