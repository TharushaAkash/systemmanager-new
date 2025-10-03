package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Invoice;
import com.autofuellanka.systemmanager.model.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    // Find by invoice number
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    // Find by booking ID
    List<Invoice> findByBookingId(Long bookingId);
    
    // Find by status
    List<Invoice> findByStatus(InvoiceStatus status);
    
    // Find by date range
    @Query("SELECT i FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate ORDER BY i.createdAt DESC")
    List<Invoice> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find unpaid invoices
    @Query("SELECT i FROM Invoice i WHERE i.status IN ('UNPAID', 'PARTIAL') ORDER BY i.createdAt ASC")
    List<Invoice> findUnpaidInvoices();
    
    // Find overdue invoices
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :currentDate AND i.status IN ('UNPAID', 'PARTIAL') ORDER BY i.dueDate ASC")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDateTime currentDate);
    
    // Get invoices with pagination
    Page<Invoice> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Search invoices by number or booking ID
    @Query("SELECT i FROM Invoice i WHERE i.invoiceNumber LIKE %:search% OR CAST(i.bookingId AS string) LIKE %:search% ORDER BY i.createdAt DESC")
    List<Invoice> searchInvoices(@Param("search") String search);
    
    // Get total revenue by date range
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get outstanding balance
    @Query("SELECT COALESCE(SUM(i.balance), 0) FROM Invoice i WHERE i.status IN ('UNPAID', 'PARTIAL')")
    Double getTotalOutstandingBalance();
}
