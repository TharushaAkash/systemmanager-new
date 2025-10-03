package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.BookingDTO;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/staff/bookings", "/api/staff/bookings/"})
public class StaffBookingController {

    private final BookingRepository repo;
    private final UserRepository userRepo;

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

    // List all bookings (fetch join to avoid LazyInitializationException)
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

    public static class StatusPayload {
        public String status;
    }
}
