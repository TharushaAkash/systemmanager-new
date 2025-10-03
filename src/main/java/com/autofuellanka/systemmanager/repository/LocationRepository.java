package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Location;
import com.autofuellanka.systemmanager.model.Location.LocationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByNameContainingIgnoreCase(String q);
    List<Location> findByAddressContainingIgnoreCase(String q);
    List<Location> findByType(LocationType type);
}
