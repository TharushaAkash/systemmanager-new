package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;

/**
 * Strategy interface for different payment processing implementations.
 * Each payment method (Cash, Card, Online) can have its own processing logic.
 */
public interface PaymentProcessingStrategy {
    
    /**
     * Get the account name for this payment method in the finance ledger
     * @return Account name for double-entry bookkeeping
     */
    String getAccountName();
    
    /**
     * Validate payment-specific requirements
     * @param payment The payment to validate
     * @return true if payment is valid, false otherwise
     */
    boolean validatePayment(Payment payment);
    
    /**
     * Process the payment with method-specific logic
     * @param payment The payment to process
     * @return Processing result with success status and any additional data
     */
    PaymentProcessingResult processPayment(Payment payment);
    
    /**
     * Get the payment method this strategy handles
     * @return The PaymentMethod enum value
     */
    PaymentMethod getPaymentMethod();
    
    /**
     * Check if this strategy supports the given payment method
     * @param method The payment method to check
     * @return true if this strategy handles the method
     */
    default boolean supports(PaymentMethod method) {
        return getPaymentMethod().equals(method);
    }
}
