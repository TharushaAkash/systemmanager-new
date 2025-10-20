package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Context class that uses the Strategy pattern for payment processing
 * This is the main entry point for payment processing operations
 */
@Service
public class PaymentProcessor {
    
    private final PaymentStrategyFactory strategyFactory;
    
    @Autowired
    public PaymentProcessor(PaymentStrategyFactory strategyFactory) {
        this.strategyFactory = strategyFactory;
    }
    
    /**
     * Process a payment using the appropriate strategy
     * @param payment The payment to process
     * @return Processing result
     */
    public PaymentProcessingResult processPayment(Payment payment) {
        if (payment == null) {
            return PaymentProcessingResult.failure("Payment cannot be null");
        }
        
        if (payment.getMethod() == null) {
            return PaymentProcessingResult.failure("Payment method cannot be null");
        }
        
        try {
            // Get the appropriate strategy for the payment method
            PaymentProcessingStrategy strategy = strategyFactory.getStrategy(payment.getMethod());
            
            // Validate the payment using the strategy
            if (!strategy.validatePayment(payment)) {
                return PaymentProcessingResult.failure(
                    "Payment validation failed for " + payment.getMethod() + " payment"
                );
            }
            
            // Process the payment using the strategy
            PaymentProcessingResult result = strategy.processPayment(payment);
            
            // Add additional context to the result
            if (result.isSuccess()) {
                result.setMessage(result.getMessage() + " (Method: " + payment.getMethod() + ")");
            }
            
            return result;
            
        } catch (IllegalArgumentException e) {
            return PaymentProcessingResult.failure("Unsupported payment method: " + payment.getMethod());
        } catch (Exception e) {
            return PaymentProcessingResult.failure("Payment processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Get the account name for a payment method (for ledger entries)
     * @param paymentMethod The payment method
     * @return Account name for double-entry bookkeeping
     */
    public String getAccountNameForPaymentMethod(PaymentMethod paymentMethod) {
        try {
            PaymentProcessingStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            return strategy.getAccountName();
        } catch (IllegalArgumentException e) {
            // Fallback to default account name
            return "UNKNOWN_PAYMENT";
        }
    }
    
    /**
     * Validate a payment without processing it
     * @param payment The payment to validate
     * @return true if payment is valid, false otherwise
     */
    public boolean validatePayment(Payment payment) {
        if (payment == null || payment.getMethod() == null) {
            return false;
        }
        
        try {
            PaymentProcessingStrategy strategy = strategyFactory.getStrategy(payment.getMethod());
            return strategy.validatePayment(payment);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
    
    /**
     * Get all supported payment methods
     * @return List of supported payment methods
     */
    public java.util.List<PaymentMethod> getSupportedPaymentMethods() {
        return strategyFactory.getSupportedPaymentMethods();
    }
}
