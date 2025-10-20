package com.autofuellanka.systemmanager.service.invoice;

import com.autofuellanka.systemmanager.model.*;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.InvoiceRepository;
import com.autofuellanka.systemmanager.repository.FinanceLedgerRepository;
import com.autofuellanka.systemmanager.service.FuelPricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingInvoiceWorkflow extends InvoiceCreationTemplate {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FinanceLedgerRepository financeLedgerRepository;

    @Autowired
    private FuelPricingService fuelPricingService;

    @Override
    protected void validateSource(Long bookingId) {
        bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        List<Invoice> existing = invoiceRepository.findByBookingId(bookingId);
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("Invoice already exists for booking: " + bookingId);
        }
    }

    @Override
    protected Invoice initializeInvoice(Long bookingId) {
        Invoice invoice = new Invoice();
        invoice.setBookingId(bookingId);
        invoice.setDueDate(LocalDateTime.now().plusDays(30));
        return invoice;
    }

    @Override
    protected void buildInvoiceLines(Invoice invoice, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).get();

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

        if (booking.getLitersRequested() != null && booking.getLitersRequested() > 0 && booking.getFuelType() != null) {
            InvoiceLine fuelLine = new InvoiceLine();
            fuelLine.setInvoice(invoice);
            fuelLine.setType(InvoiceLineType.PART);
            fuelLine.setDescription("Fuel - " + booking.getFuelType());
            fuelLine.setQuantity(booking.getLitersRequested().intValue());

            FuelType fuelTypeEnum = FuelType.valueOf(booking.getFuelType());
            Double pricePerLiter = fuelPricingService.getPricePerLiter(fuelTypeEnum);
            fuelLine.setUnitPrice(pricePerLiter);
            fuelLine.calculateLineTotal();
        }
    }

    @Override
    protected void calculateTotals(Invoice invoice) {
        Double subtotal = 0.0;
        if (invoice.getInvoiceLines() != null) {
            for (InvoiceLine line : invoice.getInvoiceLines()) {
                subtotal += line.getLineTotal();
            }
        }
        invoice.setSubtotal(subtotal);
        Double taxAmount = subtotal * 0.15;
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(subtotal + taxAmount);
        invoice.setBalance(invoice.getTotalAmount());
    }

    @Override
    protected Invoice persist(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Override
    protected void afterPersist(Invoice invoice, Long bookingId) {
        FinanceLedger debitEntry = new FinanceLedger();
        debitEntry.setTransactionDate(invoice.getCreatedAt());
        debitEntry.setAccount("ACCOUNTS_RECEIVABLE");
        debitEntry.setTransactionType(TransactionType.DEBIT);
        debitEntry.setAmount(invoice.getTotalAmount());
        debitEntry.setReference(invoice.getInvoiceNumber());
        debitEntry.setDescription("Invoice created for booking " + bookingId);
        debitEntry.setCreatedBy("system");
        financeLedgerRepository.save(debitEntry);

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
}


