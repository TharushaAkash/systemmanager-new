package com.autofuellanka.systemmanager.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;

public class CustomerAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (path.startsWith("/api/customers/")) {
            String[] parts = path.split("/");
            if (parts.length > 3) {
                String customerIdStr = parts[3];
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                
                // If no authentication or anonymous user, this endpoint is permitted - allow access
                if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                    return true;
                }
                
                // If authenticated, check if user has admin/staff role
                if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"))) {
                    return true; // Admin/Staff can access any customer data
                }
                
                // For regular users, must be the same customer id as token subject
                if (!customerIdStr.equals(auth.getName())) {
                    response.setStatus(403);
                    return false;
                }
            }
        }
        return true;
    }
}


