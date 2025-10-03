import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function MyVehicles({ onNavigate }) {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        plateNumber: "",
        registrationNo: "",
        make: "",
        model: "",
        yearOfManufacture: "",
        fuelType: "PETROL"
    });

    const loadVehicles = async () => {
        if (!user || !token) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setVehicles(data || []);
        } catch (e) {
            console.error("Error loading vehicles:", e);
            setError(`Failed to load vehicles: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) loadVehicles();
    }, [user, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "yearOfManufacture" ? value : value
        }));
    };

    const validateForm = () => {
        if (!form.plateNumber.trim()) return "Plate Number is required";
        if (!form.registrationNo.trim()) return "Registration Number is required";
        if (!form.make.trim()) return "Make is required";
        if (!form.fuelType) return "Fuel Type is required";
        if (form.yearOfManufacture && (form.yearOfManufacture < 1970 || form.yearOfManufacture > new Date().getFullYear() + 1)) {
            return "Year must be between 1970 and " + (new Date().getFullYear() + 1);
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const url = editingVehicle ? `${API_BASE}/api/vehicles/${editingVehicle.id}` : `${API_BASE}/api/vehicles`;
            const method = editingVehicle ? "PUT" : "POST";

            const body = {
                ...form,
                customerId: user.id,
                ownerId: user.id,
                yearOfManufacture: form.yearOfManufacture ? parseInt(form.yearOfManufacture) : null
            };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }

            setSuccess(editingVehicle ? "Vehicle updated successfully!" : "Vehicle added successfully!");
            setForm({ plateNumber: "", registrationNo: "", make: "", model: "", yearOfManufacture: "", fuelType: "PETROL" });
            setEditingVehicle(null);
            setShowForm(false);
            await loadVehicles();
        } catch (e) {
            console.error("Error saving vehicle:", e);
            setError(`Failed to ${editingVehicle ? 'update' : 'add'} vehicle: ${e.message}`);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm({
            plateNumber: vehicle.plateNumber || "",
            registrationNo: vehicle.registrationNo || "",
            make: vehicle.make || "",
            model: vehicle.model || "",
            yearOfManufacture: vehicle.yearOfManufacture || "",
            fuelType: vehicle.fuelType || "PETROL"
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(`Are you sure you want to delete this vehicle?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setSuccess("Vehicle deleted successfully!");
            await loadVehicles();
        } catch (e) {
            console.error("Error deleting vehicle:", e);
            setError(`Failed to delete vehicle: ${e.message}`);
        }
    };

    const handleCancel = () => {
        setForm({ plateNumber: "", registrationNo: "", make: "", model: "", yearOfManufacture: "", fuelType: "PETROL" });
        setEditingVehicle(null);
        setShowForm(false);
        setError("");
    };

    const getFuelTypeIcon = (fuelType) => {
        switch (fuelType) {
            case "PETROL": return "⛽";
            case "DIESEL": return "🛢️";
            case "HYBRID": return "🔋";
            case "ELECTRIC": return "⚡";
            default: return "🚗";
        }
    };

    const getFuelTypeColor = (fuelType) => {
        switch (fuelType) {
            case "PETROL": return "#ff6b35";
            case "DIESEL": return "#2c3e50";
            case "HYBRID": return "#27ae60";
            case "ELECTRIC": return "#3498db";
            default: return "#95a5a6";
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>🚗</div>
                <h2 style={{ color: "#666" }}>Loading your vehicles...</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ color: "#1a73e8", margin: "0 0 10px 0", fontSize: "2rem", fontWeight: "700" }}>
                    My Vehicles
                </h2>
                <p style={{ color: "#666", margin: 0 }}>Manage your registered vehicles and their information</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>{error}</div>
            )}

            {success && (
                <div style={{
                    background: "#e8f5e8",
                    color: "#2e7d32",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>{success}</div>
            )}

            {/* Quick Actions */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "center"
            }}>
                <h3 style={{ color: "#1a73e8", marginBottom: "15px" }}>Quick Actions</h3>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: "12px 30px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        backgroundColor: "#1a73e8",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "10px"
                    }}
                >
                    ➕ Add New Vehicle
                </button>
                <button
                    onClick={() => onNavigate('services')}
                    style={{
                        padding: "12px 30px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    📅 Book Service
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "25px",
                    marginBottom: "25px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ color: "#1a73e8", marginBottom: "20px" }}>
                        {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Plate Number *</label>
                                <input
                                    type="text"
                                    name="plateNumber"
                                    value={form.plateNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., ABC-1234"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Registration Number *</label>
                                <input
                                    type="text"
                                    name="registrationNo"
                                    value={form.registrationNo}
                                    onChange={handleInputChange}
                                    placeholder="e.g., REG123456"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Make *</label>
                                <input
                                    type="text"
                                    name="make"
                                    value={form.make}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Toyota"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={form.model}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Corolla"
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Year of Manufacture</label>
                                <input
                                    type="number"
                                    name="yearOfManufacture"
                                    value={form.yearOfManufacture}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2020"
                                    min="1970"
                                    max={new Date().getFullYear() + 1}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Fuel Type *</label>
                                <select
                                    name="fuelType"
                                    value={form.fuelType}
                                    onChange={handleInputChange}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                >
                                    <option value="PETROL">⛽ Petrol</option>
                                    <option value="DIESEL">🛢️ Diesel</option>
                                    <option value="HYBRID">🔋 Hybrid</option>
                                    <option value="ELECTRIC">⚡ Electric</option>
                </select>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    padding: "10px 20px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    background: "white",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    backgroundColor: "#1a73e8",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                            </button>
                        </div>
            </form>
                </div>
            )}

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
                    <h3 style={{ color: "#666", marginBottom: "10px" }}>No Vehicles Registered</h3>
                    <p>You haven't registered any vehicles yet. Add your first vehicle to get started!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            marginTop: "15px",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            backgroundColor: "#1a73e8",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Add Your First Vehicle
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                cursor: "pointer"
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
                            {/* Vehicle Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px", fontWeight: "600" }}>
                                    {vehicle.make} {vehicle.model}
                                </h3>
                                <div style={{
                                    background: getFuelTypeColor(vehicle.fuelType),
                                    color: "white",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    {getFuelTypeIcon(vehicle.fuelType)} {vehicle.fuelType}
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Plate Number:</strong>
                                    <div style={{ marginTop: "2px", fontFamily: "monospace", fontSize: "16px", fontWeight: "600" }}>
                                        {vehicle.plateNumber || "Not specified"}
                                    </div>
                                </div>
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Registration:</strong>
                                    <div style={{ marginTop: "2px" }}>{vehicle.registrationNo || "Not specified"}</div>
                                </div>
                                {vehicle.yearOfManufacture && (
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Year:</strong>
                                        <div style={{ marginTop: "2px" }}>{vehicle.yearOfManufacture}</div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <button
                                    onClick={() => handleEdit(vehicle)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        backgroundColor: "#1a73e8",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(vehicle.id)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                                <button
                                    onClick={() => onNavigate('services')}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: "500"
                                    }}
                                >
                                    📅 Book Service
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
