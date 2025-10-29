package com.pradha.main.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class S3TestController {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @GetMapping("/test-s3")
    public ResponseEntity<?> testS3Connection() {
        try {
            // Test S3 connection by listing buckets
            ListBucketsResponse response = s3Client.listBuckets();
            
            boolean bucketExists = response.buckets().stream()
                    .anyMatch(bucket -> bucket.name().equals(bucketName));
            
            if (!bucketExists) {
                // Create bucket if it doesn't exist
                CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                        .bucket(bucketName)
                        .createBucketConfiguration(CreateBucketConfiguration.builder()
                                .locationConstraint(BucketLocationConstraint.EU_NORTH_1)
                                .build())
                        .build();
                
                s3Client.createBucket(createBucketRequest);
                
                // Set bucket policy for public read
                String policy = "{\n" +
                        "  \"Version\": \"2012-10-17\",\n" +
                        "  \"Statement\": [\n" +
                        "    {\n" +
                        "      \"Sid\": \"PublicReadGetObject\",\n" +
                        "      \"Effect\": \"Allow\",\n" +
                        "      \"Principal\": \"*\",\n" +
                        "      \"Action\": \"s3:GetObject\",\n" +
                        "      \"Resource\": \"arn:aws:s3:::" + bucketName + "/*\"\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}";
                
                PutBucketPolicyRequest policyRequest = PutBucketPolicyRequest.builder()
                        .bucket(bucketName)
                        .policy(policy)
                        .build();
                
                s3Client.putBucketPolicy(policyRequest);
                
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Bucket created and configured successfully",
                        "bucket", bucketName,
                        "region", "eu-north-1"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "status", "success", 
                        "message", "S3 connection successful, bucket exists",
                        "bucket", bucketName,
                        "region", "eu-north-1"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", "S3 connection failed: " + e.getMessage(),
                    "error", e.getClass().getSimpleName()
            ));
        }
    }
}