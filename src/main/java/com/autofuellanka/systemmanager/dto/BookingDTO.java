package com.autofuellanka.systemmanager.dto;

import com.autofuellanka.systemmanager.model.Booking;

public class BookingDTO {

    private Long id;
    private String startTime;
    private String endTime;
    private String fuelType;
    private Double litersRequested;
    private String status;
    private String type;
    private String description;
    private String urgency;
    private String contactPreference;
    private Long customerId;
    private Long locationId;
    private Long vehicleId;

    // Service info
    private Long serviceTypeId;
    private String serviceName;
    private Double price;

    public BookingDTO(Booking b) {
        if (b == null) return;

        this.id = b.getId();
        this.startTime = b.getStartTime() != null ? b.getStartTime() : "";
        this.endTime = b.getEndTime() != null ? b.getEndTime() : "";
        this.fuelType = b.getFuelType() != null ? b.getFuelType() : "";
        this.litersRequested = b.getLitersRequested();
        this.status = b.getStatus() != null ? b.getStatus() : "UNKNOWN";
        this.type = b.getType() != null ? b.getType() : "UNKNOWN";
        this.description = b.getDescription() != null ? b.getDescription() : "";
        this.urgency = b.getUrgency() != null ? b.getUrgency() : "";
        this.contactPreference = b.getContactPreference() != null ? b.getContactPreference() : "";
        this.customerId = b.getCustomerId();
        this.locationId = b.getLocationId();
        this.vehicleId = b.getVehicleId();

        if (b.getServiceType() != null) {
            this.serviceTypeId = b.getServiceType().getId();
            this.serviceName = b.getServiceType().getName() != null ? b.getServiceType().getName() : "";
        }

        if ("SERVICE".equalsIgnoreCase(this.type) && b.getServiceType() != null) {
            this.price = b.getServiceType().getBasePrice();
        } else {
            this.price = null;
        }
    }

    // ---- Getters ----
    public Long getId() { return id; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public String getFuelType() { return fuelType; }
    public Double getLitersRequested() { return litersRequested; }
    public String getStatus() { return status; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public String getUrgency() { return urgency; }
    public String getContactPreference() { return contactPreference; }
    public Long getCustomerId() { return customerId; }
    public Long getLocationId() { return locationId; }
    public Long getVehicleId() { return vehicleId; }
    public Long getServiceTypeId() { return serviceTypeId; }
    public String getServiceName() { return serviceName; }
    public Double getPrice() { return price; }
}
