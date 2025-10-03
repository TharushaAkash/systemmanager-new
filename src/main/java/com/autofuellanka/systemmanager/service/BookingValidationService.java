package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.LocationRepository;
import com.autofuellanka.systemmanager.repository.ServiceTypeRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class BookingValidationService {

    // Allowed values
    private static final Set<String> ALLOWED_TYPES   = Set.of("FUEL", "SERVICE");
    private static final Set<String> ALLOWED_STATUS  = Set.of("PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED");
    private static final Set<String> ALLOWED_FUEL    = Set.of("PETROL", "DIESEL");

    private final UserRepository userRepo;
    private final LocationRepository locationRepo;
    private final ServiceTypeRepository serviceTypeRepo;
    private final VehicleRepository vehicleRepo;

    public BookingValidationService(UserRepository userRepo,
                                    LocationRepository locationRepo,
                                    ServiceTypeRepository serviceTypeRepo,
                                    VehicleRepository vehicleRepo) {
        this.userRepo = userRepo;
        this.locationRepo = locationRepo;
        this.serviceTypeRepo = serviceTypeRepo;
        this.vehicleRepo = vehicleRepo;
    }

    /** Normalize string to UPPERCASE (null-safe) */
    private String up(String s) { return (s == null ? null : s.trim().toUpperCase()); }

    /**
     * Validate a booking “create/update” request.
     * Return null if OK; otherwise a human-readable error string.
     */
    public String validateCreateOrUpdate(Long customerId,
                                         Long locationId,
                                         Long serviceTypeId,
                                         Long vehicleId,
                                         String type,
                                         String status,
                                         String fuelType,
                                         Double litersRequested) {

        // Required IDs
        if (customerId == null) return "customerId is required";
        if (locationId == null) return "locationId is required";

        // Existence checks
        if (!userRepo.existsById(customerId)) return "customerId does not exist";
        if (!locationRepo.existsById(locationId)) return "locationId does not exist";

        // Type / Status validation
        String t = up(type);
        if (t == null || t.isBlank()) return "type is required (FUEL or SERVICE)";
        if (!ALLOWED_TYPES.contains(t)) return "type must be one of: " + ALLOWED_TYPES;

        String st = up(status);
        if (st != null && !st.isBlank() && !ALLOWED_STATUS.contains(st))
            return "status must be one of: " + ALLOWED_STATUS;

        // Vehicle ownership
        if (vehicleId != null) {
            Vehicle v = vehicleRepo.findById(vehicleId).orElse(null);
            if (v == null) return "vehicleId does not exist";
            if (!customerId.equals(v.getCustomerId()))
                return "vehicle does not belong to the given customer";
        }

        // ServiceType rule: required for SERVICE
        if ("SERVICE".equals(t)) {
            if (serviceTypeId == null) return "serviceTypeId is required for SERVICE bookings";
            if (!serviceTypeRepo.existsById(serviceTypeId))
                return "serviceTypeId does not exist";
        } else { // FUEL validations
            String ft = up(fuelType);
            if (litersRequested != null) {
                if (litersRequested <= 0) return "litersRequested must be > 0";
                if (ft == null || ft.isBlank()) return "fuelType is required when litersRequested is provided";
                if (!ALLOWED_FUEL.contains(ft)) return "fuelType must be one of: " + ALLOWED_FUEL;
            }
        }

        // Passed all checks
        return null;
    }

    /** Enforce allowed status transitions */
    public String validateStatusTransition(String currentStatus, String nextStatus) {
        String from = up(currentStatus);
        String to = up(nextStatus);
        if (to == null || to.isBlank()) return null; // nothing to change
        if (!ALLOWED_STATUS.contains(to)) return "status must be one of: " + ALLOWED_STATUS;

        if (from == null || from.isBlank()) return null; // creating with default handled elsewhere

        // Allowed transitions
        switch (from) {
            case "PENDING":
                if (to.equals("CONFIRMED") || to.equals("CANCELLED")) return null;
                break;
            case "CONFIRMED":
                if (to.equals("IN_PROGRESS") || to.equals("CANCELLED")) return null;
                break;
            case "IN_PROGRESS":
                if (to.equals("COMPLETED") || to.equals("CANCELLED")) return null;
                break;
            case "COMPLETED":
            case "CANCELLED":
                break; // terminal states
        }
        return "Invalid status transition: " + from + " -> " + to;
    }

    /** Normalize type, status, fuelType */
    public Normalized normalize(String type, String status, String fuelType) {
        Normalized n = new Normalized();
        n.type = up(type);
        n.status = up(status);
        n.fuelType = up(fuelType);
        return n;
    }

    public static class Normalized {
        public String type;
        public String status;
        public String fuelType;
    }

    // --- Require methods used by controller ---
    public void requireCustomer(Long customerId) {
        if (customerId == null) throw new IllegalArgumentException("customerId is required");
        if (!userRepo.existsById(customerId))
            throw new IllegalStateException("customerId does not exist: " + customerId);
    }

    public void requireLocation(Long locationId) {
        if (locationId == null) throw new IllegalArgumentException("locationId is required");
        if (!locationRepo.existsById(locationId))
            throw new IllegalStateException("locationId does not exist: " + locationId);
    }

    public void requireServiceType(Long serviceTypeId) {
        if (serviceTypeId == null) throw new IllegalArgumentException("serviceTypeId is required");
        if (!serviceTypeRepo.existsById(serviceTypeId))
            throw new IllegalStateException("serviceTypeId does not exist: " + serviceTypeId);
    }

    public void requireVehicleOwnedBy(Long vehicleId, Long customerId) {
        if (vehicleId == null) throw new IllegalArgumentException("vehicleId is required");
        var v = vehicleRepo.findById(vehicleId).orElse(null);
        if (v == null) throw new IllegalStateException("vehicleId does not exist: " + vehicleId);
        if (!customerId.equals(v.getCustomerId()))
            throw new IllegalStateException("vehicle does not belong to the given customer");
    }
}
