package com.autofuellanka.systemmanager.model;

public enum InvoiceStatus {
    UNPAID,     // No payments made
    PARTIAL,    // Some payments made, balance remaining
    PAID        // Fully paid
}
