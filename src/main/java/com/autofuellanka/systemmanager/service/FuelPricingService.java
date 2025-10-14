package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.FuelType;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FuelPricingService {
    
    // Fuel prices per liter in LKR
    private static final Map<FuelType, Double> FUEL_PRICES = new HashMap<>();
    
    static {
        // Set fuel prices as per business requirements
        FUEL_PRICES.put(FuelType.PETROL_92, 299.0);  // Rs. 299 per liter
        FUEL_PRICES.put(FuelType.PETROL_95, 361.0);  // Rs. 361 per liter
        FUEL_PRICES.put(FuelType.DIESEL_AUTO, 277.0); // Rs. 277 per liter
        FUEL_PRICES.put(FuelType.DIESEL_SUPER, 313.0); // Rs. 313 per liter
    }
    
    /**
     * Get the price per liter for a specific fuel type
     * @param fuelType The type of fuel
     * @return Price per liter in LKR
     */
    public Double getPricePerLiter(FuelType fuelType) {
        return FUEL_PRICES.getOrDefault(fuelType, 0.0);
    }
    
    /**
     * Get all fuel prices
     * @return Map of fuel types to prices
     */
    public Map<FuelType, Double> getAllFuelPrices() {
        return new HashMap<>(FUEL_PRICES);
    }
    
    /**
     * Calculate total fuel cost
     * @param fuelType The type of fuel
     * @param liters Number of liters
     * @return Total cost in LKR
     */
    public Double calculateFuelCost(FuelType fuelType, Double liters) {
        if (fuelType == null || liters == null || liters <= 0) {
            return 0.0;
        }
        return getPricePerLiter(fuelType) * liters;
    }
}
