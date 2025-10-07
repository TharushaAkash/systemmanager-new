import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "CUSTOMER",
        enabled: true
    });

    // Load customers
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/customers`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCustomers(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: type === "checkbox" ? checked : value 
        }));
    };

    // Create or Update customer
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/customers/${editId}` : `${API_BASE}/api/customers`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ fullName: "", email: "", phone: "", address: "", role: "CUSTOMER", enabled: true });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete customer
    const onDelete = async (id) => {
        if (!confirm(`Delete customer #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/customers/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

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
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                color: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: "2.5rem", 
                    fontWeight: "700",
                    background: "linear-gradient(45deg, #fff, #fef3c7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    👥 Customers
                </h1>
                <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                    Manage customer information and user accounts
                </p>
            </div>

            {/* Form Section */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "1.25rem", fontWeight: "600" }}>
                    {editId ? "✏️ Edit Customer" : "➕ Add New Customer"}
                </h3>
                
                <form onSubmit={onSubmit} style={{ 
                    display: "grid", 
                    gap: "20px", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
                }}>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Full Name *
                        </label>
                        <input
                            name="fullName"
                            placeholder="Enter full name"
                            value={form.fullName}
                            onChange={onChange}
                            required
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
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
                            Email *
                        </label>
                        <input
                            name="email"
                            type="email"
                            placeholder="customer@example.com"
                            value={form.email}
                            onChange={onChange}
                            required
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
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
                            Phone
                        </label>
                        <input
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            value={form.phone}
                            onChange={onChange}
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
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
                            Address
                        </label>
                        <input
                            name="address"
                            placeholder="123 Main St, City, State"
                            value={form.address}
                            onChange={onChange}
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
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
                            Role
                        </label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={onChange}
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
                            onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                            <option value="CUSTOMER">👤 CUSTOMER</option>
                        </select>
                    </div>
                    
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "12px",
                        padding: "12px 0"
                    }}>
                        <input
                            name="enabled"
                            type="checkbox"
                            checked={form.enabled}
                            onChange={onChange}
                            style={{ 
                                transform: "scale(1.3)",
                                cursor: "pointer"
                            }}
                        />
                        <label style={{ 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "1rem",
                            cursor: "pointer"
                        }}>
                            ✅ Account Enabled
                        </label>
                    </div>
                    
                    <div style={{ 
                        gridColumn: "1 / -1", 
                        display: "flex", 
                        gap: "12px", 
                        justifyContent: "flex-end",
                        marginTop: "10px"
                    }}>
                        <button 
                            type="submit"
                            style={{ 
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(245, 158, 11, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(245, 158, 11, 0.3)";
                            }}
                        >
                            {editId ? "💾 Save Changes" : "➕ Add Customer"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setForm({ fullName: "", email: "", phone: "", address: "", role: "CUSTOMER", enabled: true });
                                }}
                                style={{ 
                                    padding: "12px 24px", 
                                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                }}
                            >
                                ❌ Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

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
                        borderTop: "4px solid #f59e0b", 
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
                        Loading customers...
                    </p>
                </div>
            ) : err ? (
                <div style={{ 
                    padding: "16px", 
                    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", 
                    color: "#dc2626", 
                    marginBottom: "24px",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                    <span style={{ fontWeight: "500" }}>Error: {err}</span>
                </div>
            ) : null}

            {/* Content Area */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                {customers.length === 0 ? (
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
                        }}>👥</div>
                        <p style={{ 
                            color: "#6b7280", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            No customers found. Add your first customer above!
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
                                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    color: "white"
                                }}>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c, index) => (
                                    <tr 
                                        key={c.id}
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
                                            fontWeight: "600", 
                                            color: "#f59e0b",
                                            fontFamily: "monospace"
                                        }}>
                                            #{c.id}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b"
                                        }}>
                                            {c.fullName || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#374151",
                                            fontFamily: "monospace",
                                            fontSize: "0.9rem"
                                        }}>
                                            {c.email || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#6b7280",
                                            fontSize: "0.9rem"
                                        }}>
                                            {c.phone || "-"}
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
                                            {c.address || "-"}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <span style={{ 
                                                background: c.role === "ADMIN" ? "#fef2f2" : 
                                                          c.role === "STAFF" ? "#eff6ff" : "#f0fdf4",
                                                color: c.role === "ADMIN" ? "#dc2626" : 
                                                      c.role === "STAFF" ? "#1d4ed8" : "#166534",
                                                padding: "4px 12px", 
                                                borderRadius: "20px", 
                                                fontSize: "0.75rem",
                                                fontWeight: "600"
                                            }}>
                                                {c.role === "ADMIN" ? "👑" : 
                                                 c.role === "STAFF" ? "👨‍💼" : "👤"} {c.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <span style={{ 
                                                color: c.enabled ? "#059669" : "#dc2626",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                background: c.enabled ? "#f0fdf4" : "#fef2f2",
                                                border: `1px solid ${c.enabled ? "#bbf7d0" : "#fecaca"}`
                                            }}>
                                                {c.enabled ? "✅ Active" : "❌ Inactive"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button
                                                    onClick={() => {
                                                        setEditId(c.id);
                                                        setForm({
                                                            fullName: c.fullName || "",
                                                            email: c.email || "",
                                                            phone: c.phone || "",
                                                            address: c.address || "",
                                                            role: c.role || "CUSTOMER",
                                                            enabled: c.enabled !== false
                                                        });
                                                    }}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                                        color: "white", 
                                                        border: "none", 
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(c.id)}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                                        color: "white", 
                                                        border: "none", 
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
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
                )}
            </div>
        </div>
    );
}
