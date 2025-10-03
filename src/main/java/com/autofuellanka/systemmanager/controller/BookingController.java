package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository repo;

    public BookingController(BookingRepository repo) {
        this.repo = repo;
    }

    // List all bookings
    @GetMapping
    public List<BookingDTO> listAll() {
        return repo.findAllWithServiceType().stream()
                .map(BookingDTO::new)
                .collect(Collectors.toList());
    }

    // Get one booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return repo.findByIdWithServiceType(id)
                .map(b -> ResponseEntity.ok(new BookingDTO(b)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create booking
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking input) {
        // minimal validation
        if (input.getCustomerId() == null) {
            return ResponseEntity.badRequest().body("customerId is required");
        }
        if (input.getLocationId() == null) {
            return ResponseEntity.badRequest().body("locationId is required");
        }
        if (input.getStartTime() == null || input.getStartTime().isBlank()) {
            return ResponseEntity.badRequest().body("startTime is required (e.g. 2025-10-10 09:00:00)");
        }
        if (input.getStatus() == null || input.getStatus().isBlank()) {
            input.setStatus("PENDING");
        }
        if (input.getType() == null || input.getType().isBlank()) {
            input.setType("SERVICE");
        }

        try {
            Booking saved = repo.save(input);
            return ResponseEntity.created(URI.create("/api/bookings/" + saved.getId()))
                    .body(new BookingDTO(saved));
        } catch (DataIntegrityViolationException ex) {
            String msg = ex.getMostSpecificCause() != null
                    ? ex.getMostSpecificCause().getMessage()
                    : ex.getMessage();
            return ResponseEntity.badRequest().body("DB constraint error: " + msg);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Server error: " + ex.getMessage());
        }
    }
    //Update booking
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Booking updates) {
        return repo.findById(id).map(b -> {
            if (updates.getStartTime() != null && !updates.getStartTime().isBlank())
                b.setStartTime(updates.getStartTime());
            if (updates.getEndTime() != null && !updates.getEndTime().isBlank())
                b.setEndTime(updates.getEndTime());
            if (updates.getFuelType() != null)
                b.setFuelType(updates.getFuelType());
            if (updates.getLitersRequested() != null)
                b.setLitersRequested(updates.getLitersRequested());
            if (updates.getStatus() != null && !updates.getStatus().isBlank())
                b.setStatus(updates.getStatus());
            if (updates.getType() != null && !updates.getType().isBlank())
                b.setType(updates.getType());
            if (updates.getCustomerId() != null)
                b.setCustomerId(updates.getCustomerId());     // must be a valid users.id
            if (updates.getLocationId() != null)
                b.setLocationId(updates.getLocationId());     // must be a valid locations.id
            if (updates.getServiceTypeId() != null)
                b.setServiceTypeId(updates.getServiceTypeId());// must be a valid service_types.id
            if (updates.getVehicleId() != null)
                b.setVehicleId(updates.getVehicleId());       // must be a valid vehicles.id

            Booking saved = repo.save(b);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    //Delete booking
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.ok("Booking " + id + " deleted successfully");
    }


}
