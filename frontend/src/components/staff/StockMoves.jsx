import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function StockMoves({ onNavigate }) {
    const [moves, setMoves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reference: ""
    });

    const loadMoves = async () => {
        setLoading(true);
        setErr("");
        try {
            let url = `${API_BASE}/api/inventory/moves?page=${page}&size=${size}`;
            
            // Add filters to URL
            const params = new URLSearchParams();
            if (filters.type) params.append("type", filters.type);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            if (filters.reference) params.append("reference", filters.reference);
            
            if (params.toString()) {
                url += "&" + params.toString();
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            setMoves(data.content || data);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setPage(0);
        loadMoves();
    };

    const clearFilters = () => {
        setFilters({ type: "", startDate: "", endDate: "", reference: "" });
        setPage(0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "RECEIVE": return "#28a745";
            case "ISSUE": return "#dc3545";
            case "ADJUST": return "#ffc107";
            default: return "#6c757d";
        }
    };

    const getQuantityDisplay = (quantity, type) => {
        const sign = quantity > 0 ? "+" : "";
        const color = quantity > 0 ? "#28a745" : "#dc3545";
        return (
            <span style={{ color, fontWeight: "bold" }}>
                {sign}{quantity}
            </span>
        );
    };

    useEffect(() => {
        loadMoves();
    }, [page]);

    return (
        <div style={{ 
            padding: "24px", 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
            maxWidth: 1400, 
            margin: "0 auto",
            backgroundColor: "#f8fafc",
            minHeight: "100vh"
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            {/* Header Section */}
            <div style={{ 
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                color: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: "2.5rem", 
                            fontWeight: "700",
                            background: "linear-gradient(45deg, #fff, #d1fae5)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            📊 Stock Movements
                        </h1>
                        <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                            Track all inventory movements and stock adjustments
                        </p>
                    </div>
                    <button 
                        onClick={() => onNavigate && onNavigate("inventory")}
                        style={{ 
                            padding: "12px 24px", 
                            background: "rgba(255,255,255,0.2)", 
                            color: "white", 
                            border: "2px solid rgba(255,255,255,0.3)", 
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            backdropFilter: "blur(10px)"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = "rgba(255,255,255,0.3)";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = "rgba(255,255,255,0.2)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        ← Back to Items
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "1.25rem", fontWeight: "600" }}>
                    🔍 Filter Movements
                </h3>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "20px",
                    alignItems: "end"
                }}>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Movement Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange("type", e.target.value)}
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#10b981"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                            <option value="">All Types</option>
                            <option value="RECEIVE">📥 Receive</option>
                            <option value="ISSUE">📤 Issue</option>
                            <option value="ADJUST">⚖️ Adjust</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#10b981"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#10b981"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Reference
                        </label>
                        <input
                            type="text"
                            value={filters.reference}
                            onChange={(e) => handleFilterChange("reference", e.target.value)}
                            placeholder="Booking ID, Job ID, etc."
                            style={{ 
                                width: "100%", 
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#10b981"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={applyFilters}
                            style={{ 
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
                                flex: 1
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(16, 185, 129, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(16, 185, 129, 0.3)";
                            }}
                        >
                            🔍 Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            style={{ 
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                flex: 1
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination Info */}
            {totalPages > 0 && (
                <div style={{ 
                    marginBottom: "24px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: "white",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    <span style={{ 
                        fontSize: "1rem", 
                        fontWeight: "500", 
                        color: "#374151" 
                    }}>
                        📄 Page {page + 1} of {totalPages}
                    </span>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            style={{ 
                                padding: "10px 20px", 
                                background: page === 0 ? "#f3f4f6" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                color: page === 0 ? "#9ca3af" : "white", 
                                border: "none", 
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                cursor: page === 0 ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                opacity: page === 0 ? 0.6 : 1
                            }}
                            onMouseOver={(e) => {
                                if (page !== 0) {
                                    e.target.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            style={{ 
                                padding: "10px 20px", 
                                background: page >= totalPages - 1 ? "#f3f4f6" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                color: page >= totalPages - 1 ? "#9ca3af" : "white", 
                                border: "none", 
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                opacity: page >= totalPages - 1 ? 0.6 : 1
                            }}
                            onMouseOver={(e) => {
                                if (page < totalPages - 1) {
                                    e.target.style.transform = "translateY(-1px)";
                                }
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                {loading ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            width: "50px", 
                            height: "50px", 
                            border: "4px solid #e2e8f0", 
                            borderTop: "4px solid #10b981", 
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
                            Loading stock movements...
                        </p>
                    </div>
                ) : err ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "3rem", 
                            marginBottom: "16px"
                        }}>⚠️</div>
                        <p style={{ 
                            color: "#dc2626", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            Error: {err}
                        </p>
                    </div>
                ) : moves.length === 0 ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "3rem", 
                            marginBottom: "16px"
                        }}>📊</div>
                        <p style={{ 
                            color: "#6b7280", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            No stock movements found matching your criteria.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ 
                            width: "100%", 
                            borderCollapse: "separate", 
                            borderSpacing: "0",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            <thead>
                                <tr style={{ 
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white"
                                }}>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>SKU</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reference</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Note</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moves.map((move, index) => (
                                    <tr 
                                        key={move.id}
                                        style={{ 
                                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                                            borderBottom: "1px solid #e2e8f0",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
                                        }}
                                    >
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#6b7280",
                                            fontSize: "0.9rem"
                                        }}>
                                            {formatDate(move.createdAt)}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "500", 
                                            color: "#374151"
                                        }}>
                                            {move.item?.name || "N/A"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b",
                                            fontFamily: "monospace"
                                        }}>
                                            {move.item?.sku || "N/A"}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <span style={{ 
                                                color: "white",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                background: getTypeColor(move.type),
                                                display: "inline-block"
                                            }}>
                                                {move.type === "RECEIVE" ? "📥" : move.type === "ISSUE" ? "📤" : "⚖️"} {move.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            {getQuantityDisplay(move.quantity, move.type)}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#6b7280",
                                            fontFamily: "monospace",
                                            fontSize: "0.9rem"
                                        }}>
                                            {move.reference || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#6b7280",
                                            fontSize: "0.9rem",
                                            maxWidth: "200px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {move.note || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#374151",
                                            fontWeight: "500"
                                        }}>
                                            {move.createdBy || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
