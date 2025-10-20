package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TechnicianController {

    private final UserRepository users;
    private static final Logger log = LoggerFactory.getLogger(TechnicianController.class);

    public TechnicianController(UserRepository users) {
        this.users = users;
    }

    // LIST technicians only
    @GetMapping
    public ResponseEntity<?> listTechnicians() {
        try {
            List<User> all = users.findByRoleIgnoreCase("TECHNICIAN");
            all.forEach(u -> u.setPassword(null));
            return ResponseEntity.ok(all);
        } catch (Exception ex) {
            log.error("Failed to list technicians via repository query, falling back to filter-all", ex);
            try {
                List<User> fallback = users.findAll()
                        .stream()
                        .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("TECHNICIAN"))
                        .collect(Collectors.toList());
                fallback.forEach(u -> u.setPassword(null));
                return ResponseEntity.ok(fallback);
            } catch (Exception inner) {
                log.error("Fallback list also failed", inner);
                return ResponseEntity.status(500).body("Unable to load technicians");
            }
        }
    }

    // GET one technician by id (only if role is TECHNICIAN)
    @GetMapping("/{id}")
    public ResponseEntity<?> getTechnician(@PathVariable Long id) {
        return users.findById(id)
                .map(u -> {
                    if (!"TECHNICIAN".equalsIgnoreCase(u.getRole())) {
                        return ResponseEntity.notFound().build();
                    }
                    u.setPassword(null);
                    return ResponseEntity.ok(u);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE technician (forces role TECHNICIAN)
    @PostMapping
    public ResponseEntity<?> createTechnician(@RequestBody User payload) {
        if (payload.getEmail() == null || payload.getEmail().isBlank()
                || payload.getPassword() == null || payload.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("email and password are required");
        }
        if (users.findByEmail(payload.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        payload.setRole("TECHNICIAN");
        payload.setEnabled(true);
        User saved = users.save(payload);
        saved.setPassword(null);
        return ResponseEntity.status(201).body(saved);
    }

    // UPDATE technician details (keeps role as TECHNICIAN)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTechnician(@PathVariable Long id, @RequestBody User updates) {
        return users.findById(id)
                .map(u -> {
                    if (!"TECHNICIAN".equalsIgnoreCase(u.getRole())) {
                        return ResponseEntity.notFound().build();
                    }
                    if (updates.getFirstName() != null && !updates.getFirstName().isBlank()) u.setFirstName(updates.getFirstName());
                    if (updates.getLastName() != null && !updates.getLastName().isBlank()) u.setLastName(updates.getLastName());
                    if (updates.getEmail() != null && !updates.getEmail().isBlank()) u.setEmail(updates.getEmail());
                    if (updates.getPhone() != null && !updates.getPhone().isBlank()) u.setPhone(updates.getPhone());
                    if (updates.getAddress() != null && !updates.getAddress().isBlank()) u.setAddress(updates.getAddress());
                    if (updates.getCity() != null && !updates.getCity().isBlank()) u.setCity(updates.getCity());
                    if (updates.getPostalCode() != null && !updates.getPostalCode().isBlank()) u.setPostalCode(updates.getPostalCode());
                    if (updates.getPassword() != null && !updates.getPassword().isBlank()) u.setPassword(updates.getPassword());
                    u.setRole("TECHNICIAN");
                    User saved = users.save(u);
                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE technician
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable Long id) {
        return users.findById(id)
                .map(u -> {
                    if (!"TECHNICIAN".equalsIgnoreCase(u.getRole())) {
                        return ResponseEntity.notFound().build();
                    }
                    users.deleteById(id);
                    return ResponseEntity.ok("Technician " + id + " deleted");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}


