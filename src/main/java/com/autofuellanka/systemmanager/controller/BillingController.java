package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.*;
import com.autofuellanka.systemmanager.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;


    @Autowired
    private BillingService billingService;

    // Invoice endpoints

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Billing controller is working");
    }

    @GetMapping("/invoices")
    public ResponseEntity<?> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            System.out.println("🔍 INVOICE LIST DEBUG:");
            System.out.println("Page: " + page + ", Size: " + size);
            System.out.println("Sort: " + sortBy + " " + sortDir);
            
            // Test basic repository access
            System.out.println("🔍 Testing repository count...");
            long count = invoiceRepository.count();
            System.out.println("✅ Repository count successful: " + count);
            
            // Test simple list
            System.out.println("🔍 Testing simple list...");
            List<Invoice> allInvoices = invoiceRepository.findAll();
            System.out.println("✅ Simple list successful. Count: " + allInvoices.size());
            
            // Test pagination
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            System.out.println("🔍 Calling paginated repository...");
            Page<Invoice> result = invoiceRepository.findAllByOrderByCreatedAtDesc(pageable);
            System.out.println("✅ Paginated call successful. Total elements: " + result.getTotalElements());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("❌ ERROR in getAllInvoices: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long id) {
        Optional<Invoice> invoice = invoiceRepository.findById(id);
        return invoice.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/invoices/booking/{bookingId}")
    public List<Invoice> getInvoicesByBooking(@PathVariable Long bookingId) {
        return invoiceRepository.findByBookingId(bookingId);
    }

    @GetMapping("/invoices/status/{status}")
    public List<Invoice> getInvoicesByStatus(@PathVariable InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }

    @GetMapping("/invoices/unpaid")
    public List<Invoice> getUnpaidInvoices() {
        return invoiceRepository.findUnpaidInvoices();
    }

    @GetMapping("/invoices/overdue")
    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDateTime.now());
    }

    @GetMapping("/invoices/search")
    public List<Invoice> searchInvoices(@RequestParam String q) {
        return invoiceRepository.searchInvoices(q);
    }

    @PostMapping("/invoices")
    public ResponseEntity<Invoice> createInvoice(@RequestBody InvoiceCreateRequest request) {
        try {
            Invoice invoice = billingService.createInvoiceFromBooking(request.getBookingId());
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Payment endpoints

    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @GetMapping("/payments/invoice/{invoiceId}")
    public List<Payment> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByCreatedAtDesc(invoiceId);
    }

    @GetMapping("/payments/method/{method}")
    public List<Payment> getPaymentsByMethod(@PathVariable PaymentMethod method) {
        return paymentRepository.findByMethod(method);
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> recordPayment(@RequestBody PaymentRequest request) {
        try {
            Payment payment = billingService.recordPayment(
                request.getInvoiceId(),
                request.getAmount(),
                request.getMethod(),
                request.getReference(),
                request.getNotes(),
                "current_user" // TODO: Get from auth context
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/refunds")
    public ResponseEntity<Payment> processRefund(@RequestBody RefundRequest request) {
        try {
            Payment refund = billingService.processRefund(
                request.getInvoiceId(),
                request.getAmount(),
                request.getReason(),
                "current_user" // TODO: Get from auth context
            );
            return ResponseEntity.ok(refund);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Dashboard summary
    @GetMapping("/summary")
    public ResponseEntity<BillingSummary> getBillingSummary() {
        BillingSummary summary = new BillingSummary();
        
        summary.setTotalInvoices(invoiceRepository.count());
        summary.setUnpaidInvoices(invoiceRepository.findUnpaidInvoices().size());
        summary.setOverdueInvoices(invoiceRepository.findOverdueInvoices(LocalDateTime.now()).size());
        summary.setTotalOutstanding(invoiceRepository.getTotalOutstandingBalance());
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now();
        summary.setMonthlyRevenue(invoiceRepository.getTotalRevenueByDateRange(startOfMonth, endOfMonth));
        
        return ResponseEntity.ok(summary);
    }

    // DTOs
    public static class InvoiceCreateRequest {
        private Long bookingId;

        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    }

    public static class PaymentRequest {
        private Long invoiceId;
        private Double amount;
        private PaymentMethod method;
        private String reference;
        private String notes;

        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public PaymentMethod getMethod() { return method; }
        public void setMethod(PaymentMethod method) { this.method = method; }

        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class RefundRequest {
        private Long invoiceId;
        private Double amount;
        private String reason;

        public Long getInvoiceId() { return invoiceId; }
        public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class BillingSummary {
        private long totalInvoices;
        private int unpaidInvoices;
        private int overdueInvoices;
        private Double totalOutstanding;
        private Double monthlyRevenue;

        public long getTotalInvoices() { return totalInvoices; }
        public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

        public int getUnpaidInvoices() { return unpaidInvoices; }
        public void setUnpaidInvoices(int unpaidInvoices) { this.unpaidInvoices = unpaidInvoices; }

        public int getOverdueInvoices() { return overdueInvoices; }
        public void setOverdueInvoices(int overdueInvoices) { this.overdueInvoices = overdueInvoices; }

        public Double getTotalOutstanding() { return totalOutstanding; }
        public void setTotalOutstanding(Double totalOutstanding) { this.totalOutstanding = totalOutstanding; }

        public Double getMonthlyRevenue() { return monthlyRevenue; }
        public void setMonthlyRevenue(Double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }
    }
}
