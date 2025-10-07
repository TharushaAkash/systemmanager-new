package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Location;
import com.autofuellanka.systemmanager.model.Location.LocationType;
import com.autofuellanka.systemmanager.repository.LocationRepository;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/locations", "/api/locations/"})
public class LocationController {

    private final LocationRepository repo;

    public LocationController(LocationRepository repo) {
        this.repo = repo;
    }

    // List all
    @GetMapping({"", "/"})
    public List<Location> all() {
        return repo.findAll();
    }

    // Search by name/address
    @GetMapping("/search")
    public List<Location> search(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "type", required = false) LocationType type
    ) {
        final String query = (q == null) ? "" : q.trim();

        // If only type is provided
        if ((query.isBlank()) && type != null) {
            return repo.findByType(type);
        }

        // If only q is provided → merge name & address matches
        if (type == null) {
            var byName = repo.findByNameContainingIgnoreCase(query);
            var byAddr = repo.findByAddressContainingIgnoreCase(query);

            // dedupe while preserving order
            LinkedHashMap<Long, Location> map = new LinkedHashMap<>();
            byName.forEach(l -> map.put(l.getId(), l));
            byAddr.forEach(l -> map.putIfAbsent(l.getId(), l));
            return new ArrayList<>(map.values());
        }

        // If both q and type are provided
        return repo.findByType(type).stream()
                .filter(l ->
                        (l.getName() != null && l.getName().toLowerCase().contains(query.toLowerCase())) ||
                                (l.getAddress() != null && l.getAddress().toLowerCase().contains(query.toLowerCase()))
                )
                .collect(Collectors.toList());
    }

    // Get one
    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Location loc) {
        // Bean Validation (@NotBlank/@NotNull) handles field checks
        try {
            Location saved = repo.save(loc);
            return ResponseEntity.status(201).body(saved);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body("Invalid data: " + mostSpecific(ex));
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Location patch) {
        return repo.findById(id).map(existing -> {
            if (patch.getName() != null && !patch.getName().isBlank()) existing.setName(patch.getName());
            if (patch.getAddress() != null && !patch.getAddress().isBlank()) existing.setAddress(patch.getAddress());
            if (patch.getType() != null) existing.setType(patch.getType());

            // Minimal validation before save (Bean Validation will also check)
            String err = validate(existing);
            if (err != null) return ResponseEntity.badRequest().body(err);

            try {
                return ResponseEntity.ok(repo.save(existing));
            } catch (DataIntegrityViolationException ex) {
                return ResponseEntity.badRequest().body("Invalid data: " + mostSpecific(ex));
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok("Location " + id + " deleted");
    }

    //  helpers
    private String validate(Location l) {
        if (l == null) return "body required";
        if (l.getName() == null || l.getName().isBlank()) return "name is required";
        if (l.getAddress() == null || l.getAddress().isBlank()) return "address is required";
        if (l.getType() == null) return "type is required";
        return null;
    }

    private String mostSpecific(Exception e) {
        return (e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
    }
}
