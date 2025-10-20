package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.*;
import com.autofuellanka.systemmanager.service.payment.PaymentProcessor;
import com.autofuellanka.systemmanager.service.payment.PaymentProcessingResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BillingService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FinanceLedgerRepository financeLedgerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FuelPricingService fuelPricingService;

    @Autowired
    private com.autofuellanka.systemmanager.service.invoice.BookingInvoiceWorkflow bookingInvoiceWorkflow;

    @Autowired
    private com.autofuellanka.systemmanager.service.invoice.FuelOnlyInvoiceWorkflow fuelOnlyInvoiceWorkflow;

    @Autowired
    private PaymentProcessor paymentProcessor;


    public Invoice createInvoiceFromBooking(Long bookingId) {
        return bookingInvoiceWorkflow.process(bookingId);
    }

    public Invoice createFuelOnlyInvoiceFromBooking(Long bookingId) {
        return fuelOnlyInvoiceWorkflow.process(bookingId);
    }

    private void createInvoiceLinesFromBooking(Invoice invoice, Booking booking) { }

    private void calculateInvoiceTotals(Invoice invoice) { }

    public Payment recordPayment(Long invoiceId, Double amount, PaymentMethod method, 
                               String reference, String notes, String createdBy) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        if (amount > invoice.getBalance()) {
            throw new IllegalArgumentException("Payment amount cannot exceed invoice balance");
        }

        // Create payment
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setMethod(method);
        payment.setAmount(amount);
        payment.setReference(reference);
        payment.setNotes(notes);
        payment.setCreatedBy(createdBy);

        // Use Strategy Pattern to process payment
        PaymentProcessingResult processingResult = paymentProcessor.processPayment(payment);
        
        if (!processingResult.isSuccess()) {
            throw new IllegalArgumentException("Payment processing failed: " + processingResult.getMessage());
        }

        // Update payment with transaction ID if available
        if (processingResult.getTransactionId() != null) {
            payment.setReference(processingResult.getTransactionId());
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice
        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.calculateBalance();
        invoiceRepository.save(invoice);

        // Create ledger entries using strategy-based account names
        createPaymentLedgerEntries(savedPayment);

        return savedPayment;
    }

    public Payment processRefund(Long invoiceId, Double amount, String reason, String createdBy) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (amount <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        if (amount > invoice.getPaidAmount()) {
            throw new IllegalArgumentException("Refund amount cannot exceed paid amount");
        }

        // Create refund payment (negative amount)
        Payment refund = new Payment();
        refund.setInvoice(invoice);
        refund.setMethod(PaymentMethod.CASH); // Default refund method
        refund.setAmount(-amount); // Negative amount for refund
        refund.setReference("REFUND-" + System.currentTimeMillis());
        refund.setNotes("Refund: " + reason);
        refund.setCreatedBy(createdBy);

        Payment savedRefund = paymentRepository.save(refund);

        // Update invoice
        invoice.setPaidAmount(invoice.getPaidAmount() - amount);
        invoice.calculateBalance();
        invoiceRepository.save(invoice);

        // Create ledger entries
        createRefundLedgerEntries(savedRefund);

        return savedRefund;
    }

    private void createInvoiceLedgerEntries(Invoice invoice) { }

    private void createPaymentLedgerEntries(Payment payment) {
        // Debit: Cash/Card/Online account (using Strategy Pattern)
        String accountName = paymentProcessor.getAccountNameForPaymentMethod(payment.getMethod());
        
        FinanceLedger debitEntry = new FinanceLedger();
        debitEntry.setTransactionDate(payment.getCreatedAt());
        debitEntry.setAccount(accountName);
        debitEntry.setTransactionType(TransactionType.DEBIT);
        debitEntry.setAmount(payment.getAmount());
        debitEntry.setReference(payment.getReference());
        debitEntry.setDescription("Payment received for invoice " + payment.getInvoice().getInvoiceNumber());
        debitEntry.setCreatedBy(payment.getCreatedBy());
        financeLedgerRepository.save(debitEntry);

        // Credit: Accounts Receivable
        FinanceLedger creditEntry = new FinanceLedger();
        creditEntry.setTransactionDate(payment.getCreatedAt());
        creditEntry.setAccount("ACCOUNTS_RECEIVABLE");
        creditEntry.setTransactionType(TransactionType.CREDIT);
        creditEntry.setAmount(payment.getAmount());
        creditEntry.setReference(payment.getReference());
        creditEntry.setDescription("Payment received for invoice " + payment.getInvoice().getInvoiceNumber());
        creditEntry.setCreatedBy(payment.getCreatedBy());
        financeLedgerRepository.save(creditEntry);
    }

    private void createRefundLedgerEntries(Payment refund) {
        // Debit: Accounts Receivable (increase receivable)
        FinanceLedger debitEntry = new FinanceLedger();
        debitEntry.setTransactionDate(refund.getCreatedAt());
        debitEntry.setAccount("ACCOUNTS_RECEIVABLE");
        debitEntry.setTransactionType(TransactionType.DEBIT);
        debitEntry.setAmount(Math.abs(refund.getAmount())); // Make positive for debit
        debitEntry.setReference(refund.getReference());
        debitEntry.setDescription("Refund issued for invoice " + refund.getInvoice().getInvoiceNumber());
        debitEntry.setCreatedBy(refund.getCreatedBy());
        financeLedgerRepository.save(debitEntry);

        // Credit: Cash account (decrease cash) - using Strategy Pattern
        String accountName = paymentProcessor.getAccountNameForPaymentMethod(refund.getMethod());
        
        FinanceLedger creditEntry = new FinanceLedger();
        creditEntry.setTransactionDate(refund.getCreatedAt());
        creditEntry.setAccount(accountName);
        creditEntry.setTransactionType(TransactionType.CREDIT);
        creditEntry.setAmount(Math.abs(refund.getAmount())); // Make positive for credit
        creditEntry.setReference(refund.getReference());
        creditEntry.setDescription("Refund issued for invoice " + refund.getInvoice().getInvoiceNumber());
        creditEntry.setCreatedBy(refund.getCreatedBy());
        financeLedgerRepository.save(creditEntry);
    }

}
