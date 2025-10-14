package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.FuelType;
import com.autofuellanka.systemmanager.service.FuelPricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel")
public class FuelPricingController {

    @Autowired
    private FuelPricingService fuelPricingService;

    @GetMapping("/prices")
    public ResponseEntity<Map<String, Object>> getFuelPrices() {
        Map<String, Object> response = new HashMap<>();
        
        // Get all fuel prices
        Map<FuelType, Double> prices = fuelPricingService.getAllFuelPrices();
        
        // Convert to a more frontend-friendly format
        Map<String, Double> priceMap = new HashMap<>();
        for (Map.Entry<FuelType, Double> entry : prices.entrySet()) {
            priceMap.put(entry.getKey().name(), entry.getValue());
        }
        
        response.put("prices", priceMap);
        response.put("currency", "LKR");
        response.put("unit", "per liter");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price/{fuelType}")
    public ResponseEntity<Map<String, Object>> getFuelPrice(@PathVariable String fuelType) {
        try {
            FuelType type = FuelType.valueOf(fuelType.toUpperCase());
            Double price = fuelPricingService.getPricePerLiter(type);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fuelType", fuelType);
            response.put("price", price);
            response.put("currency", "LKR");
            response.put("unit", "per liter");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid fuel type: " + fuelType);
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateFuelCost(
            @RequestParam String fuelType,
            @RequestParam Double liters) {
        try {
            FuelType type = FuelType.valueOf(fuelType.toUpperCase());
            Double totalCost = fuelPricingService.calculateFuelCost(type, liters);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fuelType", fuelType);
            response.put("liters", liters);
            response.put("pricePerLiter", fuelPricingService.getPricePerLiter(type));
            response.put("totalCost", totalCost);
            response.put("currency", "LKR");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid fuel type: " + fuelType);
            return ResponseEntity.badRequest().body(error);
        }
    }
}
