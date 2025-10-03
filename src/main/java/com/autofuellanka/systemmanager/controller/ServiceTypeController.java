package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.ServiceType;
import com.autofuellanka.systemmanager.repository.ServiceTypeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-types")
public class ServiceTypeController {

    private final ServiceTypeRepository repo;

    public ServiceTypeController(ServiceTypeRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<ServiceType> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ServiceType st) {
        if (st.getCode() == null || st.getCode().isBlank()) {
            return ResponseEntity.badRequest().body("code is required");
        }
        if (st.getName() == null || st.getName().isBlank()) {
            return ResponseEntity.badRequest().body("name is required");
        }
        try {
            ServiceType saved = repo.save(st);
            return ResponseEntity.status(201).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Duplicate or invalid data: " + e.getMostSpecificCause().getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ServiceType patch) {
        return repo.findById(id).map(st -> {
            if (patch.getCode() != null && !patch.getCode().isBlank()) st.setCode(patch.getCode());
            if (patch.getName() != null && !patch.getName().isBlank()) st.setName(patch.getName());
            if (patch.getLabel() != null) st.setLabel(patch.getLabel());
            if (patch.getDescription() != null) st.setDescription(patch.getDescription());
            if (patch.getBasePrice() != null) st.setBasePrice(patch.getBasePrice());
            if (patch.getPrice() != null) st.setPrice(patch.getPrice());
            try {
                return ResponseEntity.ok(repo.save(st));
            } catch (DataIntegrityViolationException e) {
                return ResponseEntity.badRequest().body("Duplicate or invalid data: " + e.getMostSpecificCause().getMessage());
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok("ServiceType " + id + " deleted");
    }
}
