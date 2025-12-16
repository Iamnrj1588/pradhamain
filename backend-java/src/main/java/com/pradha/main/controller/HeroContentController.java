package com.pradha.main.controller;

import com.pradha.main.entity.HeroContent;
import com.pradha.main.repository.HeroContentRepository;
import com.pradha.main.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.205.19.24"})
public class HeroContentController {

    @Autowired
    private HeroContentRepository heroContentRepository;

    @Autowired
    private S3Service s3Service;

    @GetMapping("/hero-content")
    public ResponseEntity<List<HeroContent>> getAllHeroContent() {
        List<HeroContent> heroContent = heroContentRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return ResponseEntity.ok(heroContent);
    }

    @PostMapping("/admin/hero-content")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createHeroContent(
            @RequestParam("title") String title,
            @RequestParam("subtitle") String subtitle,
            @RequestParam(value = "displayOrder", defaultValue = "0") String displayOrderStr,
            @RequestParam(value = "isActive", defaultValue = "true") String isActiveStr,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        
        try {
            Integer displayOrder = Integer.parseInt(displayOrderStr);
            Boolean isActive = Boolean.parseBoolean(isActiveStr);
            
            HeroContent heroContent = new HeroContent();
            heroContent.setTitle(title);
            heroContent.setSubtitle(subtitle);
            heroContent.setDisplayOrder(displayOrder);
            heroContent.setIsActive(isActive);

            if (backgroundImage != null && !backgroundImage.isEmpty()) {
                String imageUrl = s3Service.uploadFile(backgroundImage, "hero-images");
                heroContent.setBackgroundImageUrl(imageUrl);
            } else {
                heroContent.setBackgroundImageUrl("/images/default-hero-bg.jpg");
            }

            HeroContent savedHeroContent = heroContentRepository.save(heroContent);
            return ResponseEntity.ok(savedHeroContent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/admin/hero-content/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateHeroContent(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("subtitle") String subtitle,
            @RequestParam(value = "displayOrder", defaultValue = "0") String displayOrderStr,
            @RequestParam(value = "isActive", defaultValue = "true") String isActiveStr,
            @RequestParam(value = "backgroundImage", required = false) MultipartFile backgroundImage) {
        
        try {
            Integer displayOrder = Integer.parseInt(displayOrderStr);
            Boolean isActive = Boolean.parseBoolean(isActiveStr);
            
            Optional<HeroContent> optionalHeroContent = heroContentRepository.findById(id);
            if (!optionalHeroContent.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            HeroContent heroContent = optionalHeroContent.get();
            heroContent.setTitle(title);
            heroContent.setSubtitle(subtitle);
            heroContent.setDisplayOrder(displayOrder);
            heroContent.setIsActive(isActive);

            if (backgroundImage != null && !backgroundImage.isEmpty()) {
                String imageUrl = s3Service.uploadFile(backgroundImage, "hero-images");
                heroContent.setBackgroundImageUrl(imageUrl);
            }

            HeroContent savedHeroContent = heroContentRepository.save(heroContent);
            return ResponseEntity.ok(savedHeroContent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/hero-content/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHeroContent(@PathVariable Long id) {
        try {
            if (!heroContentRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            heroContentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}