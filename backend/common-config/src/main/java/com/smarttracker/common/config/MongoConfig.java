package com.smarttracker.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    @Override
    protected String getDatabaseName() {
        return "expense-tracker-db";
    }

    @Override
    public boolean autoIndexCreation() {
        return true;
    }
}
