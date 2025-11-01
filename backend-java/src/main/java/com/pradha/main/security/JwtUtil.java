package com.pradha.main.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMillis = 1000L * 60 * 60 * 24; // 24 hours

    public JwtUtil() {
        String secret = System.getenv("JWT_SECRET");

        if (secret == null || secret.length() < 32) {
            System.err.println("⚠️ WARNING: Using fallback JWT secret. Set JWT_SECRET in environment.");
            secret = "this_is_a_strong_default_jwt_secret_key_please_change_in_prod_123";
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username, String role) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> validateToken(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }

    public String extractUsername(String token) {
        return validateToken(token).getPayload().getSubject();
    }

    public String extractRole(String token) {
        Object role = validateToken(token).getPayload().get("role");
        return role != null ? role.toString() : null;
    }
}


