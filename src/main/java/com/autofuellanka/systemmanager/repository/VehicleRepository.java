package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByCustomerId(Long customerId);
    List<Vehicle> findByPlateNumberContainingIgnoreCase(String platePart);
}
