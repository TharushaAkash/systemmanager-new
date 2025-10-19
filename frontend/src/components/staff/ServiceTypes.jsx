import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function ServiceTypes() {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        code: "",
        name: "",
        label: "",
        description: "",
        basePrice: 0,
        price: 0
    });

    // Load service types
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/service-types`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setServiceTypes(data);
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
        const { name, value } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: name === "basePrice" || name === "price" ? Number(value) || 0 : value 
        }));
    };

    // Create or Update service type
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editId ? `${API_BASE}/api/service-types/${editId}` : `${API_BASE}/api/service-types`;
            const method = editId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            setForm({ code: "", name: "", label: "", description: "", basePrice: 0, price: 0 });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete service type
    const onDelete = async (id) => {
        if (!confirm(`Delete service type #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/service-types/${id}`, { method: "DELETE" });
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
                background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
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
                    background: "linear-gradient(45deg, #fff, #fce7f3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    🔧 Service Types
                </h1>
                <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                    Manage service offerings and pricing
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
                    {editId ? "✏️ Edit Service Type" : "➕ Add New Service Type"}
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
                            Service Code *
                        </label>
                        <input
                            name="code"
                            placeholder="e.g., OIL_CHANGE, BRAKE_SERVICE"
                            value={form.code}
                            onChange={onChange}
                            required
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none",
                                fontFamily: "monospace"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
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
                            Service Name *
                        </label>
                        <input
                            name="name"
                            placeholder="e.g., Oil Change, Brake Service"
                            value={form.name}
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
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
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
                            Display Label
                        </label>
                        <input
                            name="label"
                            placeholder="e.g., Standard Oil Change"
                            value={form.label}
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
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                    </div>
                    
                    <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Description
                        </label>
                        <input
                            name="description"
                            placeholder="Detailed service description..."
                            value={form.description}
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
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
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
                            Base Price ($)
                        </label>
                        <input
                            name="basePrice"
                            type="number"
                            placeholder="0.00"
                            value={form.basePrice}
                            onChange={onChange}
                            min="0"
                            step="0.01"
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
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
                            Current Price ($)
                        </label>
                        <input
                            name="price"
                            type="number"
                            placeholder="0.00"
                            value={form.price}
                            onChange={onChange}
                            min="0"
                            step="0.01"
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#ec4899"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
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
                                background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(236, 72, 153, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(236, 72, 153, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(236, 72, 153, 0.3)";
                            }}
                        >
                            {editId ? "💾 Save Changes" : "➕ Add Service Type"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setForm({ code: "", name: "", label: "", description: "", basePrice: 0, price: 0 });
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
                        borderTop: "4px solid #ec4899", 
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
                        Loading service types...
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
                {serviceTypes.length === 0 ? (
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
                        }}>🔧</div>
                        <p style={{ 
                            color: "#6b7280", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            No service types found. Add your first service type above!
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
                                    background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                                    color: "white"
                                }}>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Code</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Label</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                                    <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Base Price</th>
                                    <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Price</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceTypes.map((st, index) => (
                                    <tr 
                                        key={st.id}
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
                                            color: "#ec4899",
                                            fontFamily: "monospace"
                                        }}>
                                            #{st.id}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b",
                                            fontFamily: "monospace",
                                            fontSize: "0.9rem"
                                        }}>
                                            {st.code || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b"
                                        }}>
                                            {st.name || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            color: "#374151",
                                            fontSize: "0.9rem"
                                        }}>
                                            {st.label || "-"}
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
                                            {st.description || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "right",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                            fontFamily: "monospace"
                                        }}>
                                            ${st.basePrice || 0}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "right",
                                            fontWeight: "700",
                                            color: "#059669",
                                            fontFamily: "monospace",
                                            fontSize: "1.1rem"
                                        }}>
                                            ${st.price || 0}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button
                                                    onClick={() => {
                                                        setEditId(st.id);
                                                        setForm({
                                                            code: st.code || "",
                                                            name: st.name || "",
                                                            label: st.label || "",
                                                            description: st.description || "",
                                                            basePrice: st.basePrice || 0,
                                                            price: st.price || 0
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
                                                    onClick={() => onDelete(st.id)}
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
