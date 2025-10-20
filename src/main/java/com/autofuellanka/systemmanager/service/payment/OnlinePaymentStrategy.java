package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.stereotype.Component;

/**
 * Online payment processing strategy
 * Handles online payments (bank transfers, digital wallets, etc.)
 */
@Component
public class OnlinePaymentStrategy implements PaymentProcessingStrategy {
    
    @Override
    public String getAccountName() {
        return "ONLINE_PAYMENTS";
    }
    
    @Override
    public boolean validatePayment(Payment payment) {
        // Online payments require reference and additional validation
        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            return false;
        }
        
        // Online payments must have a reference (transaction ID from payment gateway)
        if (payment.getReference() == null || payment.getReference().trim().isEmpty()) {
            return false;
        }
        
        // Additional online payment validations
        // e.g., minimum amount, maximum amount, etc.
        if (payment.getAmount() < 10.0) { // Minimum online payment amount
            return false;
        }
        
        return true;
    }
    
    @Override
    public PaymentProcessingResult processPayment(Payment payment) {
        try {
            // Simulate online payment processing
            // In a real system, this would integrate with payment gateways like Stripe, PayPal, etc.
            
            // Validate online payment reference
            if (!isValidOnlineReference(payment.getReference())) {
                return PaymentProcessingResult.failure("Invalid online payment reference");
            }
            
            // Simulate processing delay for online payments
            Thread.sleep(200); // Simulate network delay
            
            // Generate transaction ID
            String transactionId = "ONLINE-" + System.currentTimeMillis();
            
            // Simulate successful online processing
            return PaymentProcessingResult.success(
                "Online payment processed successfully", 
                transactionId
            );
            
        } catch (Exception e) {
            return PaymentProcessingResult.failure(
                "Failed to process online payment: " + e.getMessage()
            );
        }
    }
    
    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.ONLINE;
    }
    
    /**
     * Validate online payment reference format
     * In a real system, this would validate against actual payment gateway APIs
     */
    private boolean isValidOnlineReference(String reference) {
        // Simple validation - in reality, this would be more complex
        return reference != null && reference.length() >= 8 && reference.matches("^[A-Za-z0-9-_]+$");
    }
}
