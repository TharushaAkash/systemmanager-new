import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function CustomerInvoices() {
    const { user, token } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Load customer invoices
    const loadInvoices = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/customers/${user.id}/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setInvoices(data);
        } catch (err) {
            console.error("Error loading invoices:", err);
            setError(`Failed to load invoices: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            loadInvoices();
        }
    }, [user, token]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
                return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
            case 'PENDING':
                return { backgroundColor: '#fff3cd', color: '#f57c00' };
            case 'OVERDUE':
                return { backgroundColor: '#ffeaea', color: '#d32f2f' };
            default:
                return { backgroundColor: '#e3f2fd', color: '#1976d2' };
        }
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const handleCloseModal = () => {
        setSelectedInvoice(null);
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h3>Loading your invoices...</h3>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: "20px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "5px",
                margin: "20px"
            }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                    🧾 My Invoices & Transactions
                </h2>
                <p style={{ color: "#7f8c8d" }}>
                    View all your past invoices and transaction history with AutoFuel Lanka.
                </p>
            </div>

            {invoices.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                    <h3>No invoices found</h3>
                    <p>You don't have any invoices yet. Your invoices will appear here after you make bookings and payments.</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Invoice #</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Date</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Description</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Amount</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                    <td style={{ padding: "12px", fontWeight: "600" }}>#{invoice.invoiceNumber || invoice.id}</td>
                                    <td style={{ padding: "12px" }}>{formatDate(invoice.invoiceDate)}</td>
                                    <td style={{ padding: "12px" }}>
                                        {invoice.description || 
                                         (invoice.bookingId ? `Booking #${invoice.bookingId}` : 'Service Invoice')}
                                    </td>
                                    <td style={{ padding: "12px", fontWeight: "600", color: "#2e7d32" }}>
                                        {formatCurrency(invoice.totalAmount)}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            ...getStatusColor(invoice.status)
                                        }}>
                                            {invoice.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <button
                                            onClick={() => handleViewInvoice(invoice)}
                                            style={{
                                                backgroundColor: "#007bff",
                                                color: "white",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
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
                        padding: "30px",
                        borderRadius: "8px",
                        maxWidth: "600px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflow: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ color: "#2c3e50", margin: 0 }}>Invoice Details</h3>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: "15px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>Invoice Number:</strong>
                                <span>#{selectedInvoice.invoiceNumber || selectedInvoice.id}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>Date:</strong>
                                <span>{formatDate(selectedInvoice.invoiceDate)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>Status:</strong>
                                <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    ...getStatusColor(selectedInvoice.status)
                                }}>
                                    {selectedInvoice.status || 'PENDING'}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <strong>Total Amount:</strong>
                                <span style={{ fontWeight: "600", color: "#2e7d32", fontSize: "18px" }}>
                                    {formatCurrency(selectedInvoice.totalAmount)}
                                </span>
                            </div>
                            {selectedInvoice.description && (
                                <div>
                                    <strong>Description:</strong>
                                    <p style={{ margin: "5px 0", color: "#7f8c8d" }}>{selectedInvoice.description}</p>
                                </div>
                            )}
                            {selectedInvoice.bookingId && (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <strong>Related Booking:</strong>
                                    <span>#{selectedInvoice.bookingId}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                            <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>Payment Information</h4>
                            <p style={{ margin: "0", color: "#7f8c8d", fontSize: "14px" }}>
                                {selectedInvoice.status === 'PAID' 
                                    ? 'This invoice has been paid successfully.'
                                    : 'Payment is pending. Please contact our office for payment instructions.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
