package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.stereotype.Component;

@Component
public class CardPaymentStrategy implements PaymentProcessingStrategy {
    
    @Override
    public String getAccountName() {
        return "CARD_PAYMENTS";
    }
    
    @Override
    public boolean validatePayment(Payment payment) {
        // Card payments require additional validation
        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            return false;
        }
        
        // Check if payment reference is provided (card transaction reference)
        if (payment.getReference() == null || payment.getReference().trim().isEmpty()) {
            return false;
        }

        
        return true;
    }
    
    @Override
    public PaymentProcessingResult processPayment(Payment payment) {
        try {

            // Validate card details (simplified)
            if (!isValidCardReference(payment.getReference())) {
                return PaymentProcessingResult.failure("Invalid card transaction reference");
            }
            
            // Simulate processing delay for card payments
            Thread.sleep(100); // Simulate network delay
            
            // Generate transaction ID
            String transactionId = "CARD-" + System.currentTimeMillis();
            
            // Simulate successful card processing
            return PaymentProcessingResult.success(
                "Card payment processed successfully", 
                transactionId
            );
            
        } catch (Exception e) {
            return PaymentProcessingResult.failure(
                "Failed to process card payment: " + e.getMessage()
            );
        }
    }
    
    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.CARD;
    }

    private boolean isValidCardReference(String reference) {
        // Simple validation - in reality, this would be more complex
        return reference != null && reference.length() >= 10 && reference.matches("^[A-Za-z0-9]+$");
    }
}
