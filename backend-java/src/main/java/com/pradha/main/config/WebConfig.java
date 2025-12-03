package com.pradha.main.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = "file:/home/pradha-uploads/products/";
        String feedbackUploadPath = "file:/home/pradha-uploads/feedback/";
        
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadPath);
                
        registry.addResourceHandler("/uploads/feedback/**")
                .addResourceLocations(feedbackUploadPath);
    }
}

