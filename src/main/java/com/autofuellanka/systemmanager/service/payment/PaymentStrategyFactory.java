package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    public PaymentProcessingStrategy getStrategy(PaymentMethod paymentMethod) {
        PaymentProcessingStrategy strategy = strategies.get(paymentMethod);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy found for payment method: " + paymentMethod);
        }
        return strategy;
    }

    public boolean hasStrategy(PaymentMethod paymentMethod) {
        return strategies.containsKey(paymentMethod);
    }
    
    public List<PaymentMethod> getSupportedPaymentMethods() {
        return strategies.keySet().stream()
                .collect(Collectors.toList());
    }
}
