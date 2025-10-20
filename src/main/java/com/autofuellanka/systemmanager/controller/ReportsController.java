package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.InventoryItem;
import com.autofuellanka.systemmanager.model.VehicleType;
import com.autofuellanka.systemmanager.model.Customer;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private InventoryRepository inventoryRepository;


    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Download Inventory Report
    @GetMapping("/inventory")
    public ResponseEntity<byte[]> downloadInventoryReport() {
        try {
            List<InventoryItem> items = inventoryRepository.findByIsActiveTrue();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos);
            
            // CSV Header
            writer.println("SKU,Name,Category,On Hand,Min Qty,Unit Price,Reorder Status,Description");
            
            // CSV Data
            for (InventoryItem item : items) {
                String reorderStatus = item.needsReorder() ? "Low Stock" : "OK";
                writer.printf("%s,%s,%s,%d,%d,%.2f,%s,%s%n",
                    item.getSku(),
                    item.getName(),
                    item.getCategory(),
                    item.getOnHand(),
                    item.getMinQty(),
                    item.getUnitPrice() != null ? item.getUnitPrice() : 0.0,
                    reorderStatus,
                    item.getDescription() != null ? item.getDescription() : ""
                );
            }
            
            writer.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "inventory_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    // Download Vehicle Types Report
    @GetMapping("/vehicle-types")
    public ResponseEntity<byte[]> downloadVehicleTypesReport() {
        try {
            List<VehicleType> vehicleTypes = vehicleTypeRepository.findByIsActiveTrue();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos);
            
            // CSV Header
            writer.println("Make,Model,Year,Fuel Type,Engine Capacity,Transmission,Description");
            
            // CSV Data
            for (VehicleType vt : vehicleTypes) {
                writer.printf("%s,%s,%d,%s,%s,%s,%s%n",
                    vt.getMake(),
                    vt.getModel(),
                    vt.getYear(),
                    vt.getFuelType(),
                    vt.getEngineCapacity() != null ? vt.getEngineCapacity() : "",
                    vt.getTransmission() != null ? vt.getTransmission() : "",
                    vt.getDescription() != null ? vt.getDescription() : ""
                );
            }
            
            writer.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "vehicle_types_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Download Users Report
    @GetMapping("/users")
    public ResponseEntity<byte[]> downloadUsersReport() {
        try {
            List<Customer> customers = customerRepository.findAll();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos);
            
            // CSV Header
            writer.println("ID,Name,Email,Phone,Address,Registration Date,Status");
            
            // CSV Data
            for (Customer customer : customers) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s%n",
                    customer.getId(),
                    customer.getFullName(),
                    customer.getEmail(),
                    customer.getPhone() != null ? customer.getPhone() : "",
                    customer.getAddress() != null ? customer.getAddress() : "",
                    "N/A", // No createdAt field in Customer model
                    customer.getEnabled() ? "Active" : "Inactive"
                );
            }
            
            writer.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "users_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Download Bookings Report
    @GetMapping("/bookings")
    public ResponseEntity<byte[]> downloadBookingsReport() {
        try {
            List<Booking> bookings = bookingRepository.findAllWithServiceTypeAndCustomer();
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos);
            
            // CSV Header
            writer.println("ID,Customer Name,Customer Email,Vehicle Plate,Service Type,Booking Date,Status,Total Amount");
            
            // CSV Data
            for (Booking booking : bookings) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%.2f%n",
                    booking.getId(),
                    booking.getCustomer() != null ? booking.getCustomer().getFullName() : "N/A",
                    booking.getCustomer() != null ? booking.getCustomer().getEmail() : "N/A",
                    booking.getVehicleId() != null ? "Vehicle ID: " + booking.getVehicleId() : "N/A",
                    booking.getServiceType() != null ? booking.getServiceType().getName() : "N/A",
                    booking.getStartTime() != null ? booking.getStartTime() : "",
                    booking.getStatus() != null ? booking.getStatus() : "N/A",
                    0.0 // No totalAmount field in Booking model
                );
            }
            
            writer.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                "bookings_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Dashboard Summary
    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary() {
        DashboardSummary summary = new DashboardSummary();
        
        summary.setTotalInventoryItems(inventoryRepository.findByIsActiveTrue().size());
        summary.setLowStockItems(inventoryRepository.findItemsNeedingReorder().size());
        summary.setTotalCustomers(customerRepository.findAll().size());
        summary.setTotalBookings(bookingRepository.findAll().size());
        summary.setTotalVehicleTypes(vehicleTypeRepository.findByIsActiveTrue().size());
        
        return ResponseEntity.ok(summary);
    }

    // Dashboard Summary DTO
    public static class DashboardSummary {
        private int totalInventoryItems;
        private int lowStockItems;
        private int totalCustomers;
        private int totalBookings;
        private int totalVehicleTypes;

        // Getters and Setters
        public int getTotalInventoryItems() { return totalInventoryItems; }
        public void setTotalInventoryItems(int totalInventoryItems) { this.totalInventoryItems = totalInventoryItems; }

        public int getLowStockItems() { return lowStockItems; }
        public void setLowStockItems(int lowStockItems) { this.lowStockItems = lowStockItems; }

        public int getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }

        public int getTotalBookings() { return totalBookings; }
        public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

        public int getTotalVehicleTypes() { return totalVehicleTypes; }
        public void setTotalVehicleTypes(int totalVehicleTypes) { this.totalVehicleTypes = totalVehicleTypes; }
    }
}
