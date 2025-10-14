package com.pradha.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Pradha Fashion Outlet Backend API is running! Visit /api/products to see products.";
    }
}