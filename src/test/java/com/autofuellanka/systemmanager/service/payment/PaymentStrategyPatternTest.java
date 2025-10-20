package com.autofuellanka.systemmanager.service.payment;

import com.autofuellanka.systemmanager.model.Payment;
import com.autofuellanka.systemmanager.model.PaymentMethod;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test for the Payment Strategy Pattern implementation
 */
@SpringBootTest
@ActiveProfiles("test")
public class PaymentStrategyPatternTest {

    @Autowired
    private PaymentProcessor paymentProcessor;

    @Autowired
    private PaymentStrategyFactory strategyFactory;

    @Test
    public void testCashPaymentStrategy() {
        Payment cashPayment = new Payment();
        cashPayment.setMethod(PaymentMethod.CASH);
        cashPayment.setAmount(100.0);
        cashPayment.setReference("CASH-REF-001");

        PaymentProcessingResult result = paymentProcessor.processPayment(cashPayment);
        
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Cash payment processed successfully"));
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().startsWith("CASH-"));
    }

    @Test
    public void testCardPaymentStrategy() {
        Payment cardPayment = new Payment();
        cardPayment.setMethod(PaymentMethod.CARD);
        cardPayment.setAmount(150.0);
        cardPayment.setReference("CARD-TXN-1234567890");

        PaymentProcessingResult result = paymentProcessor.processPayment(cardPayment);
        
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Card payment processed successfully"));
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().startsWith("CARD-"));
    }

    @Test
    public void testOnlinePaymentStrategy() {
        Payment onlinePayment = new Payment();
        onlinePayment.setMethod(PaymentMethod.ONLINE);
        onlinePayment.setAmount(200.0);
        onlinePayment.setReference("ONLINE-TXN-ABC123");

        PaymentProcessingResult result = paymentProcessor.processPayment(onlinePayment);
        
        assertTrue(result.isSuccess());
        assertTrue(result.getMessage().contains("Online payment processed successfully"));
        assertNotNull(result.getTransactionId());
        assertTrue(result.getTransactionId().startsWith("ONLINE-"));
    }

    @Test
    public void testPaymentValidation() {
        // Test invalid card payment (missing reference)
        Payment invalidCardPayment = new Payment();
        invalidCardPayment.setMethod(PaymentMethod.CARD);
        invalidCardPayment.setAmount(100.0);
        // Missing reference

        PaymentProcessingResult result = paymentProcessor.processPayment(invalidCardPayment);
        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("Payment validation failed"));
    }

    @Test
    public void testAccountNameRetrieval() {
        assertEquals("CASH", paymentProcessor.getAccountNameForPaymentMethod(PaymentMethod.CASH));
        assertEquals("CARD_PAYMENTS", paymentProcessor.getAccountNameForPaymentMethod(PaymentMethod.CARD));
        assertEquals("ONLINE_PAYMENTS", paymentProcessor.getAccountNameForPaymentMethod(PaymentMethod.ONLINE));
    }

    @Test
    public void testStrategyFactory() {
        assertTrue(strategyFactory.hasStrategy(PaymentMethod.CASH));
        assertTrue(strategyFactory.hasStrategy(PaymentMethod.CARD));
        assertTrue(strategyFactory.hasStrategy(PaymentMethod.ONLINE));
        
        assertEquals(3, strategyFactory.getSupportedPaymentMethods().size());
    }
}
