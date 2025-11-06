package com.pradha.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Pradha Fashion Outlet Backend API is running! Server time: " + java.time.LocalDateTime.now();
    }

    @GetMapping("/health")
    public String health() {
        return "OK - Server is healthy at " + java.time.LocalDateTime.now();
    }

    @GetMapping("/test")
    public String test() {
        return "Test endpoint working!";
    }
}
