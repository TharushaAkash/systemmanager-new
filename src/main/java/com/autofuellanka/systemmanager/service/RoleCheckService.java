package com.autofuellanka.systemmanager.service;

import org.springframework.stereotype.Service;

@Service
public class RoleCheckService {

    public boolean isAdmin(String roleHeader) {
        return roleHeader != null && roleHeader.equalsIgnoreCase("ADMIN");
    }

    public boolean isStaff(String roleHeader) {
        return roleHeader != null && (roleHeader.equalsIgnoreCase("STAFF") || roleHeader.equalsIgnoreCase("ADMIN"));
    }
}


