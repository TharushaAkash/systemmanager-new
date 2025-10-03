package com.autofuellanka.systemmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles",
        indexes = {
                @Index(name = "idx_vehicles_customer", columnList = "customer_id"),
                @Index(name = "idx_vehicles_plate", columnList = "plate_number")
        })
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DB columns present:
    @Column(length = 64)
    private String make;

    @Column(length = 64)
    private String model;

    @Column(name = "registration_no", length = 64)
    private String registrationNo;         // NEW: matches registration_no


    @Column(name = "owner_id", nullable = true)
    private Long ownerId;
    // NEW: matches owner_id (can mirror customerId if needed)

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "fuel_type", length = 32)
    private String fuelType;

    @Column(name = "plate_number", nullable = false, length = 32)
    private String plateNumber;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    // --- getters/setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getRegistrationNo() { return registrationNo; }
    public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public Integer getYearOfManufacture() { return yearOfManufacture; }
    public void setYearOfManufacture(Integer yearOfManufacture) { this.yearOfManufacture = yearOfManufacture; }
}
