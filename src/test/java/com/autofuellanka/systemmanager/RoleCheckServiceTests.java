package com.autofuellanka.systemmanager;

import com.autofuellanka.systemmanager.service.RoleCheckService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class RoleCheckServiceTests {

    @Test
    void adminAndStaffChecks() {
        RoleCheckService svc = new RoleCheckService();
        assertTrue(svc.isAdmin("ADMIN"));
        assertTrue(svc.isStaff("ADMIN"));
        assertTrue(svc.isStaff("STAFF"));
        assertFalse(svc.isAdmin("STAFF"));
        assertFalse(svc.isStaff("CUSTOMER"));
        assertFalse(svc.isAdmin(null));
    }
}


