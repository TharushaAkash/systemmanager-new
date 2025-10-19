import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function FinanceLedger({ onNavigate }) {
    const { user, token, isAuthenticated, hasRole, logout } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [filters, setFilters] = useState({
        from: "",
        to: "",
        account: "",
        type: ""
    });

    // Debug function to check token
    const debugToken = () => {
        if (!token) {
            console.error("No token available");
            return;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error("Invalid token format");
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", payload);
            console.log("Token expires at:", new Date(payload.exp * 1000));
            console.log("User roles:", payload.roles || payload.role);
        } catch (e) {
            console.error("Error parsing token:", e);
        }
    };

    const loadEntries = async () => {
        setLoading(true);
        setErr("");
        try {
            if (!token) {
                throw new Error("No authentication token found. Please login again.");
            }

            debugToken(); // Debug token information

            let url = `${API_BASE}/api/finance/ledger?page=${page}&size=${size}`;

            // Add filters to URL
            const params = new URLSearchParams();
            if (filters.from) params.append("from", filters.from);
            if (filters.to) params.append("to", filters.to);
            if (filters.account) params.append("account", filters.account);
            if (filters.type) params.append("type", filters.type);

            if (params.toString()) {
                url += "&" + params.toString();
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.error("Authentication failed, redirecting to login");
                    // Clear the invalid token
                    if (logout) logout();
                    if (onNavigate) {
                        onNavigate('login');
                    }
                    throw new Error("Authentication failed. Please login again.");
                }
                if (res.status === 403) {
                    throw new Error("You don't have permission to access this resource.");
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            setEntries(data.content || data);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            console.error("Error loading entries:", e);
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            if (!token) {
                console.error("No authentication token found for summary");
                return;
            }

            const params = new URLSearchParams();
            if (filters.from) params.append("from", filters.from);
            if (filters.to) params.append("to", filters.to);

            const url = `${API_BASE}/api/finance/ledger/summary?${params.toString()}`;
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.error("Authentication failed for summary");
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            setSummary(data);
        } catch (e) {
            console.error("Error loading summary:", e);
        }
    };

    const loadAccounts = async () => {
        try {
            if (!token) {
                console.error("No authentication token found for accounts");
                return;
            }

            const res = await fetch(`${API_BASE}/api/finance/ledger/accounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                if (res.status === 401) {
                    console.error("Authentication failed for accounts");
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            setAccounts(data);
        } catch (e) {
            console.error("Error loading accounts:", e);
        }
    };

    const applyFilters = () => {
        setPage(0);
        loadEntries();
        loadSummary();
    };

    const clearFilters = () => {
        setFilters({ from: "", to: "", account: "", type: "" });
        setPage(0);
    };

    const exportCSV = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.from) params.append("from", filters.from);
            if (filters.to) params.append("to", filters.to);
            if (filters.account) params.append("account", filters.account);

            const url = `${API_BASE}/api/finance/ledger/export/csv?${params.toString()}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `finance_ledger_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            alert("Error exporting CSV: " + e.message);
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

    const getTypeColor = (type) => {
        return type === "CREDIT" ? "#28a745" : "#dc3545";
    };

    const getTypeIcon = (type) => {
        return type === "CREDIT" ? "⬆️" : "⬇️";
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            console.error("User not authenticated, redirecting to login");
            if (onNavigate) {
                onNavigate('login');
            }
            return;
        }

        // Check if user has required role
        if (!hasRole('ADMIN') && !hasRole('FINANCE')) {
            console.error("User doesn't have required role");
            return;
        }

        loadEntries();
        loadSummary();
        loadAccounts();
    }, [page, isAuthenticated]);

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                <h2>Authentication Required</h2>
                <p>Please login to access the Finance Ledger.</p>
                <button
                    onClick={() => onNavigate && onNavigate('login')}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    // Check if user has required role for finance access
    if (!hasRole('ADMIN') && !hasRole('FINANCE')) {
        return (
            <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to access the Finance Ledger.</p>
                <p>This feature requires <strong>FINANCE</strong> or <strong>ADMIN</strong> role.</p>
                <p>Your current role: <strong>{user?.role || 'Unknown'}</strong></p>
                <button
                    onClick={() => onNavigate && onNavigate('home')}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer"
                    }}
                >
                    Go to Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1>Finance Ledger</h1>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={exportCSV}
                        style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => onNavigate && onNavigate("invoices")}
                        style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Back to Invoices
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
                        title="Total Revenue"
                        value={formatCurrency(summary.totalCredits)}
                        color="#28a745"
                        icon="📈"
                    />
                    <SummaryCard
                        title="Inventory Expenses"
                        value={formatCurrency(summary.totalDebits)}
                        color="#dc3545"
                        icon="📦"
                    />
                    <SummaryCard
                        title="Net Income"
                        value={formatCurrency(summary.netAmount)}
                        color={summary.netAmount >= 0 ? "#28a745" : "#dc3545"}
                        icon="💰"
                    />
                    {summary.cashFlow !== undefined && (
                        <SummaryCard
                            title="Cash Flow"
                            value={formatCurrency(summary.cashFlow)}
                            color={summary.cashFlow >= 0 ? "#17a2b8" : "#fd7e14"}
                            icon="💵"
                        />
                    )}
                </div>
            )}

            {/* Account Balances */}
            {summary && summary.accountBalances && Object.keys(summary.accountBalances).length > 0 && (
                <div style={{ marginBottom: 30 }}>
                    <h2>Account Balances</h2>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 15
                    }}>
                        {Object.entries(summary.accountBalances).map(([account, balance]) => (
                            <AccountBalanceCard
                                key={account}
                                account={account}
                                balance={balance}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16
            }}>
                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>From Date</label>
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>To Date</label>
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Account</label>
                    <select
                        value={filters.account}
                        onChange={(e) => setFilters(prev => ({ ...prev, account: e.target.value }))}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    >
                        <option value="">All Accounts</option>
                        {accounts.map(account => (
                            <option key={account} value={account}>{account}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    >
                        <option value="">All Types</option>
                        <option value="CREDIT">Credit</option>
                        <option value="DEBIT">Debit</option>
                    </select>
                </div>

                <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
                    <button
                        onClick={applyFilters}
                        style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Clear
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
                <p>Loading ledger entries...</p>
            ) : err ? (
                <div style={{ color: "red", padding: 16, backgroundColor: "#f8d7da", borderRadius: 4 }}>
                    <h3>Error:</h3>
                    <p>{err}</p>
                    <button
                        onClick={loadEntries}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            marginTop: 10
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : entries.length === 0 ? (
                <p>No ledger entries found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th>Date</th>
                        <th>Account</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.id}>
                            <td>{formatDate(entry.transactionDate)}</td>
                            <td style={{ fontWeight: "bold" }}>{entry.account}</td>
                            <td>
                                <span style={{
                                    color: getTypeColor(entry.transactionType),
                                    fontWeight: "bold",
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    backgroundColor: getTypeColor(entry.transactionType) + "20"
                                }}>
                                    {getTypeIcon(entry.transactionType)} {entry.transactionType}
                                </span>
                            </td>
                            <td style={{
                                fontWeight: "bold",
                                color: getTypeColor(entry.transactionType)
                            }}>
                                {formatCurrency(entry.amount)}
                            </td>
                            <td>{entry.reference || "-"}</td>
                            <td>{entry.description || "-"}</td>
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

// Account Balance Card Component
function AccountBalanceCard({ account, balance, formatCurrency }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: 5 }}>
                {account.replace(/_/g, " ")}
            </div>
            <div style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: balance >= 0 ? "#28a745" : "#dc3545"
            }}>
                {formatCurrency(balance)}
            </div>
        </div>
    );
}