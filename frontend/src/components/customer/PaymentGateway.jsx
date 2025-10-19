import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function PaymentGateway({ bookingData, onNavigate, onPaymentSuccess }) {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        paymentMethod: "CARD"
    });

    // Booking summary state
    const [bookingSummary, setBookingSummary] = useState({
        serviceType: "",
        vehicle: "",
        location: "",
        date: "",
        time: "",
        urgency: "",
        description: "",
        subtotal: 0,
        tax: 0,
        total: 0
    });

    // Load booking details and calculate pricing
    useEffect(() => {
        if (bookingData) {
            calculateBookingSummary();
        } else {
            console.error("PaymentGateway: bookingData is undefined");
            setError("No booking data received. Please go back and try again.");
        }
    }, [bookingData]);

    const calculateBookingSummary = () => {
        if (!bookingData) return;

        let basePrice = 0;

        // Calculate pricing based on service type and booking type
        if (bookingData.bookingType === "FUEL") {
            // Fuel pricing: liters * price per liter
            const liters = bookingData.litersRequested || 0;
            // Use correct fuel prices based on fuel type
            let pricePerLiter = 299.0; // Default to Petrol 92
            if (bookingData.fuelType === "PETROL_92") pricePerLiter = 299.0;
            else if (bookingData.fuelType === "PETROL_95") pricePerLiter = 361.0;
            else if (bookingData.fuelType === "DIESEL_AUTO") pricePerLiter = 277.0;
            else if (bookingData.fuelType === "DIESEL_SUPER") pricePerLiter = 313.0;
            basePrice = liters * pricePerLiter;
        } else {
            // Use actual service price from database
            basePrice = bookingData.servicePrice || 0;
        }

        // Add urgency surcharge
        const urgencySurcharge = bookingData.urgency === "URGENT" ? basePrice * 0.3 :
            bookingData.urgency === "HIGH" ? basePrice * 0.2 :
                bookingData.urgency === "NORMAL" ? 0 : -basePrice * 0.1; // LOW gets discount

        const subtotal = basePrice + urgencySurcharge;
        const tax = subtotal * 0.15; // 15% VAT
        const total = subtotal + tax;

        setBookingSummary({
            serviceType: bookingData.serviceType,
            vehicle: bookingData.vehicle,
            location: bookingData.location,
            date: bookingData.preferredDate,
            time: bookingData.preferredTime,
            urgency: bookingData.urgency,
            description: bookingData.description,
            subtotal: subtotal,
            tax: tax,
            total: total
        });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            console.log("🔍 Initial validation checks:");
            console.log("- Booking Data:", bookingData);
            console.log("- Payment Form:", paymentForm);
            console.log("- Booking Summary:", bookingSummary);
            console.log("- User:", user);

            // Validate bookingSummary has valid amounts
            if (!bookingSummary.subtotal || !bookingSummary.tax || !bookingSummary.total) {
                throw new Error("Invalid booking summary. Please refresh and try again.");
            }

            // Step 1: Validate booking data
            if (!bookingData.vehicleId || !bookingData.locationId || !bookingData.serviceType) {
                throw new Error("Missing required booking information");
            }

            // Validate booking IDs are valid numbers
            if (isNaN(parseInt(bookingData.vehicleId)) || isNaN(parseInt(bookingData.locationId))) {
                throw new Error("Invalid vehicle or location ID");
            }

            // Validate serviceTypeId if provided
            if (bookingData.serviceTypeId && isNaN(parseInt(bookingData.serviceTypeId))) {
                throw new Error("Invalid service type ID");
            }

            // Step 1.5: Validate payment form
            if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
                throw new Error("Please fill in all payment details");
            }

            // Validate payment method matches backend enum exactly
            const validPaymentMethods = ['CARD', 'CASH', 'ONLINE'];
            if (!validPaymentMethods.includes(paymentForm.paymentMethod)) {
                throw new Error("Invalid payment method. Must be CARD, CASH, or ONLINE");
            }

            // Validate bookingSummary.total is a valid number
            if (!bookingSummary.total || isNaN(bookingSummary.total) || bookingSummary.total <= 0) {
                throw new Error("Invalid total amount. Please refresh and try again.");
            }

            // Validate user.email length (max 50 characters)
            if (!user.email || user.email.length > 50) {
                throw new Error("Invalid user email. Please contact support.");
            }

            // Validate notes length (max 500 characters)
            const paymentNotes = `Payment for booking ${bookingData.vehicleId}`;
            if (paymentNotes.length > 500) {
                throw new Error("Payment notes too long. Please contact support.");
            }

            // Run comprehensive validation
            const validationErrors = validatePaymentData();
            if (validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
            }

            // Validate card number (basic check)
            const cardNumber = paymentForm.cardNumber.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                throw new Error("Invalid card number");
            }

            // Validate expiry date
            const [month, year] = paymentForm.expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            if (parseInt(month) < 1 || parseInt(month) > 12) {
                throw new Error("Invalid expiry month");
            }

            if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                throw new Error("Card has expired");
            }

            // Validate CVV
            if (paymentForm.cvv.length < 3 || paymentForm.cvv.length > 4) {
                throw new Error("Invalid CVV");
            }

            // Step 2: Create the booking first
            const bookingResponse = await fetch(`${API_BASE}/api/customers/${user.id}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: user.id,
                    vehicleId: parseInt(bookingData.vehicleId),
                    locationId: parseInt(bookingData.locationId),
                    type: bookingData.bookingType || "SERVICE",
                    startTime: `${bookingData.preferredDate}T${bookingData.preferredTime}:00`,
                    endTime: `${bookingData.preferredDate}T${parseInt(bookingData.preferredTime.split(':')[0]) + 2}:00:00`,
                    serviceTypeId: bookingData.serviceTypeId ? parseInt(bookingData.serviceTypeId) : 1,
                    status: "PENDING",
                    description: bookingData.description,
                    urgency: bookingData.urgency,
                    contactPreference: bookingData.contactPreference,
                    ...(bookingData.bookingType === "FUEL" && {
                        fuelType: bookingData.fuelType,
                        litersRequested: bookingData.litersRequested
                    })
                })
            });

            if (!bookingResponse.ok) {
                const errorText = await bookingResponse.text();
                console.error("Booking creation failed:", errorText);
                throw new Error(`Failed to create booking: ${errorText || `HTTP ${bookingResponse.status}`}`);
            }

            const booking = await bookingResponse.json();
            console.log("✅ Booking created:", booking);
            console.log("Booking ID:", booking.id, "Type:", typeof booking.id);

            // Validate booking was created successfully
            if (!booking || !booking.id || typeof booking.id !== 'number' || booking.id <= 0) {
                throw new Error("Invalid booking created");
            }

            // Step 3: Process payment with booking ID
            console.log("🔍 Processing payment with booking ID:", booking.id);

            // Round payment amount to 2 decimal places
            const roundedAmount = Number(bookingSummary.total.toFixed(2));

            const paymentPayload = {
                bookingId: booking.id,
                method: paymentForm.paymentMethod,
                amount: roundedAmount,
                reference: `TXN-${Date.now()}`,
                notes: `Payment for booking ${booking.id}`.substring(0, 500),
                createdBy: user.email.substring(0, 50)
            };

            console.log("🔍 PAYMENT PROCESSING PAYLOAD:", paymentPayload);

            const paymentResponse = await fetch(`${API_BASE}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentPayload)
            });

            if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                console.error("Payment processing failed:", {
                    status: paymentResponse.status,
                    statusText: paymentResponse.statusText,
                    errorText: errorText,
                    requestBody: paymentPayload
                });

                let errorMessage = `Payment processing failed: HTTP ${paymentResponse.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            const response = await paymentResponse.json();
            console.log("✅ Payment processed successfully:", response);

            const payment = response.payment;
            const invoice = response.invoice;

            setSuccess("Payment successful! Your booking has been confirmed and an invoice has been generated.");

            setTimeout(() => {
                if (onPaymentSuccess) {
                    onPaymentSuccess(booking, invoice, payment);
                } else {
                    onNavigate('my-bookings');
                }
            }, 3000);

        } catch (e) {
            console.error("Payment processing error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const validatePaymentData = () => {
        const errors = [];

        if (!bookingSummary.total || isNaN(bookingSummary.total) || bookingSummary.total <= 0) {
            errors.push(`Invalid total amount: ${bookingSummary.total}`);
        }

        const validMethods = ['CARD', 'ONLINE', 'CASH'];
        if (!validMethods.includes(paymentForm.paymentMethod)) {
            errors.push(`Invalid payment method: ${paymentForm.paymentMethod}. Must be CARD, ONLINE, or CASH.`);
        }

        if (!user.email || user.email.length > 50) {
            errors.push(`User email too long: ${user.email?.length} characters. Max 50 allowed.`);
        }

        const paymentNotes = `Payment for booking ${bookingData.vehicleId}`;
        if (paymentNotes.length > 500) {
            errors.push(`Notes too long: ${paymentNotes.length} characters. Max 500 allowed.`);
        }

        return errors;
    };

    // If no booking data, show error message
    if (!bookingData) {
        return (
            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>❌ No Booking Data</h3>
                    <p style={{ margin: "0 0 15px 0" }}>
                        No booking information was received. Please go back and fill out the booking form again.
                    </p>
                    <button
                        onClick={() => onNavigate('service-booking')}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#1a73e8",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        ← Back to Booking Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{
                    color: "#1a73e8",
                    margin: "0 0 10px 0",
                    fontSize: "2rem",
                    fontWeight: "700"
                }}>
                    💳 Payment Gateway
                </h2>
                <p style={{ color: "#666", margin: 0 }}>
                    Complete your service booking payment
                </p>
            </div>

            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: "#e8f5e8",
                    color: "#2e7d32",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    {success}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                {/* Booking Summary */}
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "25px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ color: "#1a73e8", marginBottom: "20px", fontSize: "1.3rem" }}>
                        📋 Booking Summary
                    </h3>

                    <div style={{ marginBottom: "15px" }}>
                        <strong>Service:</strong> {bookingSummary.serviceType}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Vehicle:</strong> {bookingSummary.vehicle}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Location:</strong> {bookingSummary.location}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Date & Time:</strong> {bookingSummary.date} at {bookingSummary.time}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Urgency:</strong> {bookingSummary.urgency}
                    </div>
                    {bookingSummary.description && (
                        <div style={{ marginBottom: "20px" }}>
                            <strong>Description:</strong><br />
                            <span style={{ color: "#666", fontSize: "14px" }}>
                                {bookingSummary.description}
                            </span>
                        </div>
                    )}

                    <div style={{
                        borderTop: "2px solid #e1e5e9",
                        paddingTop: "15px",
                        marginTop: "20px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span>Subtotal:</span>
                            <span>LKR {bookingSummary.subtotal.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span>Tax (15%):</span>
                            <span>LKR {bookingSummary.tax.toLocaleString()}</span>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            color: "#1a73e8",
                            borderTop: "1px solid #e1e5e9",
                            paddingTop: "8px"
                        }}>
                            <span>Total:</span>
                            <span>LKR {bookingSummary.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "25px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ color: "#1a73e8", marginBottom: "20px", fontSize: "1.3rem" }}>
                        💳 Payment Details
                    </h3>

                    <form onSubmit={handlePaymentSubmit}>
                        {/* Card Number */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Card Number *
                            </label>
                            <input
                                type="text"
                                value={paymentForm.cardNumber}
                                onChange={(e) => setPaymentForm({...paymentForm, cardNumber: formatCardNumber(e.target.value)})}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                required
                            />
                        </div>

                        {/* Expiry Date and CVV */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                    Expiry Date *
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.expiryDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, expiryDate: formatExpiryDate(e.target.value)})}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "2px solid #e1e5e9",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        transition: "border-color 0.3s ease"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                    CVV *
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.cvv}
                                    onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '')})}
                                    placeholder="123"
                                    maxLength="4"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "2px solid #e1e5e9",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        transition: "border-color 0.3s ease"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                    required
                                />
                            </div>
                        </div>

                        {/* Cardholder Name */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Cardholder Name *
                            </label>
                            <input
                                type="text"
                                value={paymentForm.cardholderName}
                                onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                                placeholder="John Doe"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                required
                            />
                        </div>

                        {/* Payment Method */}
                        <div style={{ marginBottom: "25px" }}>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Payment Method
                            </label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            >
                                <option value="CARD">Credit/Debit Card</option>
                                <option value="ONLINE">Online Payment</option>
                            </select>
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button
                                type="button"
                                onClick={() => onNavigate('services')}
                                style={{
                                    padding: "14px 30px",
                                    border: "2px solid #6c757d",
                                    borderRadius: "8px",
                                    background: "white",
                                    color: "#6c757d",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                ← Back to Services
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: "14px 30px",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: loading ? "#6c757d" : "linear-gradient(135deg, #28a745, #20c997)",
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                                }}
                            >
                                {loading ? "Processing..." : `💳 Pay LKR ${bookingSummary.total.toLocaleString()}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Security Notice */}
            <div style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginTop: "20px",
                textAlign: "center"
            }}>
                <h4 style={{ color: "#495057", margin: "0 0 10px 0" }}>🔒 Secure Payment</h4>
                <p style={{ color: "#6c757d", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                    Your payment information is encrypted and secure. We use industry-standard
                    security measures to protect your financial data.
                </p>
            </div>
        </div>
    );
}