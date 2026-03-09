package com.pradha.main.controller;

import com.pradha.main.entity.CustomerFeedback;
import com.pradha.main.repository.CustomerFeedbackRepository;
import com.pradha.main.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.205.19.24"})
public class CustomerFeedbackController {

    @Autowired
    private CustomerFeedbackRepository feedbackRepository;

    @Autowired
    private S3Service s3Service;

    @GetMapping
    public List<CustomerFeedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<CustomerFeedback> createFeedback(@RequestBody CustomerFeedback feedback) {
        CustomerFeedback savedFeedback = feedbackRepository.save(feedback);
        return ResponseEntity.ok(savedFeedback);
    }

    @PostMapping("/{feedbackId}/images")
    public ResponseEntity<String> uploadFeedbackImages(
            @PathVariable String feedbackId,
            @RequestParam("images") MultipartFile[] images) {
        
        try {
            Optional<CustomerFeedback> feedbackOpt = feedbackRepository.findById(feedbackId);
            if (!feedbackOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            CustomerFeedback feedback = feedbackOpt.get();
            List<String> imageUrls = feedback.getImageUrls();
            if (imageUrls == null) {
                imageUrls = new ArrayList<>();
            }

            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    try {
                        String imageUrl = s3Service.uploadFile(image, "feedback");
                        imageUrls.add(imageUrl);
                    } catch (Exception e) {
                        System.err.println("Failed to upload image: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }

            feedback.setImageUrls(imageUrls);
            feedbackRepository.save(feedback);

            return ResponseEntity.ok("Images uploaded successfully");
        } catch (Exception e) {
            System.err.println("Error in uploadFeedbackImages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to upload images: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFeedback(@PathVariable String id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return ResponseEntity.ok("Feedback deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}