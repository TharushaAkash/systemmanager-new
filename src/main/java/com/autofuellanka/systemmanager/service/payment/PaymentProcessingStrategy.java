package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;

public interface PaymentProcessingStrategy {

    String getAccountName();
    boolean validatePayment(Payment payment);

    PaymentProcessingResult processPayment(Payment payment);

    PaymentMethod getPaymentMethod();

    default boolean supports(PaymentMethod method) {
        return getPaymentMethod().equals(method);
    }
}
