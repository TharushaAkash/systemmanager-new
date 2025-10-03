package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
}
