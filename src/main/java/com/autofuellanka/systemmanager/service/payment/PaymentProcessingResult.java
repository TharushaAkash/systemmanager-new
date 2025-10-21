package com.autofuellanka.systemmanager.service.payment;

public class PaymentProcessingResult {
    private boolean success;
    private String message;
    private String transactionId;
    private Object additionalData;
    
    public PaymentProcessingResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public PaymentProcessingResult(boolean success, String message, String transactionId) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
    }
    
    public PaymentProcessingResult(boolean success, String message, String transactionId, Object additionalData) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
        this.additionalData = additionalData;
    }
    
    // Getters and setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public Object getAdditionalData() {
        return additionalData;
    }
    
    public void setAdditionalData(Object additionalData) {
        this.additionalData = additionalData;
    }
    
    public static PaymentProcessingResult success(String message) {
        return new PaymentProcessingResult(true, message);
    }
    
    public static PaymentProcessingResult success(String message, String transactionId) {
        return new PaymentProcessingResult(true, message, transactionId);
    }
    
    public static PaymentProcessingResult failure(String message) {
        return new PaymentProcessingResult(false, message);
    }
}
