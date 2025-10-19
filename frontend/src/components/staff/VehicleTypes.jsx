import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function VehicleTypes() {
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMake, setSelectedMake] = useState("");
    const [selectedFuelType, setSelectedFuelType] = useState("");
    const [makes, setMakes] = useState([]);

    const [form, setForm] = useState({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        fuelType: "PETROL",
        engineCapacity: null,
        transmission: null,
        description: null
    });

    const fuelTypes = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
    const transmissions = ["MANUAL", "AUTOMATIC"];

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicleTypes(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadMakes = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/makes`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setMakes(data);
        } catch (e) {
            console.error("Error loading makes:", e);
        }
    };

    useEffect(() => {
        load();
        loadMakes();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({
            ...f,
            [name]: name === "year" ? (value !== "" ? Number(value) : null)
                : value !== "" ? value : null
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        // Validation
        if (!form.make || !form.model || !form.fuelType || !form.year) {
            setErr("Make, Model, Fuel Type, and Year are required.");
            return;
        }

        try {
            const url = editId ? `${API_BASE}/api/vehicle-types/${editId}` : `${API_BASE}/api/vehicle-types`;
            const method = editId ? "PUT" : "POST";

            const payload = { ...form };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                setErr(text || `HTTP ${res.status}`);
                return;
            }

            // Reset form
            setForm({
                make: "",
                model: "",
                year: new Date().getFullYear(),
                fuelType: "PETROL",
                engineCapacity: null,
                transmission: null,
                description: null
            });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    const onDelete = async (id) => {
        if (!confirm(`Delete vehicle type #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/vehicle-types/${id}`, { method: "DELETE" });
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
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
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
                    background: "linear-gradient(45deg, #fff, #e9d5ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    🚗 Vehicle Types
                </h1>
                <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                    Manage vehicle makes, models, and specifications
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
                    {editId ? "✏️ Edit Vehicle Type" : "➕ Add New Vehicle Type"}
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
                            Make *
                        </label>
                        <input 
                            name="make" 
                            placeholder="e.g., Toyota, Honda, BMW" 
                            value={form.make || ""} 
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
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
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
                            Model *
                        </label>
                        <input 
                            name="model" 
                            placeholder="e.g., Camry, Civic, X5" 
                            value={form.model || ""} 
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
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
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
                            Year *
                        </label>
                        <input 
                            name="year" 
                            type="number" 
                            placeholder="2024" 
                            value={form.year || ""} 
                            onChange={onChange} 
                            required 
                            min="1900" 
                            max="2030" 
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
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
                            Fuel Type *
                        </label>
                        <select 
                            name="fuelType" 
                            value={form.fuelType || ""} 
                            onChange={onChange} 
                            required
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
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
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
                            Engine Capacity
                        </label>
                        <input 
                            name="engineCapacity" 
                            placeholder="e.g., 2.0L, 3.5L" 
                            value={form.engineCapacity || ""} 
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
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
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
                            Transmission
                        </label>
                        <select 
                            name="transmission" 
                            value={form.transmission || ""} 
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
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                            <option value="">Select Transmission</option>
                    {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
                        <textarea 
                            name="description" 
                            placeholder="Additional vehicle details..." 
                            value={form.description || ""} 
                            onChange={onChange} 
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                transition: "all 0.3s ease",
                                outline: "none",
                                minHeight: "100px",
                                resize: "vertical"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
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
                                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(139, 92, 246, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(139, 92, 246, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(139, 92, 246, 0.3)";
                            }}
                        >
                            {editId ? "💾 Update Vehicle" : "➕ Add Vehicle"}
                        </button>
                        {editId && (
                            <button 
                                type="button" 
                                onClick={() => { 
                                    setEditId(null); 
                                    setForm({ 
                                        make: "", 
                                        model: "", 
                                        year: new Date().getFullYear(), 
                                        fuelType: "PETROL", 
                                        engineCapacity: null, 
                                        transmission: null, 
                                        description: null 
                                    }); 
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

            {err && (
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
                    <span style={{ fontWeight: "500" }}>{err}</span>
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
                            borderTop: "4px solid #8b5cf6", 
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
                            Loading vehicle types...
                        </p>
                    </div>
                ) : vehicleTypes.length === 0 ? (
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
                        }}>🚗</div>
                        <p style={{ 
                            color: "#6b7280", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            No vehicle types found. Add your first vehicle type above!
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
                                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                                    color: "white"
                                }}>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Make</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Model</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Year</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fuel Type</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Engine</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Transmission</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                                {vehicleTypes.map((type, index) => (
                                    <tr 
                                        key={type.id}
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
                                            color: "#8b5cf6",
                                            fontFamily: "monospace"
                                        }}>
                                            #{type.id}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b"
                                        }}>
                                            {type.make}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "500", 
                                            color: "#374151"
                                        }}>
                                            {type.model}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "center",
                                            color: "#6b7280",
                                            fontWeight: "500"
                                        }}>
                                            {type.year}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <span style={{ 
                                                background: type.fuelType === "ELECTRIC" ? "#dcfce7" : 
                                                          type.fuelType === "HYBRID" ? "#fef3c7" : 
                                                          type.fuelType === "DIESEL" ? "#dbeafe" : "#fef2f2",
                                                color: type.fuelType === "ELECTRIC" ? "#166534" : 
                                                      type.fuelType === "HYBRID" ? "#92400e" : 
                                                      type.fuelType === "DIESEL" ? "#1e40af" : "#dc2626",
                                                padding: "4px 12px", 
                                                borderRadius: "20px", 
                                                fontSize: "0.75rem",
                                                fontWeight: "600"
                                            }}>
                                                {type.fuelType === "ELECTRIC" ? "⚡" : 
                                                 type.fuelType === "HYBRID" ? "🔋" : 
                                                 type.fuelType === "DIESEL" ? "⛽" : "🔥"} {type.fuelType}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "center",
                                            color: "#6b7280",
                                            fontFamily: "monospace"
                                        }}>
                                            {type.engineCapacity || "-"}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "center",
                                            color: "#6b7280"
                                        }}>
                                            {type.transmission || "-"}
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
                                            {type.description || "-"}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button 
                                                    onClick={() => {
                                                        setEditId(type.id);
                                                        setForm({ 
                                                            make: type.make, 
                                                            model: type.model, 
                                                            year: type.year, 
                                                            fuelType: type.fuelType, 
                                                            engineCapacity: type.engineCapacity || null, 
                                                            transmission: type.transmission || null, 
                                                            description: type.description || null 
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
                                                    onClick={() => onDelete(type.id)}
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
