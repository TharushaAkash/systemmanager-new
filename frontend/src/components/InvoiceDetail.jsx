import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function InvoiceDetail({ invoiceId, onNavigate }) {
    const { token } = useAuth(); // Get the token
    const [invoice, setInvoice] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const loadInvoice = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/billing/invoices/${invoiceId}`, {
                headers: { 'Authorization': `Bearer ${token}` } // Add authentication
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setInvoice(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadPayments = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/billing/payments/invoice/${invoiceId}`, {
                headers: { 'Authorization': `Bearer ${token}` } // Add authentication
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setPayments(data);
        } catch (e) {
            console.error("Error loading payments:", e);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PAID": return "#28a745";
            case "PARTIAL": return "#ffc107";
            case "UNPAID": return "#dc3545";
            default: return "#6c757d";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PAID": return "✅";
            case "PARTIAL": return "⚠️";
            case "UNPAID": return "❌";
            default: return "❓";
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case "CASH": return "💵";
            case "CARD": return "💳";
            case "ONLINE": return "🌐";
            default: return "💰";
        }
    };

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
            loadPayments();
        }
    }, [invoiceId]);

    if (loading) {
        return <div style={{ padding: 20 }}>Loading invoice...</div>;
    }

    if (err) {
        return <div style={{ padding: 20, color: "red" }}>Error: {err}</div>;
    }

    if (!invoice) {
        return <div style={{ padding: 20 }}>Invoice not found.</div>;
    }

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <div>
                    <h1>Invoice #{invoice.invoiceNumber}</h1>
                    <p style={{ color: "#6c757d", margin: 0 }}>
                        Booking ID: {invoice.bookingId} • Created: {formatDate(invoice.createdAt)}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={invoice.balance <= 0}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: invoice.balance > 0 ? "#28a745" : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: 4
                        }}
                    >
                        Record Payment
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate("invoices")}
                        style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Back to Invoices
                    </button>
                </div>
            </div>

            {/* Status and Balance */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 20,
                marginBottom: 30
            }}>
                <StatusCard
                    title="Status"
                    value={invoice.status}
                    color={getStatusColor(invoice.status)}
                    icon={getStatusIcon(invoice.status)}
                />
                <StatusCard
                    title="Total Amount"
                    value={formatCurrency(invoice.totalAmount)}
                    color="#007bff"
                    icon="💰"
                />
                <StatusCard
                    title="Paid Amount"
                    value={formatCurrency(invoice.paidAmount)}
                    color="#28a745"
                    icon="✅"
                />
                <StatusCard
                    title="Balance"
                    value={formatCurrency(invoice.balance)}
                    color={invoice.balance > 0 ? "#dc3545" : "#28a745"}
                    icon={invoice.balance > 0 ? "⚠️" : "✅"}
                />
            </div>

            {/* Invoice Lines */}
            <div style={{ marginBottom: 30 }}>
                <h2>Invoice Lines</h2>
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoice.invoiceLines && invoice.invoiceLines.length > 0 ? (
                        invoice.invoiceLines.map((line, index) => (
                            <tr key={index}>
                                <td>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        backgroundColor: line.type === "SERVICE" ? "#e3f2fd" : "#f3e5f5",
                                        fontSize: "12px",
                                        fontWeight: "bold"
                                    }}>
                                        {line.type}
                                    </span>
                                </td>
                                <td>{line.description}</td>
                                <td>{line.quantity}</td>
                                <td>{formatCurrency(line.unitPrice)}</td>
                                <td style={{ fontWeight: "bold" }}>{formatCurrency(line.lineTotal)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: "center", color: "#6c757d" }}>
                                No invoice lines found
                            </td>
                        </tr>
                    )}
                    </tbody>
                    <tfoot>
                    <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                        <td colSpan="4">Subtotal:</td>
                        <td>{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                        <td colSpan="4">Tax (15%):</td>
                        <td>{formatCurrency(invoice.taxAmount)}</td>
                    </tr>
                    <tr style={{ backgroundColor: "#e9ecef", fontWeight: "bold", fontSize: "1.1rem" }}>
                        <td colSpan="4">Total:</td>
                        <td>{formatCurrency(invoice.totalAmount)}</td>
                    </tr>
                    </tfoot>
                </table>
            </div>

            {/* Payment History */}
            <div>
                <h2>Payment History</h2>
                {payments.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {payments.map((payment) => (
                            <PaymentChip
                                key={payment.id}
                                payment={payment}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                getPaymentMethodIcon={getPaymentMethodIcon}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#6c757d" }}>No payments recorded yet.</p>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    invoice={invoice}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={() => {
                        setShowPaymentModal(false);
                        loadInvoice();
                        loadPayments();
                    }}
                    token={token} // Pass token to modal
                />
            )}
        </div>
    );
}

// Status Card Component
function StatusCard({ title, value, color, icon }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color, marginBottom: 5 }}>
                {value}
            </div>
            <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>{title}</div>
        </div>
    );
}

// Payment Chip Component
function PaymentChip({ payment, formatCurrency, formatDate, getPaymentMethodIcon }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            minWidth: 200
        }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "1.2rem", marginRight: 8 }}>
                    {getPaymentMethodIcon(payment.method)}
                </span>
                <span style={{ fontWeight: "bold" }}>
                    {formatCurrency(Math.abs(payment.amount))}
                </span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: 4 }}>
                {payment.method} • {formatDate(payment.createdAt)}
            </div>
            {payment.reference && (
                <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                    Ref: {payment.reference}
                </div>
            )}
        </div>
    );
}

// Payment Modal Component
function PaymentModal({ invoice, onClose, onSuccess, token }) {
    const [amount, setAmount] = useState(invoice.balance);
    const [method, setMethod] = useState("CASH");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/billing/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` // Add authentication
                },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    amount: amount,
                    method: method,
                    reference: reference,
                    notes: notes
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            onSuccess();
        } catch (e) {
            alert("Error recording payment: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                minWidth: 400,
                maxHeight: "80vh",
                overflow: "auto"
            }}>
                <h3>Record Payment</h3>
                <p>Invoice #{invoice.invoiceNumber} • Balance: {formatCurrency(invoice.balance)}</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Amount:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            required
                            min="0.01"
                            max={invoice.balance}
                            step="0.01"
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Payment Method:</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        >
                            <option value="CASH">💵 Cash</option>
                            <option value="CARD">💳 Card</option>
                            <option value="ONLINE">🌐 Online</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Reference/Txn ID:</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Transaction ID, check number, etc."
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                            rows="3"
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 4 }}
                        >
                            {loading ? "Processing..." : "Record Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}