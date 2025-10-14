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
                System.out.println("🔐 JWT Auth Filter - Processing token for URI: " + request.getRequestURI());
                System.out.println("🔐 JWT Auth Filter - Token (first 50 chars): " + token.substring(0, Math.min(50, token.length())) + "...");
                Claims claims = jwt.parse(token);
                System.out.println("🔐 JWT Auth Filter - All claims: " + claims);

                // Extract user ID
                String userId = claims.getSubject();

                // Extract role - handle both single role and array of roles
                Object roleClaim = claims.get("role");
                Object rolesClaim = claims.get("roles");

                List<String> roles;
                if (rolesClaim != null) {
                    // If we have a "roles" claim (array)
                    if (rolesClaim instanceof String) {
                        roles = List.of((String) rolesClaim);
                    } else if (rolesClaim instanceof List) {
                        roles = ((List<?>) rolesClaim).stream()
                                .map(Object::toString)
                                .collect(Collectors.toList());
                    } else {
                        roles = List.of();
                    }
                } else if (roleClaim != null) {
                    // If we have a "role" claim (single value)
                    roles = List.of(roleClaim.toString());
                } else {
                    roles = List.of();
                }

                System.out.println("🔐 JWT Auth Filter - Raw role claim: " + roleClaim);
                System.out.println("🔐 JWT Auth Filter - Raw roles claim: " + rolesClaim);
                System.out.println("🔐 JWT Auth Filter - Extracted roles: " + roles);

                System.out.println("🔐 JWT Auth Filter - User ID: " + userId + ", Roles: " + roles);

                // Create authorities with ROLE_ prefix
                var authorities = roles.stream()
                        .map(role -> {
                            String authority = "ROLE_" + role.toUpperCase();
                            System.out.println("🔐 Creating authority: " + authority);
                            return new SimpleGrantedAuthority(authority);
                        })
                        .collect(Collectors.toList());

                System.out.println("🔐 JWT Auth Filter - Created authorities: " + authorities);
                System.out.println("🔐 JWT Auth Filter - Authority strings: " + authorities.stream().map(a -> a.getAuthority()).collect(Collectors.toList()));

                var authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ JWT Authentication successful for user: " + userId);
                System.out.println("✅ Security context set with authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
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