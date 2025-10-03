package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository repo;

    public VehicleController(VehicleRepository repo) {
        this.repo = repo;
    }

    // --- Basic CRUD ---

    @GetMapping
    public List<Vehicle> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Vehicle v) {
        var err = validate(v, true);
        if (err != null) return ResponseEntity.badRequest().body(err);
        try {
            Vehicle saved = repo.save(v);
            return ResponseEntity.status(201).body(saved);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(messageFrom(ex));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Vehicle patch) {
        return repo.findById(id).map(v -> {
            if (patch.getCustomerId() != null) v.setCustomerId(patch.getCustomerId());
            if (patch.getPlateNumber() != null && !patch.getPlateNumber().isBlank()) v.setPlateNumber(patch.getPlateNumber());
            if (patch.getMake() != null) v.setMake(patch.getMake());
            if (patch.getModel() != null) v.setModel(patch.getModel());
            if (patch.getYearOfManufacture() != null) v.setYearOfManufacture(patch.getYearOfManufacture());
            if (patch.getFuelType() != null) v.setFuelType(patch.getFuelType());

            var err = validate(v, false);
            if (err != null) return ResponseEntity.badRequest().body(err);

            try {
                return ResponseEntity.ok(repo.save(v));
            } catch (DataIntegrityViolationException ex) {
                return ResponseEntity.badRequest().body(messageFrom(ex));
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().body("Vehicle " + id + " deleted");
    }

    // --- Helpers & customer-scoped endpoints ---

    @GetMapping("/search")
    public List<Vehicle> searchByPlate(@RequestParam("q") String q) {
        return repo.findByPlateNumberContainingIgnoreCase(q == null ? "" : q);
    }

    // list vehicles for a specific customer (useful for frontend forms)
    @GetMapping("/by-customer/{customerId}")
    public List<Vehicle> byCustomer(@PathVariable Long customerId) {
        return repo.findByCustomerId(customerId);
    }

    private String validate(Vehicle v, boolean creating) {
        if (v == null) return "body required";
        if (creating && v.getId() != null) return "id must be null for create";
        if (v.getCustomerId() == null) return "customerId is required";
        if (v.getPlateNumber() == null || v.getPlateNumber().isBlank()) return "plateNumber is required";
        if (v.getYearOfManufacture() != null && (v.getYearOfManufacture() < 1970 || v.getYearOfManufacture() > 2100))
            return "yearOfManufacture out of range";
        return null;
    }

    private String messageFrom(Exception e) {
        var cause = (e.getCause() != null) ? e.getCause().getMessage() : e.getMessage();
        return "DB constraint error: " + cause;
    }
}
