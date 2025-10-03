package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Customer;
import com.autofuellanka.systemmanager.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository repo;

    public CustomerController(CustomerRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Customer> list(@RequestParam(value = "email", required = false) String email,
                               @RequestParam(value = "phone", required = false) String phone) {
        if (email != null && !email.isBlank()) return repo.findByEmailContainingIgnoreCase(email);
        if (phone != null && !phone.isBlank()) return repo.findByPhoneContainingIgnoreCase(phone);
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return repo.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Customer c) {
        if (c.getEmail() == null || c.getEmail().isBlank()) return ResponseEntity.badRequest().body("email is required");
        if (repo.findByEmail(c.getEmail()).isPresent()) return ResponseEntity.badRequest().body("email already exists");
        if (c.getRole() == null || c.getRole().isBlank()) c.setRole("CUSTOMER");
        if (c.getEnabled() == null) c.setEnabled(true);
        return ResponseEntity.status(201).body(repo.save(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Customer patch) {
        return repo.findById(id).map(c -> {
            if (patch.getFullName() != null && !patch.getFullName().isBlank()) c.setFullName(patch.getFullName());
            if (patch.getPhone() != null && !patch.getPhone().isBlank()) c.setPhone(patch.getPhone());
            if (patch.getAddress() != null && !patch.getAddress().isBlank()) c.setAddress(patch.getAddress());
            if (patch.getEnabled() != null) c.setEnabled(patch.getEnabled());
            return ResponseEntity.ok(repo.save(c));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok("Customer " + id + " deleted");
    }
}


