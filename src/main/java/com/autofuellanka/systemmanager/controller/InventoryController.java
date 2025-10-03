package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    // Get all active items
    @GetMapping("/items")
    public List<InventoryItem> getAllItems() {
        return inventoryRepository.findByIsActiveTrue();
    }

    // Get item by ID
    @GetMapping("/items/{id}")
    public ResponseEntity<InventoryItem> getItem(@PathVariable Long id) {
        Optional<InventoryItem> item = inventoryRepository.findById(id);
        return item.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get items needing reorder
    @GetMapping("/items/reorder")
    public List<InventoryItem> getItemsNeedingReorder() {
        return inventoryRepository.findItemsNeedingReorder();
    }

    // Search items
    @GetMapping("/items/search")
    public List<InventoryItem> searchItems(@RequestParam String q) {
        return inventoryRepository.searchByNameOrSku(q);
    }

    // Get items by category
    @GetMapping("/items/category/{category}")
    public List<InventoryItem> getItemsByCategory(@PathVariable String category) {
        return inventoryRepository.findByCategoryAndIsActiveTrue(category);
    }

    // Add new item
    @PostMapping("/items")
    public ResponseEntity<InventoryItem> addItem(@RequestBody InventoryItem item) {
        // Check if SKU already exists
        if (inventoryRepository.findBySku(item.getSku()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        
        InventoryItem savedItem = inventoryRepository.save(item);
        return ResponseEntity.ok(savedItem);
    }

    // Update item
    @PutMapping("/items/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItem updatedItem) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    // Check if SKU is being changed and if it already exists
                    if (!item.getSku().equals(updatedItem.getSku()) && 
                        inventoryRepository.findBySku(updatedItem.getSku()).isPresent()) {
                        return ResponseEntity.badRequest().<InventoryItem>build();
                    }
                    
                    item.setSku(updatedItem.getSku());
                    item.setName(updatedItem.getName());
                    item.setCategory(updatedItem.getCategory());
                    item.setOnHand(updatedItem.getOnHand());
                    item.setMinQty(updatedItem.getMinQty());
                    item.setUnitPrice(updatedItem.getUnitPrice());
                    item.setDescription(updatedItem.getDescription());
                    item.setIsActive(updatedItem.getIsActive());
                    
                    InventoryItem savedItem = inventoryRepository.save(item);
                    return ResponseEntity.ok(savedItem);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Soft delete item (set inactive)
    @DeleteMapping("/items/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        return inventoryRepository.findById(id)
                .map(item -> {
                    item.setIsActive(false);
                    inventoryRepository.save(item);
                    return ResponseEntity.ok("Item deactivated successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get distinct categories
    @GetMapping("/categories")
    public List<String> getCategories() {
        return inventoryRepository.findByIsActiveTrue().stream()
                .map(InventoryItem::getCategory)
                .distinct()
                .sorted()
                .toList();
    }
}
