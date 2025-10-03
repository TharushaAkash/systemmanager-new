package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Job;
import com.autofuellanka.systemmanager.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByTechnicianId(Long technicianId);

    List<Job> findByStatus(JobStatus status);

    boolean existsByBookingId(Long bookingId);

    boolean existsByTechnicianIdAndStatusIn(Long technicianId, List<JobStatus> statuses);


}

