package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payments by invoice
    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);

    // Find payments by method
    List<Payment> findByMethod(PaymentMethod method);

    // Find payments by date range
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<Payment> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find payments by reference
    List<Payment> findByReferenceContainingIgnoreCase(String reference);

    // Get total payments by method and date range
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.method = :method AND p.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalPaymentsByMethodAndDateRange(@Param("method") PaymentMethod method,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    // Get total payments by date range
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalPaymentsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}