package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.model.Feedback;
import com.autofuellanka.systemmanager.model.Invoice;
import com.autofuellanka.systemmanager.model.Job;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.FeedbackRepository;
import com.autofuellanka.systemmanager.repository.InvoiceRepository;
import com.autofuellanka.systemmanager.repository.JobRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/staff/bookings", "/api/staff/bookings/"})
public class StaffBookingController {

    private final BookingRepository repo;
    private final UserRepository userRepo;
    
    @Autowired
    private FeedbackRepository feedbackRepo;
    
    @Autowired
    private InvoiceRepository invoiceRepo;
    
    @Autowired
    private JobRepository jobRepo;

    public StaffBookingController(BookingRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    private boolean isStaffRole(String role) {
        return role != null && (role.equalsIgnoreCase("STAFF") || role.equalsIgnoreCase("ADMIN"));
    }

    private String resolveRole(String roleHeader, Long userIdHeader) {
        if (roleHeader != null && !roleHeader.isBlank()) return roleHeader;
        if (userIdHeader != null) {
            Optional<User> u = userRepo.findById(userIdHeader);
            return u.map(User::getRole).orElse(null);
        }
        return null;
    }

    // List all bookings
    @GetMapping({"", "/"})
    public ResponseEntity<?> listAll(
            @RequestHeader(value = "X-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader
    ) {
        String role = resolveRole(roleHeader, userIdHeader);
        if (!isStaffRole(role)) return ResponseEntity.status(403).body("Forbidden: STAFF/ADMIN only");

        List<Booking> all = repo.findAllWithServiceType();
        return ResponseEntity.ok(all.stream().map(BookingDTO::new).toList());
    }

    // Update booking status only
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(value = "X-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @PathVariable Long id,
            @RequestBody StaffBookingController.StatusPayload payload
    ) {
        String role = resolveRole(roleHeader, userIdHeader);
        if (!isStaffRole(role)) return ResponseEntity.status(403).body("Forbidden: STAFF/ADMIN only");
        if (payload == null || payload.status == null || payload.status.isBlank()) {
            return ResponseEntity.badRequest().body("status is required");
        }

        return repo.findById(id).map(b -> {
            b.setStatus(payload.status);
            Booking saved = repo.save(b);
            // reload with fetch join for DTO
            Booking full = repo.findByIdWithServiceType(saved.getId()).orElse(saved);
            return ResponseEntity.ok(new BookingDTO(full));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE booking (Staff only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @RequestHeader(value = "X-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @PathVariable Long id
    ) {
        String role = resolveRole(roleHeader, userIdHeader);
        if (!isStaffRole(role)) return ResponseEntity.status(403).body("Forbidden: STAFF/ADMIN only");

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

    public static class StatusPayload {
        public String status;
    }
}
