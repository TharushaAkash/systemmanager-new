package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Factory for creating payment processing strategies
 * Uses Spring's dependency injection to automatically discover all strategy implementations
 */
@Component
public class PaymentStrategyFactory {
    
    private final Map<PaymentMethod, PaymentProcessingStrategy> strategies;
    
    @Autowired
    public PaymentStrategyFactory(List<PaymentProcessingStrategy> strategyList) {
        // Convert list to map for O(1) lookup by PaymentMethod
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(
                    PaymentProcessingStrategy::getPaymentMethod,
                    Function.identity()
                ));
    }
    
    /**
     * Get the appropriate strategy for the given payment method
     * @param paymentMethod The payment method
     * @return The corresponding strategy implementation
     * @throws IllegalArgumentException if no strategy is found for the payment method
     */
    public PaymentProcessingStrategy getStrategy(PaymentMethod paymentMethod) {
        PaymentProcessingStrategy strategy = strategies.get(paymentMethod);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy found for payment method: " + paymentMethod);
        }
        return strategy;
    }
    
    /**
     * Check if a strategy exists for the given payment method
     * @param paymentMethod The payment method to check
     * @return true if a strategy exists, false otherwise
     */
    public boolean hasStrategy(PaymentMethod paymentMethod) {
        return strategies.containsKey(paymentMethod);
    }
    
    /**
     * Get all available payment methods that have strategies
     * @return List of supported payment methods
     */
    public List<PaymentMethod> getSupportedPaymentMethods() {
        return strategies.keySet().stream()
                .collect(Collectors.toList());
    }
}
