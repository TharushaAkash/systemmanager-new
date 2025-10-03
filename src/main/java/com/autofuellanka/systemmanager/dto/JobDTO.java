package com.autofuellanka.systemmanager.dto;

import com.autofuellanka.systemmanager.model.Job;
import com.autofuellanka.systemmanager.model.JobStatus;

import java.time.LocalDateTime;

public class JobDTO {

    private Long id;
    private Long bookingId;
    private Long technicianId;
    private String technicianName;
    private JobStatus status;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    public JobDTO(Job job) {
        this.id = job.getId();
        this.bookingId = job.getBooking() != null ? job.getBooking().getId() : null;
        this.technicianId = job.getTechnician() != null ? job.getTechnician().getId() : null;
        this.technicianName = job.getTechnician() != null ? job.getTechnician().getFullName() : null;
        this.status = job.getStatus();
        this.notes = job.getNotes();
        this.assignedAt = job.getAssignedAt();
        this.completedAt = job.getCompletedAt();
    }

    // Getters
    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getTechnicianId() { return technicianId; }
    public String getTechnicianName() { return technicianName; }
    public JobStatus getStatus() { return status; }
    public String getNotes() { return notes; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
