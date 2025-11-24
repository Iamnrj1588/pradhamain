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
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24"})
public class HeroContentController {

    @Autowired
    private HeroContentRepository heroContentRepository;

    @Autowired
    private S3Service s3Service;

    @GetMapping("/hero-content")
    public List<HeroContent> getAllHeroContent() {
        return heroContentRepository.findAll();
    }

    @PostMapping("/admin/hero-content")
    @PreAuthorize("hasRole('ADMIN')")
    public HeroContent createHeroContent(@RequestBody HeroContent heroContent) {
        return heroContentRepository.save(heroContent);
    }

    @PostMapping("/admin/hero-content/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadHeroImage(@RequestParam("images") MultipartFile file) {
        try {
            String imageUrl = s3Service.uploadFile(file, "hero-content", "hero-" + System.currentTimeMillis());
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/hero-content/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public HeroContent updateHeroContent(@PathVariable Long id, @RequestBody HeroContent heroContent) {
        heroContent.setId(id);
        return heroContentRepository.save(heroContent);
    }

    @DeleteMapping("/admin/hero-content/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHeroContent(@PathVariable Long id) {
        heroContentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
