package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.JobDTO;
import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.JobRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobRepository jobRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;

    public JobController(JobRepository jobRepo, BookingRepository bookingRepo, UserRepository userRepo) {
        this.jobRepo = jobRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
    }

    //1. Get all jobs
    @GetMapping
    public List<JobDTO> listAll() {
        return jobRepo.findAll().stream().map(JobDTO::new).collect(Collectors.toList());
    }

    //2. Get single job by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return jobRepo.findById(id)
                .map(j -> ResponseEntity.ok(new JobDTO(j)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //3. Create job (assign technician)
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobCreateRequest request) {

        // Validate booking
        Booking booking = bookingRepo.findById(request.getBookingId()).orElse(null);
        if (booking == null) return ResponseEntity.badRequest().body("Invalid bookingId");

        // Check if job already exists for this booking
        if (jobRepo.existsByBookingId(request.getBookingId())) {
            return ResponseEntity.badRequest().body("This booking already has a job assigned");
        }
        // Check if the technician already has a job that is not DONE or CANCELLED
        boolean hasActiveJob = jobRepo.existsByTechnicianIdAndStatusIn(
                request.getTechnicianId(),
                List.of(JobStatus.QUEUED, JobStatus.IN_PROGRESS, JobStatus.BLOCKED)
        );
        if (hasActiveJob) {
            return ResponseEntity.badRequest().body("Technician already has an active job");
        }

        // Validate technician
        User technician = userRepo.findById(request.getTechnicianId()).orElse(null);
        if (technician == null) return ResponseEntity.badRequest().body("Invalid technicianId");

        // Create job
        Job job = new Job();
        job.setBooking(booking);
        job.setTechnician(technician);
        job.setStatus(JobStatus.QUEUED);
        job.setNotes(request.getNotes());
        job.setAssignedAt(java.time.LocalDateTime.now());

        Job saved = jobRepo.save(job);
        return ResponseEntity.created(URI.create("/api/jobs/" + saved.getId()))
                .body(new JobDTO(saved));
    }


    //4. Update job status and/or notes
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id,
                                       @RequestParam(required = false) JobStatus status,
                                       @RequestBody(required = false) String notes) {
        return jobRepo.findById(id).map(job -> {
            if (status != null) {
                job.setStatus(status);
                if (status == JobStatus.DONE) {
                    job.setCompletedAt(java.time.LocalDateTime.now());
                }
            }
            if (notes != null) {
                job.setNotes(notes);
            }
            Job updated = jobRepo.save(job);
            return ResponseEntity.ok(new JobDTO(updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    //5. Delete job
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (!jobRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepo.deleteById(id);
        return ResponseEntity.ok("Job " + id + " deleted successfully");
    }

    //DTO for job creation
    public static class JobCreateRequest {
        private Long bookingId;
        private Long technicianId;
        private String notes;

        public Long getBookingId() {
            return bookingId;
        }

        public void setBookingId(Long bookingId) {
            this.bookingId = bookingId;
        }

        public Long getTechnicianId() {
            return technicianId;
        }

        public void setTechnicianId(Long technicianId) {
            this.technicianId = technicianId;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}
