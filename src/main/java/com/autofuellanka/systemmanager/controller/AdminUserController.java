package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.service.RoleCheckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository users;
    private final RoleCheckService roles;

    public AdminUserController(UserRepository users, RoleCheckService roles) {
        this.users = users;
        this.roles = roles;
    }

    private boolean denyIfNotAdmin(String roleHeader) {
        return !roles.isAdmin(roleHeader);
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader(value = "X-Role", required = false) String roleHeader) {
        if (denyIfNotAdmin(roleHeader)) return ResponseEntity.status(403).body("Admin only");
        List<User> all = users.findAll();
        all.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@RequestHeader(value = "X-Role", required = false) String roleHeader,
                                 @PathVariable Long id) {
        if (denyIfNotAdmin(roleHeader)) return ResponseEntity.status(403).body("Admin only");
        return users.findById(id).<ResponseEntity<?>>map(u -> {
            u.setPassword(null);
            return ResponseEntity.ok(u);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestHeader(value = "X-Role", required = false) String roleHeader,
                                    @RequestBody User u) {
        if (denyIfNotAdmin(roleHeader)) return ResponseEntity.status(403).body("Admin only");
        if (u.getEmail() == null || u.getEmail().isBlank()) return ResponseEntity.badRequest().body("email required");
        if (users.findByEmail(u.getEmail()).isPresent()) return ResponseEntity.badRequest().body("email exists");
        if (u.getRole() == null || u.getRole().isBlank()) u.setRole("STAFF");
        u.setEnabled(true);
        User saved = users.save(u);
        saved.setPassword(null);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader(value = "X-Role", required = false) String roleHeader,
                                    @PathVariable Long id,
                                    @RequestBody User patch) {
        if (denyIfNotAdmin(roleHeader)) return ResponseEntity.status(403).body("Admin only");
        return users.findById(id).map(u -> {
            if (patch.getFirstName() != null && !patch.getFirstName().isBlank()) u.setFirstName(patch.getFirstName());
            if (patch.getLastName() != null && !patch.getLastName().isBlank()) u.setLastName(patch.getLastName());
            if (patch.getPhone() != null && !patch.getPhone().isBlank()) u.setPhone(patch.getPhone());
            if (patch.getAddress() != null && !patch.getAddress().isBlank()) u.setAddress(patch.getAddress());
            if (patch.getRole() != null && !patch.getRole().isBlank()) u.setRole(patch.getRole());
            if (patch.isEnabled() != u.isEnabled()) u.setEnabled(patch.isEnabled());
            User saved = users.save(u);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader(value = "X-Role", required = false) String roleHeader,
                                    @PathVariable Long id) {
        if (denyIfNotAdmin(roleHeader)) return ResponseEntity.status(403).body("Admin only");
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        users.deleteById(id);
        return ResponseEntity.ok("User " + id + " deleted");
    }
}


