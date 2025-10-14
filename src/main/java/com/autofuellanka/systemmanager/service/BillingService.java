package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.*;
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


    public Invoice createInvoiceFromBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        // Check if invoice already exists for this booking
        List<Invoice> existingInvoices = invoiceRepository.findByBookingId(bookingId);
        if (!existingInvoices.isEmpty()) {
            throw new IllegalArgumentException("Invoice already exists for booking: " + bookingId);
        }

        Invoice invoice = new Invoice();
        invoice.setBookingId(bookingId);
        invoice.setDueDate(LocalDateTime.now().plusDays(30)); // 30 days from now

        // Create invoice lines from booking
        createInvoiceLinesFromBooking(invoice, booking);

        // Calculate totals
        calculateInvoiceTotals(invoice);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Create ledger entries
        createInvoiceLedgerEntries(savedInvoice);

        return savedInvoice;
    }

    private void createInvoiceLinesFromBooking(Invoice invoice, Booking booking) {
        // Add service line
        if (booking.getServiceType() != null) {
            InvoiceLine serviceLine = new InvoiceLine();
            serviceLine.setInvoice(invoice);
            serviceLine.setType(InvoiceLineType.SERVICE);
            serviceLine.setReferenceId(booking.getServiceTypeId());
            serviceLine.setDescription(booking.getServiceType().getName());
            serviceLine.setQuantity(1);
            serviceLine.setUnitPrice(booking.getServiceType().getPrice() != null ? booking.getServiceType().getPrice() : 0.0);
            serviceLine.calculateLineTotal();
        }

        // Add fuel line if fuel was requested
        if (booking.getLitersRequested() != null && booking.getLitersRequested() > 0 && booking.getFuelType() != null) {
            InvoiceLine fuelLine = new InvoiceLine();
            fuelLine.setInvoice(invoice);
            fuelLine.setType(InvoiceLineType.PART);
            fuelLine.setDescription("Fuel - " + booking.getFuelType());
            fuelLine.setQuantity(booking.getLitersRequested().intValue());
            
            // Get fuel price from FuelPricingService
            // Convert String fuelType to FuelType enum
            FuelType fuelTypeEnum = FuelType.valueOf(booking.getFuelType());
            Double pricePerLiter = fuelPricingService.getPricePerLiter(fuelTypeEnum);
            fuelLine.setUnitPrice(pricePerLiter);
            fuelLine.calculateLineTotal();
        }
    }

    private void calculateInvoiceTotals(Invoice invoice) {
        Double subtotal = 0.0;
        
        if (invoice.getInvoiceLines() != null) {
            for (InvoiceLine line : invoice.getInvoiceLines()) {
                subtotal += line.getLineTotal();
            }
        }

        invoice.setSubtotal(subtotal);
        
        // Calculate tax (15% VAT)
        Double taxAmount = subtotal * 0.15;
        invoice.setTaxAmount(taxAmount);
        
        // Calculate total
        invoice.setTotalAmount(subtotal + taxAmount);
        invoice.setBalance(invoice.getTotalAmount());
    }

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

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice
        invoice.setPaidAmount(invoice.getPaidAmount() + amount);
        invoice.calculateBalance();
        invoiceRepository.save(invoice);

        // Create ledger entries
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

    private void createInvoiceLedgerEntries(Invoice invoice) {
        // Debit: Accounts Receivable
        FinanceLedger debitEntry = new FinanceLedger();
        debitEntry.setTransactionDate(invoice.getCreatedAt());
        debitEntry.setAccount("ACCOUNTS_RECEIVABLE");
        debitEntry.setTransactionType(TransactionType.DEBIT);
        debitEntry.setAmount(invoice.getTotalAmount());
        debitEntry.setReference(invoice.getInvoiceNumber());
        debitEntry.setDescription("Invoice created for booking " + invoice.getBookingId());
        debitEntry.setCreatedBy("system");
        financeLedgerRepository.save(debitEntry);

        // Credit: Revenue
        FinanceLedger creditEntry = new FinanceLedger();
        creditEntry.setTransactionDate(invoice.getCreatedAt());
        creditEntry.setAccount("REVENUE");
        creditEntry.setTransactionType(TransactionType.CREDIT);
        creditEntry.setAmount(invoice.getTotalAmount());
        creditEntry.setReference(invoice.getInvoiceNumber());
        creditEntry.setDescription("Revenue from invoice " + invoice.getInvoiceNumber());
        creditEntry.setCreatedBy("system");
        financeLedgerRepository.save(creditEntry);
    }

    private void createPaymentLedgerEntries(Payment payment) {
        // Debit: Cash/Card/Online account
        String accountName = getAccountNameForPaymentMethod(payment.getMethod());
        
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

        // Credit: Cash account (decrease cash)
        String accountName = getAccountNameForPaymentMethod(refund.getMethod());
        
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

    private String getAccountNameForPaymentMethod(PaymentMethod method) {
        switch (method) {
            case CASH: return "CASH";
            case CARD: return "CARD_PAYMENTS";
            case ONLINE: return "ONLINE_PAYMENTS";
            default: return "CASH";
        }
    }
}
