import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function CustomerMyBookings({ onNavigate }) {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingBooking, setEditingBooking] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [editForm, setEditForm] = useState({
        vehicleId: "",
        locationId: "",
        serviceType: "",
        preferredDate: "",
        preferredTime: "",
        description: "",
        urgency: "NORMAL"
    });

    const loadData = async () => {
        setLoading(true);
        setError("");
        console.log("Loading data for user:", user, "with token:", token ? "present" : "missing");
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/customers/${user.id}/bookings`, { headers }),
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, { headers }),
                fetch(`${API_BASE}/api/locations`, { headers })
            ];
            const [bookingsRes, vehiclesRes, locationsRes] = await Promise.all(requests);

            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                console.log("Bookings loaded:", bookingsData);
                setBookings(bookingsData || []);
            } else {
                console.error("Failed to load bookings:", bookingsRes.status, await bookingsRes.text());
            }

            if (vehiclesRes.ok) {
                const vehiclesData = await vehiclesRes.json();
                setVehicles(vehiclesData || []);
            }

            if (locationsRes.ok) {
                const locationsData = await locationsRes.json();
                setLocations(locationsData || []);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditBooking = (booking) => {
        if (booking.status === "CONFIRMED") {
            setError("Cannot edit confirmed bookings. Please contact support for changes.");
            return;
        }

        console.log("Editing booking:", booking); // Debug log
        
        setEditingBooking(booking);
        
        // Parse the startTime properly - handle both ISO format and MySQL format
        let dateValue = "";
        let timeValue = "";
        
        if (booking.startTime) {
            // Handle both "2025-10-07T09:00:00" and "2025-10-07 09:00:00" formats
            const timeStr = booking.startTime.replace(" ", "T");
            const dateTime = new Date(timeStr);
            
            if (!isNaN(dateTime.getTime())) {
                dateValue = dateTime.toISOString().split("T")[0];
                timeValue = dateTime.toTimeString().substring(0, 5);
            }
        }
        
        setEditForm({
            vehicleId: booking.vehicleId ? booking.vehicleId.toString() : "",
            locationId: booking.locationId ? booking.locationId.toString() : "",
            serviceType: booking.serviceName || booking.serviceType || "",
            preferredDate: dateValue,
            preferredTime: timeValue,
            description: booking.description || "",
            urgency: booking.urgency || "NORMAL"
        });
        
        console.log("Form populated with:", {
            vehicleId: booking.vehicleId ? booking.vehicleId.toString() : "",
            locationId: booking.locationId ? booking.locationId.toString() : "",
            preferredDate: dateValue,
            preferredTime: timeValue,
            description: booking.description || "",
            urgency: booking.urgency || "NORMAL"
        }); // Debug log
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const startHour = parseInt(editForm.preferredTime.split(":")[0], 10);
            const endHour = startHour + 2;

            const updateData = {
                customerId: user.id, // include customer ID
                vehicleId: parseInt(editForm.vehicleId),
                locationId: parseInt(editForm.locationId),
                type: "SERVICE",
                serviceTypeId: editingBooking.serviceTypeId, // Include serviceTypeId for SERVICE bookings
                startTime: `${editForm.preferredDate}T${editForm.preferredTime}:00`,
                endTime: `${editForm.preferredDate}T${endHour.toString().padStart(2, "0")}:${editForm.preferredTime.split(":")[1]}:00`,
                description: editForm.description,
                urgency: editForm.urgency
            };

            const response = await fetch(`${API_BASE}/api/customers/${user.id}/bookings/${editingBooking.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            setSuccess("Booking updated successfully!");
            setEditingBooking(null);
            loadData();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const response = await fetch(`${API_BASE}/api/customers/${user.id}/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setSuccess("Booking cancelled successfully!");
            loadData();
        } catch (e) {
            setError(e.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "#ffc107";
            case "CONFIRMED": return "#28a745";
            case "IN_PROGRESS": return "#007bff";
            case "COMPLETED": return "#6f42c1";
            case "CANCELLED": return "#dc3545";
            default: return "#6c757d";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING": return "⏳";
            case "CONFIRMED": return "✅";
            case "IN_PROGRESS": return "🔧";
            case "COMPLETED": return "🎉";
            case "CANCELLED": return "❌";
            default: return "📋";
        }
    };

    const getLocationName = (locationId) => {
        const location = locations.find(l => l.id === locationId);
        return location ? location.name : `Location #${locationId}`;
    };

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : `Vehicle #${vehicleId}`;
    };

    const filteredBookings = filterStatus === "ALL"
        ? bookings
        : bookings.filter(booking => booking.status === filterStatus);

    const sortedBookings = [...filteredBookings].sort((a, b) =>
        new Date(b.startTime || 0) - new Date(a.startTime || 0)
    );

    useEffect(() => {
        if (user && token) loadData();
    }, [user, token]);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading your bookings...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ color: "#1a73e8", margin: "0 0 10px 0", fontSize: "2rem", fontWeight: "700" }}>
                    My Bookings
                </h2>
                <p style={{ color: "#666", margin: 0 }}>Manage your service appointments and track their progress</p>
            </div>

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
                    onClick={() => onNavigate('services')}
                    style={{
                        padding: "12px 30px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        backgroundColor: "#1a73e8",
                        color: "white",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    📅 Book New Service
                </button>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ fontWeight: "600" }}>Filter by Status:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px" }}
                >
                    <option value="ALL">All Bookings</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Bookings List */}
            {sortedBookings.length === 0 ? (
                <div style={{
                    background: "white",
                    padding: "40px",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "#666",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>📋</div>
                    <h3 style={{ color: "#666", marginBottom: "10px" }}>No Bookings Found</h3>
                    <p>{filterStatus === "ALL"
                        ? "You haven't made any bookings yet. Book your first service!"
                        : `No bookings with status: ${filterStatus}`
                    }</p>
                    <button
                        onClick={() => onNavigate('services')}
                        style={{ marginTop: "15px", padding: "10px 20px", borderRadius: "6px", backgroundColor: "#1a73e8", color: "white", border: "none", cursor: "pointer" }}
                    >
                        Browse Services
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "20px" }}>
                    {sortedBookings.map((booking) => (
                        <div
                            key={booking.id}
                            style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                border: `3px solid ${getStatusColor(booking.status)}20`,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px", fontWeight: "600" }}>
                                    Booking #{booking.id}
                                </h3>
                                <span style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    backgroundColor: getStatusColor(booking.status),
                                    color: "white"
                                }}>
                                    {getStatusIcon(booking.status)} {booking.status}
                                </span>
                            </div>

                            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Service:</strong>
                                    <div style={{ marginTop: "2px", color: "#1a73e8" }}>
                                        {booking.serviceName || booking.serviceType || "Service Appointment"}
                                    </div>
                                </div>

                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Vehicle:</strong>
                                    <div style={{ marginTop: "2px" }}>{getVehicleName(booking.vehicleId)}</div>
                                </div>

                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Location:</strong>
                                    <div style={{ marginTop: "2px" }}>{getLocationName(booking.locationId)}</div>
                                </div>

                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Scheduled:</strong>
                                    <div style={{ marginTop: "2px" }}>{booking.startTime ? new Date(booking.startTime).toLocaleString() : "Not scheduled"}</div>
                                </div>

                                {booking.description && (
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Description:</strong>
                                        <div style={{ marginTop: "2px", background: "#f8f9fa", padding: "8px", borderRadius: "4px", fontSize: "13px" }}>
                                            {booking.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {booking.status === "PENDING" && (
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => handleEditBooking(booking)}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#1a73e8",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>

                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#dc3545",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBooking && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "30px",
                        maxWidth: "500px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflow: "auto"
                    }}>
                        <h3 style={{ color: "#1a73e8", marginBottom: "20px" }}>
                            Edit Booking #{editingBooking.id}
                        </h3>
                        
                        {/* Debug info */}
                        <div style={{ 
                            background: "#f0f0f0", 
                            padding: "10px", 
                            marginBottom: "20px", 
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "monospace"
                        }}>
                            <strong>Debug Info:</strong><br/>
                            Form values: {JSON.stringify(editForm, null, 2)}<br/>
                            Booking data: {JSON.stringify(editingBooking, null, 2)}
                        </div>

                        <form onSubmit={handleUpdateBooking}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Vehicle</label>
                                <select
                                    value={editForm.vehicleId}
                                    onChange={(e) => setEditForm({ ...editForm, vehicleId: e.target.value })}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Location</label>
                                <select
                                    value={editForm.locationId}
                                    onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                    required
                                >
                                    <option value="">Select Location</option>
                                    {locations.filter(loc => loc.type === "SERVICE_CENTER").map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Date</label>
                                    <input
                                        type="date"
                                        value={editForm.preferredDate}
                                        onChange={(e) => setEditForm({ ...editForm, preferredDate: e.target.value })}
                                        min={new Date().toISOString().split("T")[0]}
                                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Time</label>
                                    <select
                                        value={editForm.preferredTime}
                                        onChange={(e) => setEditForm({ ...editForm, preferredTime: e.target.value })}
                                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                                        required
                                    >
                                        <option value="">Select Time</option>
                                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", resize: "vertical" }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingBooking(null)}
                                    style={{ padding: "10px 20px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: "#1a73e8", color: "white", border: "none", cursor: "pointer" }}
                                >
                                    Update Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
