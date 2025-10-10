import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function InvoiceList({ onNavigate }) {
    const { token } = useAuth(); // Get the token
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({
        status: "",
        search: ""
    });

    const loadInvoices = async () => {
        setLoading(true);
        setErr("");
        try {
            let url = `${API_BASE}/api/billing/invoices?page=${page}&size=${size}`;

            if (filters.status) {
                url += `&status=${filters.status}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` } // Add authentication
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setInvoices(data.content || data);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/billing/summary`, {
                headers: { 'Authorization': `Bearer ${token}` } // Add authentication
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSummary(data);
        } catch (e) {
            console.error("Error loading summary:", e);
        }
    };

    const handleSearch = async () => {
        if (!filters.search.trim()) {
            await loadInvoices();
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/billing/invoices/search?q=${encodeURIComponent(filters.search)}`, {
                headers: { 'Authorization': `Bearer ${token}` } // Add authentication
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setInvoices(data);
            setTotalPages(0);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilter = async (status) => {
        setFilters(prev => ({ ...prev, status }));
        setPage(0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
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

    useEffect(() => {
        loadInvoices();
        loadSummary();
    }, [page, filters.status]);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1>Invoices</h1>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => onNavigate && onNavigate("finance-ledger")}
                        style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Finance Ledger
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate("home")}
                        style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 20,
                    marginBottom: 30
                }}>
                    <SummaryCard
                        title="Total Invoices"
                        value={summary.totalInvoices}
                        color="#007bff"
                        icon="📄"
                    />
                    <SummaryCard
                        title="Unpaid Invoices"
                        value={summary.unpaidInvoices}
                        color="#dc3545"
                        icon="⚠️"
                    />
                    <SummaryCard
                        title="Overdue Invoices"
                        value={summary.overdueInvoices}
                        color="#fd7e14"
                        icon="🚨"
                    />
                    <SummaryCard
                        title="Outstanding Balance"
                        value={formatCurrency(summary.totalOutstanding)}
                        color="#6f42c1"
                        icon="💰"
                    />
                    <SummaryCard
                        title="Monthly Revenue"
                        value={formatCurrency(summary.monthlyRevenue)}
                        color="#28a745"
                        icon="📈"
                    />
                </div>
            )}

            {/* Filters */}
            <div style={{
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 20,
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div>
                    <input
                        type="text"
                        placeholder="Search by invoice number or booking ID..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4, minWidth: 250 }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{ marginLeft: 8, padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Search
                    </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => handleStatusFilter("")}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: filters.status === "" ? "#007bff" : "#e9ecef",
                            color: filters.status === "" ? "white" : "black",
                            border: "none",
                            borderRadius: 4
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleStatusFilter("UNPAID")}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: filters.status === "UNPAID" ? "#dc3545" : "#e9ecef",
                            color: filters.status === "UNPAID" ? "white" : "black",
                            border: "none",
                            borderRadius: 4
                        }}
                    >
                        Unpaid
                    </button>
                    <button
                        onClick={() => handleStatusFilter("PARTIAL")}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: filters.status === "PARTIAL" ? "#ffc107" : "#e9ecef",
                            color: filters.status === "PARTIAL" ? "black" : "black",
                            border: "none",
                            borderRadius: 4
                        }}
                    >
                        Partial
                    </button>
                    <button
                        onClick={() => handleStatusFilter("PAID")}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: filters.status === "PAID" ? "#28a745" : "#e9ecef",
                            color: filters.status === "PAID" ? "white" : "black",
                            border: "none",
                            borderRadius: 4
                        }}
                    >
                        Paid
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            {totalPages > 0 && (
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Page {page + 1} of {totalPages}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: page === 0 ? "#e9ecef" : "#007bff",
                                color: page === 0 ? "#6c757d" : "white",
                                border: "none",
                                borderRadius: 4
                            }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: page >= totalPages - 1 ? "#e9ecef" : "#007bff",
                                color: page >= totalPages - 1 ? "#6c757d" : "white",
                                border: "none",
                                borderRadius: 4
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Loading invoices...</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : invoices.length === 0 ? (
                <p>No invoices found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>Invoice #</th>
                        <th>Booking ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td style={{ fontWeight: "bold" }}>{invoice.invoiceNumber}</td>
                            <td>{invoice.bookingId}</td>
                            <td>{formatDate(invoice.createdAt)}</td>
                            <td>{formatCurrency(invoice.totalAmount)}</td>
                            <td>{formatCurrency(invoice.paidAmount)}</td>
                            <td style={{
                                fontWeight: "bold",
                                color: invoice.balance > 0 ? "#dc3545" : "#28a745"
                            }}>
                                {formatCurrency(invoice.balance)}
                            </td>
                            <td>
                                <span style={{
                                    color: getStatusColor(invoice.status),
                                    fontWeight: "bold",
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    backgroundColor: getStatusColor(invoice.status) + "20"
                                }}>
                                    {getStatusIcon(invoice.status)} {invoice.status}
                                </span>
                            </td>
                            <td>
                                <button
                                    onClick={() => onNavigate && onNavigate(`invoice-detail-${invoice.id}`)}
                                    style={{ marginRight: 8, padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 3 }}
                                >
                                    View
                                </button>
                                {invoice.balance > 0 && (
                                    <button
                                        onClick={() => onNavigate && onNavigate(`payment-modal-${invoice.id}`)}
                                        style={{ padding: "4px 8px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 3 }}
                                    >
                                        Pay
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Summary Card Component
function SummaryCard({ title, value, color, icon }) {
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
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color, marginBottom: 5 }}>
                {value}
            </div>
            <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>{title}</div>
        </div>
    );
}