package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.stereotype.Component;

/**
 * Cash payment processing strategy
 * Handles cash payments with immediate settlement
 */
@Component
public class CashPaymentStrategy implements PaymentProcessingStrategy {
    
    @Override
    public String getAccountName() {
        return "CASH";
    }
    
    @Override
    public boolean validatePayment(Payment payment) {
        // Cash payments are always valid if amount is positive
        return payment.getAmount() != null && payment.getAmount() > 0;
    }
    
    @Override
    public PaymentProcessingResult processPayment(Payment payment) {
        try {
            // Cash payments are processed immediately
            // In a real system, you might want to log cash handling procedures
            
            // Generate a simple transaction ID for cash payments
            String transactionId = "CASH-" + System.currentTimeMillis();
            
            // Cash payments are always successful (assuming proper validation)
            return PaymentProcessingResult.success(
                "Cash payment processed successfully", 
                transactionId
            );
            
        } catch (Exception e) {
            return PaymentProcessingResult.failure(
                "Failed to process cash payment: " + e.getMessage()
            );
        }
    }
    
    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.CASH;
    }
}
