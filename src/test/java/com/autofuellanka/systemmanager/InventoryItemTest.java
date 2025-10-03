package com.autofuellanka.systemmanager;

import com.autofuellanka.systemmanager.model.InventoryItem;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class InventoryItemTest {

    @Test
    public void testInventoryItemCreation() {
        InventoryItem item = new InventoryItem();
        item.setSku("TEST-001");
        item.setName("Test Item");
        item.setCategory("Test Category");
        item.setOnHand(10);
        item.setMinQty(5);
        item.setUnitPrice(99.99);
        item.setDescription("Test Description");
        item.setIsActive(true);

        assertEquals("TEST-001", item.getSku());
        assertEquals("Test Item", item.getName());
        assertEquals("Test Category", item.getCategory());
        assertEquals(10, item.getOnHand());
        assertEquals(5, item.getMinQty());
        assertEquals(99.99, item.getUnitPrice());
        assertEquals("Test Description", item.getDescription());
        assertTrue(item.getIsActive());
        assertFalse(item.needsReorder());
    }

    @Test
    public void testNeedsReorder() {
        InventoryItem item = new InventoryItem();
        item.setOnHand(3);
        item.setMinQty(5);
        
        assertTrue(item.needsReorder());
        
        item.setOnHand(5);
        assertTrue(item.needsReorder());
        
        item.setOnHand(6);
        assertFalse(item.needsReorder());
    }
}
