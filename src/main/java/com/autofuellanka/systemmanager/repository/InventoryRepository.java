package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    
    // Find by SKU
    Optional<InventoryItem> findBySku(String sku);
    
    // Find active items
    List<InventoryItem> findByIsActiveTrue();
    
    // Find items that need reorder
    @Query("SELECT i FROM InventoryItem i WHERE i.isActive = true AND i.onHand <= i.minQty")
    List<InventoryItem> findItemsNeedingReorder();
    
    // Find by category
    List<InventoryItem> findByCategoryAndIsActiveTrue(String category);
    
    // Search by name or SKU
    @Query("SELECT i FROM InventoryItem i WHERE i.isActive = true AND (LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<InventoryItem> searchByNameOrSku(@Param("search") String search);
}
