package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.model.StockMove;
import com.autofuellanka.systemmanager.model.StockMoveType;
import com.autofuellanka.systemmanager.repository.InventoryRepository;
import com.autofuellanka.systemmanager.repository.StockMoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockMoveRepository stockMoveRepository;

    // Create inventory item with validation
    public InventoryItem createInventoryItem(InventoryItem item) {
        // Validate SKU uniqueness
        if (inventoryRepository.findBySku(item.getSku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + item.getSku());
        }

        // Set defaults
        if (item.getOnHand() == null) item.setOnHand(0);
        if (item.getMinQty() == null) item.setMinQty(0);
        if (item.getIsActive() == null) item.setIsActive(true);

        return inventoryRepository.save(item);
    }

    // Update inventory item with validation
    public InventoryItem updateInventoryItem(Long id, InventoryItem updatedItem) {
        InventoryItem existingItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + id));

        // Check SKU uniqueness if changed
        if (!existingItem.getSku().equals(updatedItem.getSku()) && 
            inventoryRepository.findBySku(updatedItem.getSku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + updatedItem.getSku());
        }

        // Update fields
        existingItem.setSku(updatedItem.getSku());
        existingItem.setName(updatedItem.getName());
        existingItem.setCategory(updatedItem.getCategory());
        existingItem.setOnHand(updatedItem.getOnHand());
        existingItem.setMinQty(updatedItem.getMinQty());
        existingItem.setUnitPrice(updatedItem.getUnitPrice());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setIsActive(updatedItem.getIsActive());

        return inventoryRepository.save(existingItem);
    }

    // Process stock movement
    public StockMove processStockMove(Long itemId, Integer quantity, StockMoveType type, 
                                    String reference, String note, String createdBy) {
        InventoryItem item = inventoryRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + itemId));

        if (!item.getIsActive()) {
            throw new IllegalArgumentException("Cannot process stock move for inactive item");
        }

        // Validate quantity based on type
        int adjustedQuantity = quantity;
        if (type == StockMoveType.ISSUE) {
            adjustedQuantity = -Math.abs(quantity); // Always negative for issues
            if (item.getOnHand() + adjustedQuantity < 0) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + item.getOnHand() + ", Requested: " + Math.abs(adjustedQuantity));
            }
        } else if (type == StockMoveType.RECEIVE) {
            adjustedQuantity = Math.abs(quantity); // Always positive for receives
        } else if (type == StockMoveType.ADJUST) {
            // Adjust can be positive or negative
            if (item.getOnHand() + adjustedQuantity < 0) {
                throw new IllegalArgumentException("Adjustment would result in negative stock");
            }
        }

        // Create stock move
        StockMove stockMove = new StockMove();
        stockMove.setItem(item);
        stockMove.setQuantity(adjustedQuantity);
        stockMove.setType(type);
        stockMove.setReference(reference);
        stockMove.setNote(note);
        stockMove.setCreatedBy(createdBy);
        stockMove.setCreatedAt(LocalDateTime.now());

        StockMove savedMove = stockMoveRepository.save(stockMove);

        // Update item quantity
        item.setOnHand(item.getOnHand() + adjustedQuantity);
        inventoryRepository.save(item);

        return savedMove;
    }

    // Bulk stock adjustment
    public List<StockMove> bulkStockAdjustment(List<StockAdjustment> adjustments, String createdBy) {
        List<StockMove> moves = new java.util.ArrayList<>();

        for (StockAdjustment adjustment : adjustments) {
            try {
                StockMove move = processStockMove(
                    adjustment.getItemId(),
                    adjustment.getQuantity(),
                    StockMoveType.ADJUST,
                    adjustment.getReference(),
                    adjustment.getNote(),
                    createdBy
                );
                moves.add(move);
            } catch (Exception e) {
                // Log error but continue with other adjustments
                System.err.println("Error processing adjustment for item " + adjustment.getItemId() + ": " + e.getMessage());
            }
        }

        return moves;
    }

    // Get low stock items
    public List<InventoryItem> getLowStockItems() {
        return inventoryRepository.findItemsNeedingReorder();
    }

    // Get stock movement history for an item
    public List<StockMove> getStockMovementHistory(Long itemId) {
        InventoryItem item = inventoryRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + itemId));
        return stockMoveRepository.findByItemOrderByCreatedAtDesc(item);
    }

    // Generate SKU automatically
    public String generateSKU(String category, String name) {
        String prefix = category != null ? category.substring(0, Math.min(3, category.length())).toUpperCase() : "ITM";
        String suffix = name != null ? name.replaceAll("[^A-Za-z0-9]", "").substring(0, Math.min(4, name.length())).toUpperCase() : "0000";
        
        String baseSKU = prefix + "-" + suffix;
        String sku = baseSKU;
        int counter = 1;
        
        while (inventoryRepository.findBySku(sku).isPresent()) {
            sku = baseSKU + "-" + String.format("%03d", counter++);
        }
        
        return sku;
    }

    // Inner class for bulk adjustments
    public static class StockAdjustment {
        private Long itemId;
        private Integer quantity;
        private String reference;
        private String note;

        // Constructors, getters, setters
        public StockAdjustment() {}

        public StockAdjustment(Long itemId, Integer quantity, String reference, String note) {
            this.itemId = itemId;
            this.quantity = quantity;
            this.reference = reference;
            this.note = note;
        }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }
}
