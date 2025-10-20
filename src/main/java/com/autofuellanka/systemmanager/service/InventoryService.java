package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

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

    // Get low stock items
    public List<InventoryItem> getLowStockItems() {
        return inventoryRepository.findItemsNeedingReorder();
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
}
