import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import InvoicePDFGenerator from "./InvoicePDFGenerator";

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
    const [showPDFGenerator, setShowPDFGenerator] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [customer, setCustomer] = useState(null);

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

    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/billing/invoices/${invoiceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let message = `Failed to delete invoice. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) message = errorData.message;
                } catch {}
                throw new Error(message);
            }

            // Refresh the invoice list
            await loadInvoices();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            setErr(err.message);
        }
    };


    const handleGeneratePDF = async (invoice) => {
        setSelectedInvoice(invoice);
        
        // Load customer data if available
        if (invoice.customerId) {
            try {
                const res = await fetch(`${API_BASE}/api/customers/${invoice.customerId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const customerData = await res.json();
                    setCustomer(customerData);
                }
            } catch (e) {
                console.error("Error loading customer:", e);
            }
        }
        
        setShowPDFGenerator(true);
    };

    const loadCustomer = async (customerId) => {
        try {
            const res = await fetch(`${API_BASE}/api/customers/${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const customerData = await res.json();
                setCustomer(customerData);
            }
        } catch (e) {
            console.error("Error loading customer:", e);
        }
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
        <div style={{ 
            padding: "20px", 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
            maxWidth: 1200, 
            margin: "0 auto",
            backgroundColor: "#f8fafc",
            minHeight: "100vh"
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            
            {/* Header Section */}
            <div style={{ 
                background: "white",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: "1.75rem", 
                            fontWeight: "600",
                            color: "#1f2937"
                        }}>
                            📄 Invoices
                        </h1>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                            Manage and track all invoices
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => onNavigate && onNavigate("finance-ledger")}
                            style={{ 
                                padding: "8px 16px", 
                                background: "#6366f1", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = "#5b21b6";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = "#6366f1";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            💰 Finance Ledger
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate("home")}
                            style={{ 
                                padding: "8px 16px", 
                                background: "#6b7280", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = "#4b5563";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = "#6b7280";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            🏠 Home
                    </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px"
                }}>
                    <SummaryCard
                        title="Total Invoices"
                        value={summary.totalInvoices}
                        color="#6366f1"
                        icon="📄"
                    />
                    <SummaryCard
                        title="Unpaid"
                        value={summary.unpaidInvoices}
                        color="#ef4444"
                        icon="⚠️"
                    />
                    <SummaryCard
                        title="Overdue"
                        value={summary.overdueInvoices}
                        color="#f59e0b"
                        icon="🚨"
                    />
                    <SummaryCard
                        title="Outstanding"
                        value={formatCurrency(summary.totalOutstanding)}
                        color="#8b5cf6"
                        icon="💰"
                    />
                    <SummaryCard
                        title="Revenue"
                        value={formatCurrency(summary.monthlyRevenue)}
                        color="#10b981"
                        icon="📈"
                    />
                </div>
            )}

            {/* Filters */}
            <div style={{
                background: "white",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb"
            }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#1f2937", fontSize: "1rem", fontWeight: "600" }}>
                    🔍 Search & Filter
                </h3>
                <div style={{
                display: "flex",
                    gap: "16px",
                    alignItems: "end",
                flexWrap: "wrap"
            }}>
                    <div style={{ flex: "1", minWidth: "250px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Search Invoices
                        </label>
                        <div style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Search by invoice number or booking ID..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px 8px 32px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "0.875rem",
                                    transition: "all 0.2s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                            />
                            <span style={{
                                position: "absolute",
                                left: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9ca3af",
                                fontSize: "0.875rem"
                            }}>
                                🔍
                            </span>
                        </div>
                    </div>
                    <div>
                    <button
                        onClick={handleSearch}
                            style={{
                                padding: "8px 16px",
                                background: "#6366f1",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.875rem",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = "#5b21b6";
                                e.target.style.transform = "translateY(-1px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = "#6366f1";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            🔍 Search
                    </button>
                </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Filter by Status
                        </label>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                        onClick={() => handleStatusFilter("")}
                        style={{
                                    padding: "6px 12px",
                                    background: filters.status === "" ? "#6366f1" : "#f3f4f6",
                                    color: filters.status === "" ? "white" : "#6b7280",
                            border: "none",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (filters.status !== "") {
                                        e.target.style.background = "#e5e7eb";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (filters.status !== "") {
                                        e.target.style.background = "#f3f4f6";
                                    }
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleStatusFilter("UNPAID")}
                        style={{
                                    padding: "6px 12px",
                                    background: filters.status === "UNPAID" ? "#ef4444" : "#f3f4f6",
                                    color: filters.status === "UNPAID" ? "white" : "#6b7280",
                            border: "none",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (filters.status !== "UNPAID") {
                                        e.target.style.background = "#e5e7eb";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (filters.status !== "UNPAID") {
                                        e.target.style.background = "#f3f4f6";
                                    }
                                }}
                            >
                                ❌ Unpaid
                    </button>
                    <button
                        onClick={() => handleStatusFilter("PARTIAL")}
                        style={{
                                    padding: "6px 12px",
                                    background: filters.status === "PARTIAL" ? "#f59e0b" : "#f3f4f6",
                                    color: filters.status === "PARTIAL" ? "white" : "#6b7280",
                            border: "none",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (filters.status !== "PARTIAL") {
                                        e.target.style.background = "#e5e7eb";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (filters.status !== "PARTIAL") {
                                        e.target.style.background = "#f3f4f6";
                                    }
                                }}
                            >
                                ⚠️ Partial
                    </button>
                    <button
                        onClick={() => handleStatusFilter("PAID")}
                        style={{
                                    padding: "6px 12px",
                                    background: filters.status === "PAID" ? "#10b981" : "#f3f4f6",
                                    color: filters.status === "PAID" ? "white" : "#6b7280",
                            border: "none",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    if (filters.status !== "PAID") {
                                        e.target.style.background = "#e5e7eb";
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (filters.status !== "PAID") {
                                        e.target.style.background = "#f3f4f6";
                                    }
                                }}
                            >
                                ✅ Paid
                    </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Info */}
            {totalPages > 0 && (
                <div style={{ 
                    background: "white",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <div style={{ 
                        color: "#6b7280", 
                        fontSize: "0.75rem", 
                        fontWeight: "500" 
                    }}>
                        Page {page + 1} of {totalPages}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            style={{
                                padding: "6px 12px",
                                background: page === 0 ? "#f3f4f6" : "#6366f1",
                                color: page === 0 ? "#9ca3af" : "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                cursor: page === 0 ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                opacity: page === 0 ? 0.6 : 1
                            }}
                            onMouseOver={(e) => {
                                if (page !== 0) {
                                    e.target.style.background = "#5b21b6";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (page !== 0) {
                                    e.target.style.background = "#6366f1";
                                }
                            }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            style={{
                                padding: "6px 12px",
                                background: page >= totalPages - 1 ? "#f3f4f6" : "#6366f1",
                                color: page >= totalPages - 1 ? "#9ca3af" : "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                opacity: page >= totalPages - 1 ? 0.6 : 1
                            }}
                            onMouseOver={(e) => {
                                if (page < totalPages - 1) {
                                    e.target.style.background = "#5b21b6";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (page < totalPages - 1) {
                                    e.target.style.background = "#6366f1";
                                }
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "60px 20px",
                    textAlign: "center",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ 
                        width: "50px", 
                        height: "50px", 
                        border: "4px solid #e2e8f0", 
                        borderTop: "4px solid #6366f1", 
                        borderRadius: "50%", 
                        animation: "spin 1s linear infinite",
                        marginBottom: "20px"
                    }}></div>
                    <p style={{ 
                        fontSize: "1.1rem", 
                        color: "#6b7280", 
                        margin: 0,
                        fontWeight: "500"
                    }}>
                        Loading invoices...
                    </p>
                </div>
            ) : err ? (
                <div style={{ 
                    padding: "20px", 
                    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", 
                    color: "#dc2626", 
                    marginBottom: "24px",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: "600", marginBottom: "4px" }}>Error Loading Invoices</div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>{err}</div>
                    </div>
                </div>
            ) : invoices.length === 0 ? (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "60px 20px",
                    textAlign: "center",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ 
                        fontSize: "4rem", 
                        marginBottom: "16px",
                        opacity: 0.6
                    }}>📄</div>
                    <p style={{ 
                        color: "#6b7280", 
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        margin: 0
                    }}>
                        No invoices found matching your criteria.
                    </p>
                </div>
            ) : (
                <div style={{ 
                    background: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb"
                }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ 
                            width: "100%", 
                            borderCollapse: "separate", 
                            borderSpacing: "0",
                            borderRadius: "6px",
                            overflow: "hidden"
                        }}>
                    <thead>
                                <tr style={{ 
                                    background: "#f8fafc",
                                    borderBottom: "1px solid #e5e7eb"
                                }}>
                                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Invoice #</th>
                                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Booking ID</th>
                                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</th>
                                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paid</th>
                                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Balance</th>
                                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                                {invoices.map((invoice, index) => (
                                    <tr 
                                        key={invoice.id}
                                        style={{ 
                                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                                            borderBottom: "1px solid #f3f4f6",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f9fafb";
                                        }}
                                    >
                                        <td style={{ 
                                            padding: "12px", 
                                            fontWeight: "600", 
                                            color: "#1f2937",
                                            fontFamily: "monospace",
                                            fontSize: "0.875rem"
                                        }}>
                                            #{invoice.invoiceNumber}
                                        </td>
                                        <td style={{ 
                                            padding: "12px", 
                                            color: "#6b7280",
                                            fontSize: "0.875rem"
                                        }}>
                                            {invoice.bookingId}
                                        </td>
                                        <td style={{ 
                                            padding: "12px", 
                                            color: "#6b7280",
                                            fontSize: "0.875rem"
                                        }}>
                                            {formatDate(invoice.createdAt)}
                                        </td>
                                        <td style={{ 
                                            padding: "12px", 
                                            textAlign: "right",
                                            fontWeight: "600", 
                                            color: "#1f2937",
                                            fontSize: "0.875rem"
                                        }}>
                                            {formatCurrency(invoice.totalAmount)}
                                        </td>
                                        <td style={{ 
                                            padding: "12px", 
                                            textAlign: "right",
                                            color: "#10b981",
                                            fontWeight: "500",
                                            fontSize: "0.875rem"
                                        }}>
                                            {formatCurrency(invoice.paidAmount)}
                                        </td>
                            <td style={{
                                            padding: "12px",
                                            textAlign: "right",
                                            fontWeight: "700",
                                            color: invoice.balance > 0 ? "#ef4444" : "#10b981",
                                            fontSize: "0.875rem"
                            }}>
                                {formatCurrency(invoice.balance)}
                            </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                <span style={{
                                                background: invoice.status === "PAID" ? "#f0fdf4" : 
                                                          invoice.status === "PARTIAL" ? "#fef3c7" : "#fef2f2",
                                                color: invoice.status === "PAID" ? "#166534" : 
                                                      invoice.status === "PARTIAL" ? "#92400e" : "#dc2626",
                                    padding: "4px 8px",
                                                borderRadius: "12px", 
                                                fontSize: "0.75rem",
                                                fontWeight: "500",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px"
                                }}>
                                    {getStatusIcon(invoice.status)} {invoice.status}
                                </span>
                            </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                                                <button
                                                    onClick={() => handleGeneratePDF(invoice)}
                                                    style={{ 
                                                        padding: "6px 10px", 
                                                        background: "#000000", 
                                                        color: "white", 
                                                        border: "2px solid #000000", 
                                                        borderRadius: "4px",
                                                        fontSize: "0.7rem",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.background = "#333333";
                                                        e.target.style.transform = "translateY(-1px)";
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.background = "#000000";
                                                        e.target.style.transform = "translateY(0)";
                                                    }}
                                                >
                                                    🖨️ Generate PDF
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                    style={{ 
                                                        padding: "6px 10px", 
                                                        background: "#ef4444", 
                                                        color: "white", 
                                                        border: "none", 
                                                        borderRadius: "4px",
                                                        fontSize: "0.7rem",
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.background = "#dc2626";
                                                        e.target.style.transform = "translateY(-1px)";
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.background = "#ef4444";
                                                        e.target.style.transform = "translateY(0)";
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                    </div>
                </div>
            )}

            {/* PDF Generator Modal */}
            {showPDFGenerator && selectedInvoice && (
                <InvoicePDFGenerator
                    invoice={selectedInvoice}
                    customer={customer}
                    companyInfo={{
                        name: "AutoFuel Lanka",
                        address: "123 Main Street, Colombo 03",
                        city: "Colombo, Sri Lanka",
                        phone: "+94 11 234 5678",
                        email: "info@autofuellanka.com"
                    }}
                    onClose={() => {
                        setShowPDFGenerator(false);
                        setSelectedInvoice(null);
                        setCustomer(null);
                    }}
                />
            )}
        </div>
    );
}

// Summary Card Component
function SummaryCard({ title, value, color, icon }) {
    return (
        <div style={{
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            transition: "all 0.2s ease",
            cursor: "pointer"
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            e.currentTarget.style.borderColor = color;
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            e.currentTarget.style.borderColor = "#e5e7eb";
        }}>
            <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: "8px"
            }}>
                <div style={{ 
                    fontSize: "1.25rem",
                    opacity: 0.8
                }}>
                    {icon}
                </div>
                <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: color
                }}></div>
            </div>
            
            <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "700", 
                color: "#1f2937",
                marginBottom: "4px",
                lineHeight: "1.2"
            }}>
                {value}
            </div>
            <div style={{ 
                color: "#6b7280", 
                fontSize: "0.75rem", 
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
            }}>
                {title}
            </div>
        </div>
    );
}