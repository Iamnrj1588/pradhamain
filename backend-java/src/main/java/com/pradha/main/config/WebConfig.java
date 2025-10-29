package com.pradha.main.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String userHome = System.getProperty("user.home");
        String uploadPath = "file:" + userHome + "/pradha-uploads/products/";
        
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadPath);
    }
}