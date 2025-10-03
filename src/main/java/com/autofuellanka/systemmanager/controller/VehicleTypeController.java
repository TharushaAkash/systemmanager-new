package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.VehicleType;
import com.autofuellanka.systemmanager.repository.VehicleTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicle-types")
public class VehicleTypeController {

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    // Get all active vehicle types
    @GetMapping
    public List<VehicleType> getAllVehicleTypes() {
        return vehicleTypeRepository.findByIsActiveTrue();
    }

    // Get vehicle type by ID
    @GetMapping("/{id}")
    public ResponseEntity<VehicleType> getVehicleType(@PathVariable Long id) {
        Optional<VehicleType> vehicleType = vehicleTypeRepository.findById(id);
        return vehicleType.map(ResponseEntity::ok)
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get vehicle types by make
    @GetMapping("/make/{make}")
    public List<VehicleType> getVehicleTypesByMake(@PathVariable String make) {
        return vehicleTypeRepository.findByMakeAndIsActiveTrue(make);
    }

    // Get vehicle types by make and model
    @GetMapping("/make/{make}/model/{model}")
    public List<VehicleType> getVehicleTypesByMakeAndModel(@PathVariable String make, @PathVariable String model) {
        return vehicleTypeRepository.findByMakeAndModelAndIsActiveTrue(make, model);
    }

    // Get vehicle types by fuel type
    @GetMapping("/fuel/{fuelType}")
    public List<VehicleType> getVehicleTypesByFuelType(@PathVariable String fuelType) {
        return vehicleTypeRepository.findByFuelTypeAndIsActiveTrue(fuelType);
    }

    // Search vehicle types
    @GetMapping("/search")
    public List<VehicleType> searchVehicleTypes(@RequestParam String q) {
        return vehicleTypeRepository.searchByMakeModelOrYear(q);
    }

    // Get distinct makes
    @GetMapping("/makes")
    public List<String> getDistinctMakes() {
        return vehicleTypeRepository.findDistinctMakes();
    }

    // Get distinct models by make
    @GetMapping("/makes/{make}/models")
    public List<String> getDistinctModelsByMake(@PathVariable String make) {
        return vehicleTypeRepository.findDistinctModelsByMake(make);
    }

    // Create new vehicle type
    @PostMapping
    public ResponseEntity<VehicleType> createVehicleType(@RequestBody VehicleType vehicleType) {
        // Check if combination already exists
        if (vehicleTypeRepository.existsByMakeModelYearAndFuelType(
                vehicleType.getMake(), 
                vehicleType.getModel(), 
                vehicleType.getYear(), 
                vehicleType.getFuelType())) {
            return ResponseEntity.badRequest().build();
        }

        VehicleType savedVehicleType = vehicleTypeRepository.save(vehicleType);
        return ResponseEntity.ok(savedVehicleType);
    }

    // Update vehicle type
    @PutMapping("/{id}")
    public ResponseEntity<VehicleType> updateVehicleType(@PathVariable Long id, @RequestBody VehicleType updatedVehicleType) {
        return vehicleTypeRepository.findById(id)
                .map(vehicleType -> {
                    // Check if combination is being changed and if it already exists
                    if (!isSameCombination(vehicleType, updatedVehicleType) && 
                        vehicleTypeRepository.existsByMakeModelYearAndFuelType(
                            updatedVehicleType.getMake(), 
                            updatedVehicleType.getModel(), 
                            updatedVehicleType.getYear(), 
                            updatedVehicleType.getFuelType())) {
                        return ResponseEntity.badRequest().<VehicleType>build();
                    }

                    vehicleType.setMake(updatedVehicleType.getMake());
                    vehicleType.setModel(updatedVehicleType.getModel());
                    vehicleType.setYear(updatedVehicleType.getYear());
                    vehicleType.setFuelType(updatedVehicleType.getFuelType());
                    vehicleType.setEngineCapacity(updatedVehicleType.getEngineCapacity());
                    vehicleType.setTransmission(updatedVehicleType.getTransmission());
                    vehicleType.setDescription(updatedVehicleType.getDescription());
                    vehicleType.setIsActive(updatedVehicleType.getIsActive());

                    VehicleType savedVehicleType = vehicleTypeRepository.save(vehicleType);
                    return ResponseEntity.ok(savedVehicleType);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete vehicle type (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicleType(@PathVariable Long id) {
        return vehicleTypeRepository.findById(id)
                .map(vehicleType -> {
                    vehicleType.setIsActive(false);
                    vehicleTypeRepository.save(vehicleType);
                    return ResponseEntity.ok("Vehicle type deactivated successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Helper method to check if combination is the same
    private boolean isSameCombination(VehicleType original, VehicleType updated) {
        return original.getMake().equals(updated.getMake()) &&
               original.getModel().equals(updated.getModel()) &&
               original.getYear().equals(updated.getYear()) &&
               original.getFuelType().equals(updated.getFuelType());
    }
}
