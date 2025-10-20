package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.model.Feedback;
import com.autofuellanka.systemmanager.model.Invoice;
import com.autofuellanka.systemmanager.model.Job;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.FeedbackRepository;
import com.autofuellanka.systemmanager.repository.InvoiceRepository;
import com.autofuellanka.systemmanager.repository.JobRepository;
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
    
    @Autowired
    private FeedbackRepository feedbackRepo;
    
    @Autowired
    private InvoiceRepository invoiceRepo;
    
    @Autowired
    private JobRepository jobRepo;

    // GET all bookings (with serviceType eagerly fetched)
    @GetMapping
    public List<BookingDTO> getAll() {
        return repo.findAllWithServiceType()
                .stream()
                .map(BookingDTO::new)
                .toList();
    }

    // GET single booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return repo.findByIdWithServiceType(id)
                .map(booking -> ResponseEntity.ok(new BookingDTO(booking)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create booking (fixed 500 bug)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking input) {
        try {
            // Save booking
            Booking saved = repo.save(input);

            // Re-fetch it with serviceType eagerly loaded
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

    // PUT update booking
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

    // DELETE booking with proper foreign key handling
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Step 1: Set foreign keys to NULL in related tables
            // Handle Feedback records
            List<Feedback> feedbacks = feedbackRepo.findAll().stream()
                    .filter(f -> f.getBooking() != null && f.getBooking().getId().equals(id))
                    .toList();
            for (Feedback feedback : feedbacks) {
                feedback.setBooking(null);
                feedbackRepo.save(feedback);
            }

            // Handle Job records
            List<Job> jobs = jobRepo.findAll().stream()
                    .filter(j -> j.getBooking() != null && j.getBooking().getId().equals(id))
                    .toList();
            for (Job job : jobs) {
                job.setBooking(null);
                jobRepo.save(job);
            }

            // Handle Invoice records (set bookingId to NULL)
            List<Invoice> invoices = invoiceRepo.findByBookingId(id);
            for (Invoice invoice : invoices) {
                invoice.setBookingId(null);
                invoiceRepo.save(invoice);
            }

            // Step 2: Now safely delete the booking
            repo.deleteById(id);
            return ResponseEntity.noContent().build();

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
}
