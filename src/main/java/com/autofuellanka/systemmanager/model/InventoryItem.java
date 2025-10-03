package com.autofuellanka.systemmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items",
        indexes = {
                @Index(name = "idx_inventory_sku", columnList = "sku"),
                @Index(name = "idx_inventory_category", columnList = "category")
        })
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;         // Stock Keeping Unit - unique identifier

    @Column(name = "name", nullable = false, length = 100)
    private String name;        // Item name

    @Column(name = "category", length = 50)
    private String category;    // e.g., Spare Part, Fuel, Accessory

    @Column(name = "on_hand", nullable = false)
    private Integer onHand = 0; // Current stock quantity

    @Column(name = "min_qty", nullable = false)
    private Integer minQty = 0; // Minimum quantity before reorder alert

    @Column(name = "unit_price")
    private Double unitPrice;   // Price per unit

    @Column(name = "description", length = 500)
    private String description; // Item description

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // Whether item is active

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getOnHand() { return onHand; }
    public void setOnHand(Integer onHand) { this.onHand = onHand; }

    public Integer getMinQty() { return minQty; }
    public void setMinQty(Integer minQty) { this.minQty = minQty; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // Helper method to check if item needs reorder
    public boolean needsReorder() {
        return onHand != null && minQty != null && onHand <= minQty;
    }
}