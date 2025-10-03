import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function Bookings() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filterCustomer, setFilterCustomer] = useState("");

    const [form, setForm] = useState({
        customerId: "",
        locationId: "",
        vehicleId: "",
        type: "SERVICE",
        startTime: "",
        endTime: "",
        serviceTypeId: "",
        status: "PENDING",
        fuelType: "",
        litersRequested: ""
    });

    // Load all necessary data
    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const requests = [
                fetch(`${API_BASE}/api/bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/customers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/vehicles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/service-types`),
                fetch(`${API_BASE}/api/locations`)
            ];

            const [bookingsRes, customersRes, vehiclesRes, serviceTypesRes, locationsRes] = await Promise.all(requests);
            
            // Check each response
            if (!bookingsRes.ok) {
                throw new Error(`Bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
            }
            if (!customersRes.ok) {
                throw new Error(`Customers: ${customersRes.status} ${customersRes.statusText}`);
            }
            if (!vehiclesRes.ok) {
                throw new Error(`Vehicles: ${vehiclesRes.status} ${vehiclesRes.statusText}`);
            }
            if (!serviceTypesRes.ok) {
                throw new Error(`Service Types: ${serviceTypesRes.status} ${serviceTypesRes.statusText}`);
            }
            if (!locationsRes.ok) {
                throw new Error(`Locations: ${locationsRes.status} ${locationsRes.statusText}`);
            }

            const [bookingsData, customersData, vehiclesData, serviceTypesData, locationsData] = await Promise.all([
                bookingsRes.json(),
                customersRes.json(),
                vehiclesRes.json(),
                serviceTypesRes.json(),
                locationsRes.json()
            ]);

            setBookings(bookingsData);
            setCustomers(customersData);
            setVehicles(vehiclesData);
            setServiceTypes(serviceTypesData);
            setLocations(locationsData);
        } catch (err) {
            console.error("Error loading data:", err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            loadData();
        }
    }, [user, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const url = editId 
                ? `${API_BASE}/api/bookings/${editId}`
                : `${API_BASE}/api/bookings`;
            
            const method = editId ? "PUT" : "POST";

            const requestBody = {
                customerId: Number(form.customerId),
                locationId: Number(form.locationId),
                vehicleId: Number(form.vehicleId),
                type: form.type,
                startTime: form.startTime,
                endTime: form.endTime,
                status: form.status,
                ...(form.serviceTypeId && { serviceTypeId: Number(form.serviceTypeId) }),
                ...(form.fuelType && { fuelType: form.fuelType }),
                ...(form.litersRequested && { litersRequested: Number(form.litersRequested) })
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Reset form and reload data
            setForm({
                customerId: "",
                locationId: "",
                vehicleId: "",
                type: "SERVICE",
                startTime: "",
                endTime: "",
                serviceTypeId: "",
                status: "PENDING",
                fuelType: "",
                litersRequested: ""
            });
            setEditId(null);
            setShowForm(false);
            await loadData();
        } catch (err) {
            console.error("Error submitting booking:", err);
            setError(`Failed to ${editId ? 'update' : 'create'} booking: ${err.message}`);
        }
    };

    const handleEdit = (booking) => {
        setEditId(booking.id);
        setForm({
            customerId: booking.customerId || "",
            locationId: booking.locationId || "",
            vehicleId: booking.vehicleId || "",
            type: booking.type || "SERVICE",
            startTime: booking.startTime || "",
            endTime: booking.endTime || "",
            serviceTypeId: booking.serviceTypeId || "",
            status: booking.status || "PENDING",
            fuelType: booking.fuelType || "",
            litersRequested: booking.litersRequested || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(`Are you sure you want to delete booking #${id}?`)) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/bookings/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await loadData();
        } catch (err) {
            console.error("Error deleting booking:", err);
            setError(`Failed to delete booking: ${err.message}`);
        }
    };

    const handleCancel = () => {
        setEditId(null);
        setShowForm(false);
        setForm({
            customerId: "",
            locationId: "",
            vehicleId: "",
            type: "SERVICE",
            startTime: "",
            endTime: "",
            serviceTypeId: "",
            status: "PENDING",
            fuelType: "",
            litersRequested: ""
        });
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        try {
            return new Date(dateTimeString).toLocaleString();
        } catch {
            return dateTimeString;
        }
    };

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.fullName : `Customer ${customerId}`;
    };

    const getLocationName = (locationId) => {
        const location = locations.find(l => l.id === locationId);
        return location ? location.name : `Location ${locationId}`;
    };

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}` : `Vehicle ${vehicleId}`;
    };

    const getServiceName = (serviceTypeId) => {
        const service = serviceTypes.find(s => s.id === serviceTypeId);
        return service ? service.name : `Service ${serviceTypeId}`;
    };

    // Filter bookings by customer
    const filteredBookings = filterCustomer 
        ? bookings.filter(booking => booking.customerId.toString() === filterCustomer)
        : bookings;

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Loading all bookings...</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>All Bookings</h1>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    + New Booking
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {/* Filter */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <label>Filter by Customer:</label>
                <select
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                    <option value="">All Customers</option>
                    {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {customer.fullName} ({customer.email})
                        </option>
                    ))}
                </select>
                {filterCustomer && (
                    <button
                        onClick={() => setFilterCustomer("")}
                        style={{
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Clear Filter
                    </button>
                )}
            </div>

            {/* Booking Form */}
            {showForm && (
                <div style={{
                    backgroundColor: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    border: "1px solid #dee2e6"
                }}>
                    <h3>{editId ? "Edit Booking" : "Create New Booking"}</h3>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                        <div>
                            <label>Customer *</label>
                            <select
                                name="customerId"
                                value={form.customerId}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.fullName} ({customer.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Location *</label>
                            <select
                                name="locationId"
                                value={form.locationId}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="">Select Location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} - {location.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Vehicle *</label>
                            <select
                                name="vehicleId"
                                value={form.vehicleId}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Booking Type *</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleInputChange}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="SERVICE">Service</option>
                                <option value="FUEL">Fuel</option>
                            </select>
                        </div>

                        <div>
                            <label>Start Time *</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            />
                        </div>

                        <div>
                            <label>End Time *</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleInputChange}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            />
                        </div>

                        {form.type === "SERVICE" && (
                            <div>
                                <label>Service Type</label>
                                <select
                                    name="serviceTypeId"
                                    value={form.serviceTypeId}
                                    onChange={handleInputChange}
                                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                                >
                                    <option value="">Select Service (Optional)</option>
                                    {serviceTypes.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name} - ${service.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {form.type === "FUEL" && (
                            <>
                                <div>
                                    <label>Fuel Type</label>
                                    <select
                                        name="fuelType"
                                        value={form.fuelType}
                                        onChange={handleInputChange}
                                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                                    >
                                        <option value="">Select Fuel Type</option>
                                        <option value="PETROL">Petrol</option>
                                        <option value="DIESEL">Diesel</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Liters Requested</label>
                                    <input
                                        type="number"
                                        name="litersRequested"
                                        value={form.litersRequested}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.1"
                                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label>Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInputChange}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                            >
                                {editId ? "Update Booking" : "Create Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                    <h3>No bookings found</h3>
                    <p>{filterCustomer ? "No bookings found for the selected customer." : "Click 'New Booking' to create your first booking."}</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        borderRadius: "5px",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>ID</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Customer</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Location</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Vehicle</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Type</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Service</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Start Time</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                    <td style={{ padding: "12px" }}>{booking.id}</td>
                                    <td style={{ padding: "12px" }}>{getCustomerName(booking.customerId)}</td>
                                    <td style={{ padding: "12px" }}>{getLocationName(booking.locationId)}</td>
                                    <td style={{ padding: "12px" }}>{getVehicleName(booking.vehicleId)}</td>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            backgroundColor: booking.type === "SERVICE" ? "#e3f2fd" : "#fff3e0",
                                            color: booking.type === "SERVICE" ? "#1976d2" : "#f57c00"
                                        }}>
                                            {booking.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        {booking.serviceTypeId ? getServiceName(booking.serviceTypeId) : 
                                         booking.fuelType ? `${booking.fuelType}${booking.litersRequested ? ` (${booking.litersRequested}L)` : ''}` : '-'}
                                    </td>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            backgroundColor: 
                                                booking.status === "COMPLETED" ? "#e8f5e8" :
                                                booking.status === "CANCELLED" ? "#ffeaea" :
                                                booking.status === "IN_PROGRESS" ? "#fff3cd" :
                                                "#e3f2fd",
                                            color: 
                                                booking.status === "COMPLETED" ? "#2e7d32" :
                                                booking.status === "CANCELLED" ? "#d32f2f" :
                                                booking.status === "IN_PROGRESS" ? "#f57c00" :
                                                "#1976d2"
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px" }}>{formatDateTime(booking.startTime)}</td>
                                    <td style={{ padding: "12px" }}>
                                        <button
                                            onClick={() => handleEdit(booking)}
                                            style={{
                                                backgroundColor: "#007bff",
                                                color: "white",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                marginRight: "8px",
                                                fontSize: "12px"
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(booking.id)}
                                            style={{
                                                backgroundColor: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
