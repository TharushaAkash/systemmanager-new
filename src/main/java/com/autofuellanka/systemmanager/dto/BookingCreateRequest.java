package com.autofuellanka.systemmanager.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class BookingCreateRequest {

    private String startTime;
    private String endTime;

    // Optional; if present must be one of the valid fuel types
    @Pattern(regexp = "(?i)PETROL_92|PETROL_95|DIESEL_AUTO|DIESEL_SUPER", message = "fuelType must be PETROL_92, PETROL_95, DIESEL_AUTO, or DIESEL_SUPER")
    private String fuelType;

    // Optional; if present must be > 0
    @Positive(message = "litersRequested must be > 0")
    private Double litersRequested;

    @NotNull(message = "locationId is required")
    private Long locationId;

    // Optional for FUEL, required for SERVICE (business rule enforced in service)
    private Long serviceTypeId;

    @NotNull(message = "vehicleId is required")
    private Long vehicleId;

    @Size(min = 1, max = 32, message = "type length must be 1–32")
    @Pattern(regexp = "(?i)FUEL|SERVICE", message = "type must be FUEL or SERVICE")
    private String type;  // "SERVICE" or "FUEL"

    // Optional; if provided must be one of the allowed statuses
    @Pattern(regexp = "(?i)PENDING|CONFIRMED|CANCELLED|COMPLETED",
            message = "status must be PENDING, CONFIRMED, CANCELLED or COMPLETED")
    private String status;

    // Optional additional fields
    private String description;
    private String urgency;
    private String contactPreference;

    // --- getters/setters ---
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public Double getLitersRequested() { return litersRequested; }
    public void setLitersRequested(Double litersRequested) { this.litersRequested = litersRequested; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public Long getServiceTypeId() { return serviceTypeId; }
    public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getContactPreference() { return contactPreference; }
    public void setContactPreference(String contactPreference) { this.contactPreference = contactPreference; }
}
