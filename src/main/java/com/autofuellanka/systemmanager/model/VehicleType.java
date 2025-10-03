package com.autofuellanka.systemmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_types",
        indexes = {
                @Index(name = "idx_vehicle_types_make_model", columnList = "make, model"),
                @Index(name = "idx_vehicle_types_fuel", columnList = "fuel_type")
        })
public class VehicleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "make", nullable = false, length = 50)
    private String make; // e.g., Toyota, Honda

    @Column(name = "model", nullable = false, length = 50)
    private String model; // e.g., Corolla, Civic

    @Column(name = "year", nullable = false)
    private Integer year; // Year of manufacture

    @Column(name = "fuel_type", nullable = false, length = 20)
    private String fuelType; // PETROL, DIESEL, HYBRID, ELECTRIC

    @Column(name = "engine_capacity", length = 20)
    private String engineCapacity; // e.g., "1.6L", "2.0L"

    @Column(name = "transmission", length = 20)
    private String transmission; // MANUAL, AUTOMATIC

    @Column(name = "description", length = 500)
    private String description; // Additional details

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // Whether vehicle type is active

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getEngineCapacity() { return engineCapacity; }
    public void setEngineCapacity(String engineCapacity) { this.engineCapacity = engineCapacity; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // Helper method to get full vehicle name
    public String getFullName() {
        return String.format("%s %s %d", make, model, year);
    }
}
