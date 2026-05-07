package com.smarttracker.budgetservice.config;

import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.IgniteConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IgniteCacheConfig {

    @Bean
    public org.apache.ignite.Ignite igniteInstance() {
        IgniteConfiguration cfg = new IgniteConfiguration();
        cfg.setClientMode(true);
        cfg.setIgniteInstanceName("budget-ignite");

        org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi spi = new org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi();
        org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder ipFinder = new org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder();
        ipFinder.setAddresses(java.util.Arrays.asList("127.0.0.1:47500..47509"));
        spi.setIpFinder(ipFinder);
        cfg.setDiscoverySpi(spi);

        return Ignition.start(cfg);
    }
}
