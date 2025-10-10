import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        customerId: null,
        plateNumber: "",
        make: "",
        model: "",
        yearOfManufacture: null,
        fuelType: "PETROL"
    });

    // Load vehicles and customers
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const [vehiclesRes, customersRes] = await Promise.all([
                fetch(`${API_BASE}/api/vehicles`),
                fetch(`${API_BASE}/api/customers`)
            ]);

            if (!vehiclesRes.ok) throw new Error(`HTTP ${vehiclesRes.status}`);
            if (!customersRes.ok) throw new Error(`HTTP ${customersRes.status}`);

            const [vehiclesData, customersData] = await Promise.all([
                vehiclesRes.json(),
                customersRes.json()
            ]);

            setVehicles(vehiclesData);
            setCustomers(customersData);
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
            [name]:
                name === "yearOfManufacture"
                    ? value !== "" ? Number(value) : null
                    : name === "customerId"
                        ? value !== "" ? Number(value) : null
                        : value
        }));
    };

    // Create or Update vehicle
    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.customerId) {
            setErr("Please select a customer.");
            return;
        }
        if (!form.plateNumber || form.plateNumber.trim() === "") {
            setErr("Plate number is required.");
            return;
        }

        try {
            const url = editId
                ? `${API_BASE}/api/vehicles/${editId}`
                : `${API_BASE}/api/vehicles`;
            const method = editId ? "PUT" : "POST";

            const body = {
                ...form,
                customerId: form.customerId,
                yearOfManufacture: form.yearOfManufacture || null
            };

            console.log("Submitting vehicle:", body);

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            // Reset form
            setForm({ customerId: null, plateNumber: "", make: "", model: "", yearOfManufacture: null, fuelType: "PETROL" });
            setEditId(null);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Delete vehicle
    const onDelete = async (id) => {
        if (!confirm(`Delete vehicle #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/vehicles/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    // Get customer name by ID
    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.fullName || customer.email : "Unknown";
    };

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading vehicles...</div>
            </div>
        );
    }
    if (err) {
        return (
            <div style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "15px",
                borderRadius: "12px",
                margin: "20px",
                textAlign: "center"
            }}>
                Error: {err}
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1 style={{ margin: 0, color: "#1a73e8" }}>Vehicle Management</h1>
                <button 
                    className="btn btn-primary"
                    onClick={load}
                >
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}>
                <div style={{
                    background: "linear-gradient(135deg, #1a73e8, #4285f4)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(26, 115, 232, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {vehicles.length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Total Vehicles</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #28a745, #20c997)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {customers.length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Total Customers</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #ff9800, #f57c00)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {vehicles.filter(v => v.fuelType === 'PETROL').length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Petrol Vehicles</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(156, 39, 176, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {vehicles.filter(v => v.fuelType === 'ELECTRIC').length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Electric Vehicles</div>
                </div>
            </div>

            {/* Create / Update Vehicle Form */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "30px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0"
            }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
                    {editId ? "Update Vehicle" : "Add New Vehicle"}
                </h3>
                
                <form onSubmit={onSubmit} style={{ 
                    display: "grid", 
                    gap: "15px", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    alignItems: "end"
                }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Customer
                        </label>
                        <select 
                            name="customerId" 
                            value={form.customerId ?? ""} 
                            onChange={onChange} 
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.fullName || c.email} (ID: {c.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Plate Number
                        </label>
                        <input
                            name="plateNumber"
                            placeholder="Plate Number"
                            value={form.plateNumber}
                            onChange={onChange}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Make
                        </label>
                        <input
                            name="make"
                            placeholder="Make (e.g., Toyota)"
                            value={form.make}
                            onChange={onChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Model
                        </label>
                        <input
                            name="model"
                            placeholder="Model (e.g., Corolla)"
                            value={form.model}
                            onChange={onChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Year
                        </label>
                        <input
                            name="yearOfManufacture"
                            type="number"
                            placeholder="Year"
                            value={form.yearOfManufacture ?? ""}
                            onChange={onChange}
                            min="1970"
                            max="2100"
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#555" }}>
                            Fuel Type
                        </label>
                        <select 
                            name="fuelType" 
                            value={form.fuelType} 
                            onChange={onChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                        >
                            <option value="PETROL">Petrol</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ELECTRIC">Electric</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                            type="submit"
                            style={{
                                background: editId ? "#ff9800" : "#28a745",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                        >
                            {editId ? "Save Update" : "Add Vehicle"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setForm({ customerId: null, plateNumber: "", make: "", model: "", yearOfManufacture: null, fuelType: "PETROL" });
                                }}
                                style={{
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Vehicles List */}
            {vehicles.length === 0 ? (
                <div style={{
                    background: "white",
                    padding: "40px",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "#666",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>🚗</div>
                    <h3 style={{ color: "#28a745", marginBottom: "10px" }}>No Vehicles Yet</h3>
                    <p>Start by adding your first vehicle using the form above.</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "20px"
                }}>
                    {vehicles.map((v) => (
                        <div
                            key={v.id}
                            style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                border: "2px solid #e0e0e0",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-3px)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                            }}
                        >
                            {/* Header */}
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                marginBottom: "15px"
                            }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    color: "#1a1a1a",
                                    fontSize: "18px",
                                    fontWeight: "600"
                                }}>
                                    Vehicle #{v.id}
                                </h3>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "15px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: v.fuelType === 'ELECTRIC' ? '#9c27b0' : 
                                                   v.fuelType === 'HYBRID' ? '#4caf50' :
                                                   v.fuelType === 'DIESEL' ? '#ff5722' : '#ff9800',
                                    color: "white"
                                }}>
                                    {v.fuelType}
                                </span>
                            </div>

                            {/* Vehicle Details */}
                            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Customer:</strong>
                                    <div style={{ marginTop: "2px" }}>
                                        {getCustomerName(v.customerId)}
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Plate Number:</strong>
                                    <div style={{ marginTop: "2px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold" }}>
                                        {v.plateNumber || "Not specified"}
                                    </div>
                                </div>

                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Make & Model:</strong>
                                    <div style={{ marginTop: "2px" }}>
                                        {v.make || "Unknown"} {v.model ? `- ${v.model}` : ""}
                                    </div>
                                </div>

                                {v.yearOfManufacture && (
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Year:</strong>
                                        <div style={{ marginTop: "2px" }}>
                                            {v.yearOfManufacture}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{
                                background: "#f8f9fa",
                                padding: "15px",
                                borderRadius: "8px",
                                border: "1px solid #dee2e6"
                            }}>
                                <div style={{ 
                                    fontSize: "12px", 
                                    fontWeight: "600", 
                                    color: "#666",
                                    marginBottom: "10px"
                                }}>
                                    ACTIONS:
                                </div>
                                
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => {
                                            setEditId(v.id);
                                            setForm({
                                                customerId: v.customerId ?? null,
                                                plateNumber: v.plateNumber || "",
                                                make: v.make || "",
                                                model: v.model || "",
                                                yearOfManufacture: v.yearOfManufacture ?? null,
                                                fuelType: v.fuelType || "PETROL"
                                            });
                                        }}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#007bff",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "#0056b3";
                                            e.target.style.transform = "translateY(-1px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "#007bff";
                                            e.target.style.transform = "translateY(0)";
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(v.id)}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#dc3545",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            transition: "all 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "#c82333";
                                            e.target.style.transform = "translateY(-1px)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "#dc3545";
                                            e.target.style.transform = "translateY(0)";
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
