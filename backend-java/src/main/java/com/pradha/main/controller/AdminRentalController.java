package com.pradha.main.controller;

import com.pradha.main.entity.RentalDress;
import com.pradha.main.repository.RentalDressRepository;
import com.pradha.main.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/rental")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24"})
public class AdminRentalController {

    @Autowired
    private RentalDressRepository rentalDressRepository;

    @Autowired
    private S3Service s3Service;

    @PostMapping("/dresses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDress(@Valid @RequestBody RentalDress dress) {
        try {
            RentalDress savedDress = rentalDressRepository.save(dress);
            return ResponseEntity.ok(savedDress);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/dresses/{dressId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDress(
            @PathVariable String dressId,
            @Valid @RequestBody RentalDress updatedDress) {
        try {
            RentalDress dress = rentalDressRepository.findById(dressId)
                .orElseThrow(() -> new RuntimeException("Dress not found"));
            
            dress.setName(updatedDress.getName());
            dress.setDescription(updatedDress.getDescription());
            dress.setPricePerDay(updatedDress.getPricePerDay());
            dress.setImageUrls(updatedDress.getImageUrls());
            dress.setAvailableSizes(updatedDress.getAvailableSizes());
            dress.setCategory(updatedDress.getCategory());
            dress.setColor(updatedDress.getColor());
            dress.setAvailable(updatedDress.isAvailable());
            
            RentalDress savedDress = rentalDressRepository.save(dress);
            return ResponseEntity.ok(savedDress);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/dresses/{dressId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDress(@PathVariable String dressId) {
        try {
            rentalDressRepository.deleteById(dressId);
            return ResponseEntity.ok(Map.of("message", "Dress deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Cannot delete dress. It has existing bookings. Please delete or reassign bookings first."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dresses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDresses() {
        return ResponseEntity.ok(rentalDressRepository.findAll());
    }

    @PostMapping("/dresses/{dressId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadDressImages(
            @PathVariable String dressId,
            @RequestParam("images") MultipartFile[] images) {
        try {
            RentalDress dress = rentalDressRepository.findById(dressId)
                .orElseThrow(() -> new RuntimeException("Dress not found"));
            
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                String imageUrl = s3Service.uploadFile(image, "rental-dresses", dressId);
                imageUrls.add(imageUrl);
            }
            
            if (dress.getImageUrls() == null) {
                dress.setImageUrls(new ArrayList<>());
            }
            dress.getImageUrls().addAll(imageUrls);
            
            RentalDress savedDress = rentalDressRepository.save(dress);
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls, "dress", savedDress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
