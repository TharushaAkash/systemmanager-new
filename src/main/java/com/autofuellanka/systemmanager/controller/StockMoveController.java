package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.model.StockMove;
import com.autofuellanka.systemmanager.model.StockMoveType;
import com.autofuellanka.systemmanager.repository.InventoryRepository;
import com.autofuellanka.systemmanager.repository.StockMoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class StockMoveController {

    @Autowired
    private StockMoveRepository stockMoveRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    // Get all stock moves with pagination
    @GetMapping("/moves")
    public Page<StockMove> getAllMoves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return stockMoveRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // Get moves by item
    @GetMapping("/moves/item/{itemId}")
    public List<StockMove> getMovesByItem(@PathVariable Long itemId) {
        Optional<InventoryItem> item = inventoryRepository.findById(itemId);
        if (item.isEmpty()) {
            return List.of();
        }
        return stockMoveRepository.findByItemOrderByCreatedAtDesc(item.get());
    }

    // Get moves by type
    @GetMapping("/moves/type/{type}")
    public List<StockMove> getMovesByType(@PathVariable StockMoveType type) {
        return stockMoveRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    // Get moves by date range
    @GetMapping("/moves/date-range")
    public List<StockMove> getMovesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return stockMoveRepository.findByDateRange(startDate, endDate);
    }

    // Get moves by reference
    @GetMapping("/moves/reference/{reference}")
    public List<StockMove> getMovesByReference(@PathVariable String reference) {
        return stockMoveRepository.findByReferenceOrderByCreatedAtDesc(reference);
    }

    // Create new stock move
    @PostMapping("/moves")
    public ResponseEntity<StockMove> createStockMove(@RequestBody StockMove stockMove) {
        // Validate item exists
        Optional<InventoryItem> item = inventoryRepository.findById(stockMove.getItem().getId());
        if (item.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Set the item
        stockMove.setItem(item.get());

        // Validate quantity based on type
        if (stockMove.getType() == StockMoveType.ISSUE && stockMove.getQuantity() > 0) {
            stockMove.setQuantity(-stockMove.getQuantity()); // Make negative for issue
        } else if (stockMove.getType() == StockMoveType.RECEIVE && stockMove.getQuantity() < 0) {
            stockMove.setQuantity(-stockMove.getQuantity()); // Make positive for receive
        }

        // Save the move
        StockMove savedMove = stockMoveRepository.save(stockMove);

        // Update item quantity
        InventoryItem inventoryItem = item.get();
        int newQuantity = inventoryItem.getOnHand() + stockMove.getQuantity();
        inventoryItem.setOnHand(newQuantity);
        inventoryRepository.save(inventoryItem);

        return ResponseEntity.ok(savedMove);
    }

    // Bulk stock adjustment
    @PostMapping("/moves/bulk-adjust")
    public ResponseEntity<String> bulkAdjustStock(@RequestBody List<StockMove> stockMoves) {
        try {
            for (StockMove move : stockMoves) {
                Optional<InventoryItem> item = inventoryRepository.findById(move.getItem().getId());
                if (item.isEmpty()) {
                    continue; // Skip invalid items
                }

                move.setItem(item.get());
                move.setType(StockMoveType.ADJUST);
                stockMoveRepository.save(move);

                // Update item quantity
                InventoryItem inventoryItem = item.get();
                int newQuantity = inventoryItem.getOnHand() + move.getQuantity();
                inventoryItem.setOnHand(newQuantity);
                inventoryRepository.save(inventoryItem);
            }
            return ResponseEntity.ok("Bulk adjustment completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error during bulk adjustment: " + e.getMessage());
        }
    }

    // Get move by ID
    @GetMapping("/moves/{id}")
    public ResponseEntity<StockMove> getMove(@PathVariable Long id) {
        Optional<StockMove> move = stockMoveRepository.findById(id);
        return move.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
