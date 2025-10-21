package com.autofuellanka.systemmanager.service.invoice;

import com.autofuellanka.systemmanager.model.Invoice;


public abstract class InvoiceCreationTemplate {

    public final Invoice process(Long sourceId) {
        validateSource(sourceId);
        Invoice invoice = initializeInvoice(sourceId);
        buildInvoiceLines(invoice, sourceId);
        calculateTotals(invoice);
        Invoice saved = persist(invoice);
        afterPersist(saved, sourceId);
        return saved;
    }

    protected abstract void validateSource(Long sourceId);

    protected abstract Invoice initializeInvoice(Long sourceId);

    protected abstract void buildInvoiceLines(Invoice invoice, Long sourceId);

    protected abstract void calculateTotals(Invoice invoice);

    protected abstract Invoice persist(Invoice invoice);

    protected void afterPersist(Invoice invoice, Long sourceId) { }
}


