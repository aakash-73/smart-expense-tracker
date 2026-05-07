package com.smarttracker.budgetservice.config;

import org.apache.ignite.Ignite;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IgniteConfig {

    @Bean
    public Ignite igniteInstance() {
        IgniteConfiguration config = new IgniteConfiguration();
        config.setClientMode(true);
        return Ignition.start(config);
    }
}
