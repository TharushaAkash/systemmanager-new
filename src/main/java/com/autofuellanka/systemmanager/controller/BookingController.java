package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository repo;

    // ✅ GET all bookings (with serviceType eagerly fetched)
    @GetMapping
    public List<BookingDTO> getAll() {
        return repo.findAllWithServiceType()
                .stream()
                .map(BookingDTO::new)
                .toList();
    }

    // ✅ GET single booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return repo.findByIdWithServiceType(id)
                .map(booking -> ResponseEntity.ok(new BookingDTO(booking)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST create booking (fixed 500 bug)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking input) {
        try {
            // Save booking
            Booking saved = repo.save(input);

            // 🔥 Re-fetch it with serviceType eagerly loaded
            Booking full = repo.findByIdWithServiceType(saved.getId())
                    .orElse(saved);

            // Return DTO safely (no LazyInitializationException)
            return ResponseEntity
                    .created(URI.create("/api/bookings/" + full.getId()))
                    .body(new BookingDTO(full));

        } catch (DataIntegrityViolationException ex) {
            String msg = ex.getMostSpecificCause() != null
                    ? ex.getMostSpecificCause().getMessage()
                    : ex.getMessage();
            return ResponseEntity.badRequest().body("DB constraint error: " + msg);
        } catch (Exception ex) {
            ex.printStackTrace(); // Optional: for debugging
            return ResponseEntity.internalServerError()
                    .body("Server error: " + ex.getMessage());
        }
    }

    // ✅ PUT update booking
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Booking input) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            input.setId(id);
            Booking updated = repo.save(input);

            // Re-fetch to include serviceType
            Booking full = repo.findByIdWithServiceType(updated.getId())
                    .orElse(updated);

            return ResponseEntity.ok(new BookingDTO(full));

        } catch (DataIntegrityViolationException ex) {
            String msg = ex.getMostSpecificCause() != null
                    ? ex.getMostSpecificCause().getMessage()
                    : ex.getMessage();
            return ResponseEntity.badRequest().body("DB constraint error: " + msg);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Server error: " + ex.getMessage());
        }
    }

    // ✅ DELETE booking
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
