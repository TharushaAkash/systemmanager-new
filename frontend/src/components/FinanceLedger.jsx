import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function FinanceLedger({ onNavigate }) {
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

    const loadEntries = async () => {
        setLoading(true);
        setErr("");
        try {
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

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            setEntries(data.content || data);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.from) params.append("from", filters.from);
            if (filters.to) params.append("to", filters.to);
            
            const url = `${API_BASE}/api/finance/ledger/summary?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSummary(data);
        } catch (e) {
            console.error("Error loading summary:", e);
        }
    };

    const loadAccounts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/finance/ledger/accounts`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
            const res = await fetch(url);
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
        loadEntries();
        loadSummary();
        loadAccounts();
    }, [page]);

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
                        title="Total Credits" 
                        value={formatCurrency(summary.totalCredits)}
                        color="#28a745"
                        icon="⬆️"
                    />
                    <SummaryCard 
                        title="Total Debits" 
                        value={formatCurrency(summary.totalDebits)}
                        color="#dc3545"
                        icon="⬇️"
                    />
                    <SummaryCard 
                        title="Net Amount" 
                        value={formatCurrency(summary.netAmount)}
                        color={summary.netAmount >= 0 ? "#28a745" : "#dc3545"}
                        icon="💰"
                    />
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
                <p style={{ color: "red" }}>Error: {err}</p>
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
