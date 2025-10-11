package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.*;
import com.autofuellanka.systemmanager.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PaymentGatewayController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BillingService billingService;

    @Autowired
    private BookingRepository bookingRepository;

    // Create invoice for a booking
    @PostMapping("/invoices")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceCreateRequest request) {
        System.out.println("🔍 INVOICE CREATION DEBUG:");
        System.out.println("Request received: " + request);
        System.out.println("Booking ID: " + request.getBookingId());
        System.out.println("Subtotal: " + request.getSubtotal());
        System.out.println("Tax Amount: " + request.getTaxAmount());
        System.out.println("Total Amount: " + request.getTotalAmount());

        try {
            // Validate request
            if (request.getBookingId() == null) {
                System.out.println("❌ ERROR: Booking ID is null");
                return ResponseEntity.badRequest().body("Booking ID is required");
            }
            if (request.getSubtotal() == null || request.getSubtotal() < 0) {
                return ResponseEntity.badRequest().body("Valid subtotal is required");
            }
            if (request.getTaxAmount() == null || request.getTaxAmount() < 0) {
                return ResponseEntity.badRequest().body("Valid tax amount is required");
            }
            if (request.getTotalAmount() == null || request.getTotalAmount() <= 0) {
                return ResponseEntity.badRequest().body("Valid total amount is required");
            }

            // Check if booking exists
            System.out.println("🔍 Checking if booking exists: " + request.getBookingId());
            boolean bookingExists = bookingRepository.existsById(request.getBookingId());
            System.out.println("Booking exists: " + bookingExists);

            if (!bookingExists) {
                System.out.println("❌ ERROR: Booking not found with ID: " + request.getBookingId());
                return ResponseEntity.badRequest().body("Booking not found with ID: " + request.getBookingId());
            }

            // Check if invoice already exists for this booking
            System.out.println("🔍 Checking for existing invoices for booking: " + request.getBookingId());
            List<Invoice> existingInvoices = invoiceRepository.findByBookingId(request.getBookingId());
            System.out.println("Existing invoices count: " + existingInvoices.size());

            if (!existingInvoices.isEmpty()) {
                System.out.println("❌ ERROR: Invoice already exists for booking: " + request.getBookingId());
                return ResponseEntity.badRequest().body("Invoice already exists for booking: " + request.getBookingId());
            }

            // Create invoice with null safety
            System.out.println("🔍 Creating invoice...");
            Invoice invoice = new Invoice();
            invoice.setBookingId(request.getBookingId());

            // Ensure all numeric fields are not null
            invoice.setSubtotal(request.getSubtotal() != null ? request.getSubtotal() : 0.0);
            invoice.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : 0.0);
            invoice.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : 0.0);
            invoice.setPaidAmount(0.0);
            invoice.setBalance(request.getTotalAmount() != null ? request.getTotalAmount() : 0.0);
            invoice.setStatus(InvoiceStatus.UNPAID);
            invoice.setCreatedAt(LocalDateTime.now());
            invoice.setDueDate(LocalDateTime.now().plusDays(30));

            System.out.println("🔍 Invoice object created:");
            System.out.println("- Booking ID: " + invoice.getBookingId());
            System.out.println("- Invoice Number: " + invoice.getInvoiceNumber());
            System.out.println("- Subtotal: " + invoice.getSubtotal());
            System.out.println("- Tax Amount: " + invoice.getTaxAmount());
            System.out.println("- Total Amount: " + invoice.getTotalAmount());
            System.out.println("- Status: " + invoice.getStatus());

            System.out.println("🔍 Saving invoice to database...");
            Invoice savedInvoice = invoiceRepository.save(invoice);
            System.out.println("✅ Invoice saved successfully!");
            System.out.println("Saved Invoice ID: " + savedInvoice.getId());
            System.out.println("Saved Invoice: " + savedInvoice);

            return ResponseEntity.ok(savedInvoice);
        } catch (IllegalArgumentException e) {
            System.out.println("❌ VALIDATION ERROR: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.out.println("❌ DATABASE CONSTRAINT VIOLATION: " + e.getMessage());
            return ResponseEntity.badRequest().body("Database constraint violation: " + e.getMessage());
        } catch (org.springframework.dao.OptimisticLockingFailureException e) {
            System.out.println("❌ CONCURRENT MODIFICATION: " + e.getMessage());
            return ResponseEntity.status(409).body("Concurrent modification detected. Please try again.");
        } catch (Exception e) {
            System.out.println("❌ UNEXPECTED ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Process payment with booking ID (new flow: booking → payment → invoice)
    @PostMapping("/payments")
    @Transactional
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        System.out.println("🔍 NEW PAYMENT FLOW DEBUG:");
        System.out.println("Request received: " + request);
        System.out.println("Booking ID: " + request.getBookingId());
        System.out.println("Method: " + request.getMethod());
        System.out.println("Amount: " + request.getAmount());
        System.out.println("Reference: " + request.getReference());
        System.out.println("Notes: " + request.getNotes());
        System.out.println("Created By: " + request.getCreatedBy());

        try {
            // Validate request
            if (request.getBookingId() == null || request.getBookingId() <= 0) {
                System.out.println("❌ ERROR: Booking ID is null or invalid");
                return ResponseEntity.badRequest().body("Valid booking ID is required");
            }
            if (request.getAmount() == null || request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body("Valid payment amount is required");
            }
            if (request.getMethod() == null || request.getMethod().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Payment method is required");
            }

            // Validate payment method
            PaymentMethod paymentMethod;
            try {
                paymentMethod = PaymentMethod.valueOf(request.getMethod().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid payment method. Must be CARD, CASH, or ONLINE");
            }

            // Check if booking exists
            System.out.println("🔍 Checking if booking exists: " + request.getBookingId());
            Optional<Booking> bookingOpt = bookingRepository.findById(request.getBookingId());
            System.out.println("Booking found: " + bookingOpt.isPresent());

            if (bookingOpt.isEmpty()) {
                System.out.println("❌ ERROR: Booking not found with ID: " + request.getBookingId());
                return ResponseEntity.badRequest().body("Booking not found with ID: " + request.getBookingId());
            }

            Booking booking = bookingOpt.get();
            System.out.println("✅ Booking found: " + booking.getId() + " - " + booking.getType());

            // Create invoice first
            System.out.println("🔍 Creating invoice...");
            Invoice invoice = new Invoice();
            invoice.setBookingId(booking.getId());
            invoice.setSubtotal(request.getAmount() / 1.15); // Calculate subtotal (remove 15% tax)
            invoice.setTaxAmount(request.getAmount() - (request.getAmount() / 1.15)); // Calculate tax
            invoice.setTotalAmount(request.getAmount());
            invoice.setPaidAmount(0.0);
            invoice.setBalance(request.getAmount());
            invoice.setStatus(InvoiceStatus.UNPAID);
            invoice.setCreatedAt(LocalDateTime.now());
            invoice.setDueDate(LocalDateTime.now().plusDays(30));

            System.out.println("🔍 Invoice details:");
            System.out.println("- Booking ID: " + invoice.getBookingId());
            System.out.println("- Subtotal: " + invoice.getSubtotal());
            System.out.println("- Tax Amount: " + invoice.getTaxAmount());
            System.out.println("- Total Amount: " + invoice.getTotalAmount());
            System.out.println("- Paid Amount: " + invoice.getPaidAmount());
            System.out.println("- Balance: " + invoice.getBalance());
            System.out.println("- Status: " + invoice.getStatus());

            Invoice savedInvoice;
            try {
                savedInvoice = invoiceRepository.save(invoice);
                System.out.println("✅ Invoice created successfully! ID: " + savedInvoice.getId());
            } catch (Exception e) {
                System.out.println("❌ ERROR creating invoice: " + e.getMessage());
                System.out.println("❌ Exception type: " + e.getClass().getSimpleName());
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to create invoice: " + e.getMessage());
            }

            // Now create payment with invoice reference
            System.out.println("🔍 Creating payment...");
            Payment payment = new Payment();
            payment.setInvoice(savedInvoice); // Set the invoice first
            payment.setMethod(paymentMethod);
            payment.setAmount(request.getAmount());
            payment.setReference(request.getReference() != null ? request.getReference() : "");
            payment.setNotes(request.getNotes() != null ? request.getNotes() : "");
            payment.setCreatedBy(request.getCreatedBy() != null ? request.getCreatedBy() : "system");
            payment.setCreatedAt(LocalDateTime.now());

            System.out.println("Payment object details:");
            System.out.println("- Method: " + payment.getMethod());
            System.out.println("- Amount: " + payment.getAmount());
            System.out.println("- Reference: " + payment.getReference());
            System.out.println("- Notes: " + payment.getNotes());
            System.out.println("- Created By: " + payment.getCreatedBy());
            System.out.println("- Created At: " + payment.getCreatedAt());

            Payment savedPayment;
            try {
                savedPayment = paymentRepository.save(payment);
                System.out.println("✅ Payment saved successfully! ID: " + savedPayment.getId());
            } catch (Exception e) {
                System.out.println("❌ ERROR saving payment: " + e.getMessage());
                System.out.println("❌ Exception type: " + e.getClass().getSimpleName());
                System.out.println("❌ Root cause: " + (e.getCause() != null ? e.getCause().getMessage() : "No root cause"));
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to save payment: " + e.getMessage());
            }

            // Update invoice with payment info
            Double newPaidAmount = savedInvoice.getPaidAmount() + request.getAmount();
            savedInvoice.setPaidAmount(newPaidAmount);
            // Balance and status will be updated by @PreUpdate

            try {
                savedInvoice = invoiceRepository.save(savedInvoice);
                System.out.println("✅ Invoice updated. New status: " + savedInvoice.getStatus());
            } catch (Exception e) {
                System.out.println("❌ ERROR updating invoice: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the transaction for this
            }

            // Return payment with invoice info
            return ResponseEntity.ok(Map.of(
                    "payment", savedPayment,
                    "invoice", savedInvoice,
                    "message", "Payment processed and invoice created successfully"
            ));
        } catch (IllegalArgumentException e) {
            System.out.println("❌ VALIDATION ERROR in payment: " + e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.out.println("❌ DATABASE CONSTRAINT VIOLATION in payment: " + e.getMessage());
            return ResponseEntity.badRequest().body("Database constraint violation: " + e.getMessage());
        } catch (org.springframework.dao.OptimisticLockingFailureException e) {
            System.out.println("❌ CONCURRENT MODIFICATION in payment: " + e.getMessage());
            return ResponseEntity.status(409).body("Concurrent modification detected. Please try again.");
        } catch (Exception e) {
            System.out.println("❌ UNEXPECTED ERROR in payment: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Update invoice status
    @PutMapping("/invoices/{id}/status")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestBody InvoiceStatusUpdate request) {
        try {
            Invoice invoice = invoiceRepository.findById(id).orElse(null);
            if (invoice == null) {
                return ResponseEntity.notFound().build();
            }

            invoice.setStatus(InvoiceStatus.valueOf(request.getStatus()));
            if (request.getPaidAmount() != null) {
                invoice.setPaidAmount(request.getPaidAmount());
                invoice.setBalance(invoice.getTotalAmount() - invoice.getPaidAmount());
            }

            Invoice updatedInvoice = invoiceRepository.save(invoice);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DTOs
    public static class InvoiceCreateRequest {
        private Long bookingId;
        private Double subtotal;
        private Double taxAmount;
        private Double totalAmount;
        private String status;

        // Getters and setters
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public Double getSubtotal() { return subtotal; }
        public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
        public Double getTaxAmount() { return taxAmount; }
        public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PaymentRequest {
        private Long bookingId;
        private String method;
        private Double amount;
        private String reference;
        private String notes;
        private String createdBy;

        // Getters and setters
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    }

    public static class InvoiceStatusUpdate {
        private String status;
        private Double paidAmount;

        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getPaidAmount() { return paidAmount; }
        public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    }
}