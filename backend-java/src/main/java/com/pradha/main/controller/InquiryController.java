package com.pradha.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @GetMapping
    public List<String> getInquiries() {
        // Temporary dummy data
        List<String> inquiries = new ArrayList<>();
        inquiries.add("Inquiry 1: Customer wants custom lehenga size M");
        inquiries.add("Inquiry 2: Customer asks about silk saree availability");
        return inquiries;
    }
}
