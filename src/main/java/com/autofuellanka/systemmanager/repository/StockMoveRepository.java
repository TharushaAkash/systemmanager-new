package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.model.StockMove;
import com.autofuellanka.systemmanager.model.StockMoveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockMoveRepository extends JpaRepository<StockMove, Long> {
    
    // Find moves by item
    List<StockMove> findByItemOrderByCreatedAtDesc(InventoryItem item);
    
    // Find moves by item with pagination
    Page<StockMove> findByItemOrderByCreatedAtDesc(InventoryItem item, Pageable pageable);
    
    // Find moves by type
    List<StockMove> findByTypeOrderByCreatedAtDesc(StockMoveType type);
    
    // Find moves by date range
    @Query("SELECT sm FROM StockMove sm WHERE sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMove> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find moves by item and date range
    @Query("SELECT sm FROM StockMove sm WHERE sm.item = :item AND sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMove> findByItemAndDateRange(@Param("item") InventoryItem item, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    // Find moves by reference
    List<StockMove> findByReferenceOrderByCreatedAtDesc(String reference);
    
    // Get recent moves with pagination
    Page<StockMove> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Get moves by type and date range
    @Query("SELECT sm FROM StockMove sm WHERE sm.type = :type AND sm.createdAt BETWEEN :startDate AND :endDate ORDER BY sm.createdAt DESC")
    List<StockMove> findByTypeAndDateRange(@Param("type") StockMoveType type, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
}
