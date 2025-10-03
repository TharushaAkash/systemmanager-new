package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.security.JwtUtil;
// Swagger annotations will be added once dependencies are resolved
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final JwtUtil jwt;

    public AuthController(UserRepository users, @Value("${app.jwt.secret:MzJieXRlc2Jhc2U2NHRlc3RzZWNyZXRrZXl0ZXN0a2V5dGVzdGtleXRlc3RrZXl0ZXN0a2V5}") String secret) {
        this.users = users;
        this.jwt = new JwtUtil(secret, 1000L * 60 * 60 * 8); // 8h
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User req) {
        return users.findByEmailAndPassword(req.getEmail(), req.getPassword())
                .map(u -> {
                    String token = jwt.generateToken(String.valueOf(u.getId()), Map.of(
                            "role", u.getRole(),
                            "email", u.getEmail()
                    ));
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "userId", u.getId(),
                            "role", u.getRole()
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }
}


