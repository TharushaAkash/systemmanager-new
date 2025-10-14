package com.autofuellanka.systemmanager.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwt;

    public JwtAuthFilter(JwtUtil jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                String token = auth.substring(7);
                Claims claims = jwt.parse(token);

                // Extract user ID
                String userId = claims.getSubject();

                // Extract roles - handle both single role and array of roles
                Object rolesClaim = claims.get("roles");
                List<String> roles;

                if (rolesClaim instanceof String) {
                    roles = List.of((String) rolesClaim);
                } else if (rolesClaim instanceof List) {
                    roles = ((List<?>) rolesClaim).stream()
                            .map(Object::toString)
                            .collect(Collectors.toList());
                } else {
                    // Fallback to role claim if roles not found
                    String role = claims.get("role", String.class);
                    roles = role != null ? List.of(role) : List.of();
                }

                System.out.println("🔐 JWT Auth Filter - User ID: " + userId + ", Roles: " + roles);

                // Create authorities with ROLE_ prefix
                var authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toList());

                var authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ JWT Authentication successful for user: " + userId);
            } catch (Exception e) {
                System.out.println("❌ JWT Authentication failed: " + e.getMessage());
                // Don't throw exception, just continue without authentication
            }
        } else {
            System.out.println("⚠️ No Authorization header found for: " + request.getRequestURI());
        }
        filterChain.doFilter(request, response);
    }
}