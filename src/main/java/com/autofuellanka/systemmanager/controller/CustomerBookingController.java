package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingCreateRequest;
import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.service.BookingValidationService;
import com.autofuellanka.systemmanager.payload.UpdatePayload;
import com.autofuellanka.systemmanager.payload.StatusUpdatePayload;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers/{customerId}/bookings")
public class CustomerBookingController {

    private final BookingRepository bookingRepo;
    private final BookingValidationService validator;

    public CustomerBookingController(BookingRepository bookingRepo,
                                     BookingValidationService validator) {
        this.bookingRepo = bookingRepo;
        this.validator = validator;
    }

    //CREATE BOOKING
    @PostMapping
    public ResponseEntity<?> createBooking(@PathVariable Long customerId,
                                           @Valid @RequestBody BookingCreateRequest req) {
        try {
            validator.requireCustomer(customerId);
            validator.requireLocation(req.getLocationId());
            if (req.getServiceTypeId() != null) validator.requireServiceType(req.getServiceTypeId());
            validator.requireVehicleOwnedBy(req.getVehicleId(), customerId);

            // Time validation
            java.time.LocalDateTime start = java.time.LocalDateTime.parse(req.getStartTime());
            java.time.LocalDateTime end = java.time.LocalDateTime.parse(req.getEndTime());
            if (!end.isAfter(start)) throw new IllegalArgumentException("endTime must be after startTime");

            // Normalize and validate business rules
            var norm = validator.normalize(req.getType(), req.getStatus(), req.getFuelType());
            String err = validator.validateCreateOrUpdate(
                    customerId,
                    req.getLocationId(),
                    req.getServiceTypeId(),
                    req.getVehicleId(),
                    norm.type,
                    norm.status,
                    norm.fuelType,
                    req.getLitersRequested()
            );
            if (err != null) return ResponseEntity.badRequest().body(err);

            // Map to Booking entity
            Booking booking = new Booking();
            booking.setCustomerId(customerId);
            booking.setLocationId(req.getLocationId());
            booking.setVehicleId(req.getVehicleId());
            // Convert ISO format to MySQL format for datetime fields
            String formattedStartTime = req.getStartTime().replace('T', ' ');
            String formattedEndTime = req.getEndTime().replace('T', ' ');
            booking.setStartTime(formattedStartTime);
            booking.setEndTime(formattedEndTime);
            booking.setType(norm.type);
            booking.setStatus(norm.status != null ? norm.status : "PENDING");
            booking.setDescription(req.getDescription());
            booking.setUrgency(req.getUrgency());
            booking.setContactPreference(req.getContactPreference());

            if ("SERVICE".equals(norm.type)) {
                booking.setServiceTypeId(req.getServiceTypeId());
                booking.setFuelType(null);
                booking.setLitersRequested(null);
            } else if ("FUEL".equals(norm.type)) {
                booking.setFuelType(norm.fuelType);
                booking.setLitersRequested(req.getLitersRequested());
                booking.setServiceTypeId(null);
            }

            Booking saved = bookingRepo.save(booking);
            
            // Fetch the saved booking with serviceType to avoid LazyInitializationException
            var createdBooking = bookingRepo.findByIdWithServiceType(saved.getId());
            if (createdBooking.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve created booking");
            }
            
            return ResponseEntity.status(201).body(new BookingDTO(createdBooking.get()));

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    //LIST BOOKINGS
    // Inside listBookings()
    @GetMapping
    public ResponseEntity<?> listBookings(@PathVariable Long customerId) {
        try {
            validator.requireCustomer(customerId);

            // Use fetch join to load serviceType
            List<Booking> bookings = bookingRepo.findByCustomerIdWithServiceType(customerId);
            List<BookingDTO> dtos = bookings.stream()
                    .map(BookingDTO::new)
                    .toList();

            return ResponseEntity.ok(dtos);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }


    //GET SINGLE BOOKING
    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable Long customerId, @PathVariable Long id) {
        try {
            validator.requireCustomer(customerId);
            var optionalBooking = bookingRepo.findByIdWithServiceType(id);
            if (optionalBooking.isEmpty()) return ResponseEntity.status(404).body("Booking not found");
            
            // Verify the booking belongs to the customer
            Booking booking = optionalBooking.get();
            if (!customerId.equals(booking.getCustomerId())) {
                return ResponseEntity.status(404).body("Booking not found");
            }
            
            return ResponseEntity.ok(new BookingDTO(booking));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    //UPDATE BOOKING
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long customerId,
                                           @PathVariable Long id,
                                           @RequestBody UpdatePayload updates) {
        try {
            validator.requireCustomer(customerId);

            var optionalBooking = bookingRepo.findByIdAndCustomerId(id, customerId);
            if (optionalBooking.isEmpty()) return ResponseEntity.status(404).body("Booking not found");

            Booking existing = optionalBooking.get();
            var norm = validator.normalize(updates.type, null, updates.fuelType);

            // Ensure serviceTypeId is not null for SERVICE bookings
            Long finalServiceTypeId = updates.serviceTypeId != null ? updates.serviceTypeId : existing.getServiceTypeId();
            String finalType = norm.type != null ? norm.type : existing.getType();
            
            // For SERVICE bookings, ensure serviceTypeId is not null
            if ("SERVICE".equals(finalType) && finalServiceTypeId == null) {
                return ResponseEntity.badRequest().body("serviceTypeId is required for SERVICE bookings");
            }
            
            // Validate vehicle ownership if vehicleId is being updated
            if (updates.vehicleId != null && !updates.vehicleId.equals(existing.getVehicleId())) {
                validator.requireVehicleOwnedBy(updates.vehicleId, customerId);
            }
            
            String err = validator.validateCreateOrUpdate(
                    customerId,
                    updates.locationId != null ? updates.locationId : existing.getLocationId(),
                    finalServiceTypeId,
                    updates.vehicleId != null ? updates.vehicleId : existing.getVehicleId(),
                    finalType,
                    updates.status != null ? updates.status : existing.getStatus(),
                    norm.fuelType != null ? norm.fuelType : existing.getFuelType(),
                    updates.litersRequested != null ? updates.litersRequested : existing.getLitersRequested()
            );
            if (err != null) return ResponseEntity.badRequest().body(err);

            if (updates.startTime != null) {
                // Convert ISO format (2025-10-07T09:00:00) to MySQL format (2025-10-07 09:00:00)
                String formattedStartTime = updates.startTime.replace('T', ' ');
                existing.setStartTime(formattedStartTime);
            }
            if (updates.endTime != null) {
                // Convert ISO format (2025-10-07T09:00:00) to MySQL format (2025-10-07 09:00:00)
                String formattedEndTime = updates.endTime.replace('T', ' ');
                existing.setEndTime(formattedEndTime);
            }
            
            // Ensure critical fields are never null
            if (existing.getStatus() == null) existing.setStatus("PENDING");
            if (existing.getType() == null) existing.setType("SERVICE");
            if (norm.type != null) existing.setType(norm.type);
            if (updates.status != null) existing.setStatus(updates.status);
            if (updates.locationId != null) existing.setLocationId(updates.locationId);
            if (updates.vehicleId != null) existing.setVehicleId(updates.vehicleId);
            if (norm.fuelType != null) existing.setFuelType(norm.fuelType);
            if (updates.litersRequested != null) existing.setLitersRequested(updates.litersRequested);
            if (updates.serviceTypeId != null) existing.setServiceTypeId(updates.serviceTypeId);

            if ("SERVICE".equals(norm.type)) {
                existing.setFuelType(null);
                existing.setLitersRequested(null);
            } else if ("FUEL".equals(norm.type)) {
                existing.setServiceTypeId(null);
            }

            Booking saved = bookingRepo.save(existing);
            
            // Fetch the saved booking with serviceType to avoid LazyInitializationException
            var updatedBooking = bookingRepo.findByIdWithServiceType(saved.getId());
            if (updatedBooking.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve updated booking");
            }
            
            return ResponseEntity.ok(new BookingDTO(updatedBooking.get()));

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    //CANCEL BOOKING
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long customerId, @PathVariable Long id) {
        try {
            validator.requireCustomer(customerId);

            var optionalBooking = bookingRepo.findByIdAndCustomerId(id, customerId);
            if (optionalBooking.isEmpty()) return ResponseEntity.status(404).body("Booking not found");

            Booking existing = optionalBooking.get();
            String err = validator.validateStatusTransition(existing.getStatus(), "CANCELLED");
            if (err != null) return ResponseEntity.badRequest().body(err);

            existing.setStatus("CANCELLED");
            Booking saved = bookingRepo.save(existing);
            
            // Fetch the saved booking with serviceType to avoid LazyInitializationException
            var cancelledBooking = bookingRepo.findByIdWithServiceType(saved.getId());
            if (cancelledBooking.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve cancelled booking");
            }
            
            return ResponseEntity.ok(new BookingDTO(cancelledBooking.get()));

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    //UPDATE BOOKING STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long customerId,
                                          @PathVariable Long id,
                                          @RequestBody StatusUpdatePayload payload) {
        try {
            validator.requireCustomer(customerId);

            var optionalBooking = bookingRepo.findByIdAndCustomerId(id, customerId);
            if (optionalBooking.isEmpty()) return ResponseEntity.status(404).body("Booking not found");

            Booking existing = optionalBooking.get();
            String err = validator.validateStatusTransition(existing.getStatus(), payload.status);
            if (err != null) return ResponseEntity.badRequest().body(err);

            existing.setStatus(payload.status.toUpperCase());
            Booking saved = bookingRepo.save(existing);
            
            // Fetch the saved booking with serviceType to avoid LazyInitializationException
            var updatedBooking = bookingRepo.findByIdWithServiceType(saved.getId());
            if (updatedBooking.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to retrieve updated booking");
            }
            
            return ResponseEntity.ok(new BookingDTO(updatedBooking.get()));

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(404).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    //HELPER
    private String up(String s) {
        return s == null ? null : s.trim().toUpperCase();
    }
}
