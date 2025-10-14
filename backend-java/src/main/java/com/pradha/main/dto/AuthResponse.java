package com.pradha.main.dto;

import java.util.Map;

public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Map<String, Object> user;

    public AuthResponse(String accessToken, String tokenType, Map<String, Object> user) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.user = user;
    }

    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Map<String, Object> getUser() { return user; }
    public void setUser(Map<String, Object> user) { this.user = user; }
}