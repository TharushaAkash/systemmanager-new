package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final UserRepository userRepo;

    public StaffController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // staff login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> staff = userRepo.findByEmailAndPassword(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (staff.isEmpty() || !"STAFF".equalsIgnoreCase(staff.get().getRole())) {
            return ResponseEntity.status(403).body("Access denied: Not a staff account");
        }

        return ResponseEntity.ok(staff.get());
    }
}
