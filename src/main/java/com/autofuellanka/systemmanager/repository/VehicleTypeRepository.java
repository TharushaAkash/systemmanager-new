package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {
    
    // Find active vehicle types
    List<VehicleType> findByIsActiveTrue();
    
    // Find by make
    List<VehicleType> findByMakeAndIsActiveTrue(String make);
    
    // Find by make and model
    List<VehicleType> findByMakeAndModelAndIsActiveTrue(String make, String model);
    
    // Find by fuel type
    List<VehicleType> findByFuelTypeAndIsActiveTrue(String fuelType);
    
    // Find by year range
    @Query("SELECT vt FROM VehicleType vt WHERE vt.isActive = true AND vt.year BETWEEN :startYear AND :endYear ORDER BY vt.year DESC")
    List<VehicleType> findByYearRange(@Param("startYear") Integer startYear, @Param("endYear") Integer endYear);
    
    // Search by make, model, or year
    @Query("SELECT vt FROM VehicleType vt WHERE vt.isActive = true AND (LOWER(vt.make) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(vt.model) LIKE LOWER(CONCAT('%', :search, '%')) OR CAST(vt.year AS string) LIKE CONCAT('%', :search, '%'))")
    List<VehicleType> searchByMakeModelOrYear(@Param("search") String search);
    
    // Check if combination exists
    @Query("SELECT COUNT(vt) > 0 FROM VehicleType vt WHERE vt.make = :make AND vt.model = :model AND vt.year = :year AND vt.fuelType = :fuelType AND vt.isActive = true")
    boolean existsByMakeModelYearAndFuelType(@Param("make") String make, 
                                           @Param("model") String model, 
                                           @Param("year") Integer year, 
                                           @Param("fuelType") String fuelType);
    
    // Get distinct makes
    @Query("SELECT DISTINCT vt.make FROM VehicleType vt WHERE vt.isActive = true ORDER BY vt.make")
    List<String> findDistinctMakes();
    
    // Get distinct models by make
    @Query("SELECT DISTINCT vt.model FROM VehicleType vt WHERE vt.make = :make AND vt.isActive = true ORDER BY vt.model")
    List<String> findDistinctModelsByMake(@Param("make") String make);
}
