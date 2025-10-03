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

    if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
    if (err) return <p style={{ color: "red", padding: 16 }}>Error: {err}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>Vehicles</h1>

            {/* Create / Update Vehicle Form */}
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, 1fr)", marginBottom: 16 }}>
                <select name="customerId" value={form.customerId ?? ""} onChange={onChange} required>
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.fullName || c.email} (ID: {c.id})
                        </option>
                    ))}
                </select>
                <input
                    name="plateNumber"
                    placeholder="Plate Number"
                    value={form.plateNumber}
                    onChange={onChange}
                    required
                />
                <input
                    name="make"
                    placeholder="Make (e.g., Toyota)"
                    value={form.make}
                    onChange={onChange}
                />
                <input
                    name="model"
                    placeholder="Model (e.g., Corolla)"
                    value={form.model}
                    onChange={onChange}
                />
                <input
                    name="yearOfManufacture"
                    type="number"
                    placeholder="Year"
                    value={form.yearOfManufacture ?? ""}
                    onChange={onChange}
                    min="1970"
                    max="2100"
                />
                <select name="fuelType" value={form.fuelType} onChange={onChange}>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric</option>
                </select>
                <button type="submit">{editId ? "Save Update" : "Add Vehicle"}</button>
                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setForm({ customerId: null, plateNumber: "", make: "", model: "", yearOfManufacture: null, fuelType: "PETROL" });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {vehicles.length === 0 ? (
                <p>No vehicles yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Plate Number</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Fuel Type</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vehicles.map((v) => (
                        <tr key={v.id}>
                            <td>{v.id}</td>
                            <td>{getCustomerName(v.customerId)}</td>
                            <td>{v.plateNumber || "-"}</td>
                            <td>{v.make || "-"}</td>
                            <td>{v.model || "-"}</td>
                            <td>{v.yearOfManufacture || "-"}</td>
                            <td>{v.fuelType || "-"}</td>
                            <td>
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
                                    style={{ marginRight: 8 }}
                                >
                                    Edit
                                </button>
                                <button onClick={() => onDelete(v.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
