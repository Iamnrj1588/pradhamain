package com.pradha.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.base-url}")
    private String baseUrl;

    public String uploadFile(MultipartFile file, String category, String subcategory) throws IOException {
        String folder = category.toLowerCase() + "/" + subcategory.toLowerCase();
        String fileName = generateFileName(file.getOriginalFilename());
        String key = folder + "/" + fileName;
        
        try {
            System.out.println("=== S3 Upload Debug ===");
            System.out.println("Bucket: " + bucketName);
            System.out.println("Region: eu-north-1");
            System.out.println("Key: " + key);
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            String s3Url = baseUrl + key;
            System.out.println("✅ Successfully uploaded to S3: " + s3Url);
            return s3Url;
            
        } catch (Exception e) {
            System.err.println("❌ S3 Upload failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            
            // Print detailed error information
            if (e instanceof software.amazon.awssdk.services.s3.model.NoSuchBucketException) {
                System.err.println("Bucket '" + bucketName + "' does not exist in eu-north-1 region");
            } else if (e instanceof software.amazon.awssdk.services.s3.model.S3Exception) {
                software.amazon.awssdk.services.s3.model.S3Exception s3e = (software.amazon.awssdk.services.s3.model.S3Exception) e;
                System.err.println("S3 Error Code: " + s3e.awsErrorDetails().errorCode());
                System.err.println("S3 Error Message: " + s3e.awsErrorDetails().errorMessage());
            }
            
            e.printStackTrace();
            throw new IOException("S3 upload failed: " + e.getMessage(), e);
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
    }
}