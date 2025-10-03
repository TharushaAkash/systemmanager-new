package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import com.autofuellanka.systemmanager.service.BookingValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers/{customerId}/vehicles")
public class CustomerVehicleController {

    private final VehicleRepository vehicles;
    private final BookingValidationService validator;

    public CustomerVehicleController(VehicleRepository vehicles, BookingValidationService validator) {
        this.vehicles = vehicles;
        this.validator = validator;
    }

    @GetMapping
    public List<Vehicle> list(@PathVariable Long customerId) {
        validator.requireCustomer(customerId);
        return vehicles.findByCustomerId(customerId);
    }

    @PostMapping
    public ResponseEntity<?> create(@PathVariable Long customerId, @RequestBody Vehicle v) {
        validator.requireCustomer(customerId);
        if (v.getPlateNumber() == null || v.getPlateNumber().isBlank()) return ResponseEntity.badRequest().body("plateNumber is required");
        v.setCustomerId(customerId);
        return ResponseEntity.status(201).body(vehicles.save(v));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long customerId, @PathVariable Long id, @RequestBody Vehicle patch) {
        validator.requireCustomer(customerId);
        return vehicles.findById(id)
                .map(v -> {
                    if (!customerId.equals(v.getCustomerId())) return ResponseEntity.status(403).body("vehicle does not belong to customer");
                    if (patch.getPlateNumber() != null && !patch.getPlateNumber().isBlank()) v.setPlateNumber(patch.getPlateNumber());
                    if (patch.getMake() != null) v.setMake(patch.getMake());
                    if (patch.getModel() != null) v.setModel(patch.getModel());
                    if (patch.getYearOfManufacture() != null) v.setYearOfManufacture(patch.getYearOfManufacture());
                    if (patch.getFuelType() != null) v.setFuelType(patch.getFuelType());
                    return ResponseEntity.ok(vehicles.save(v));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long customerId, @PathVariable Long id) {
        validator.requireCustomer(customerId);
        return vehicles.findById(id)
                .map(v -> {
                    if (!customerId.equals(v.getCustomerId())) return ResponseEntity.status(403).body("vehicle does not belong to customer");
                    vehicles.deleteById(id);
                    return ResponseEntity.ok("Vehicle " + id + " deleted");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}


