package com.autofuellanka.systemmanager.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    private final Key key;
    private final long ttlMillis;

    public JwtUtil(String secret, long ttlMillis) {
        // Ensure the secret is properly decoded
        byte[] keyBytes;
        if (secret.length() < 44) {
            // If secret is not base64 encoded, use it directly
            keyBytes = secret.getBytes();
        } else {
            // If secret is base64 encoded, decode it
            try {
                keyBytes = java.util.Base64.getDecoder().decode(secret);
            } catch (IllegalArgumentException e) {
                // Fallback to direct bytes if not valid base64
                keyBytes = secret.getBytes();
            }
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.ttlMillis = ttlMillis;
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(claims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}