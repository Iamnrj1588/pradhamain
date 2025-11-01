package com.pradha.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/api/health")
    public Map<String, String> health() {
        try (Connection connection = dataSource.getConnection()) {
            return Map.of(
                "status", "UP",
                "database", "Connected",
                "url", connection.getMetaData().getURL()
            );
        } catch (Exception e) {
            return Map.of(
                "status", "DOWN",
                "database", "Disconnected",
                "error", e.getMessage()
            );
        }
    }
}

