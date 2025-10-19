import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

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
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackBooking, setFeedbackBooking] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({
        rating: 0,
        comment: ""
    });
    const [bookingFeedbacks, setBookingFeedbacks] = useState({}); // Store feedback for each booking

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
                setBookings(bookingsData || []);
                
                // Load feedback for each completed booking
                await loadBookingFeedbacks(bookingsData || []);
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

    const loadBookingFeedbacks = async (bookings) => {
        const completedBookings = bookings.filter(booking => booking.status === "COMPLETED");
        const feedbackPromises = completedBookings.map(async (booking) => {
            try {
                const response = await fetch(`${API_BASE}/api/feedback/booking/${booking.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const feedback = await response.json();
                    return { bookingId: booking.id, feedback };
                } else if (response.status === 404) {
                    // No feedback exists for this booking - this is normal
                    return { bookingId: booking.id, feedback: null };
                }
            } catch (err) {
                // Only log actual errors, not 404s
                if (err.message && !err.message.includes('404')) {
                    console.error(`Error loading feedback for booking ${booking.id}:`, err);
                }
            }
            return { bookingId: booking.id, feedback: null };
        });

        const feedbackResults = await Promise.all(feedbackPromises);
        const feedbackMap = {};
        feedbackResults.forEach(({ bookingId, feedback }) => {
            if (feedback) {
                console.log(`Feedback found for booking ${bookingId}:`, feedback);
                feedbackMap[bookingId] = feedback;
            }
        });
        console.log("Final feedback map:", feedbackMap);
        setBookingFeedbacks(feedbackMap);
    };

    const handleEditBooking = (booking) => {
        if (booking.status === "CONFIRMED") {
            setError("Cannot edit confirmed bookings. Please contact support for changes.");
            return;
        }

        
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

    const handleSubmitFeedback = async (booking) => {
        // First, verify the booking is still completed
        try {
            const response = await fetch(`${API_BASE}/api/customers/${user.id}/bookings/${booking.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const currentBooking = await response.json();
                if (currentBooking.status !== "COMPLETED") {
                    setError("This booking is no longer in completed status. Feedback cannot be submitted.");
                    return;
                }
            } else {
                // If we can't verify, we'll proceed and let the backend handle it
                console.error("Failed to verify booking status");
            }
        } catch (err) {
            console.error("Error verifying booking status:", err);
            // Proceed and let the backend handle it
        }

        // If booking is still completed, proceed with feedback
        setFeedbackBooking(booking);
        setFeedbackForm({ rating: 0, comment: "" });
        setShowFeedbackModal(true);
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Ensure rating is a valid number between 1-5
        const rating = parseInt(feedbackForm.rating, 10);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            setError("Please select a valid rating between 1 and 5");
            return;
        }

        try {
            const feedbackData = {
                customerId: user.id,
                bookingId: feedbackBooking.id,
                rating: rating,
                comment: feedbackForm.comment
            };
            
            console.log("Submitting feedback:", feedbackData);
            
            const response = await fetch(`${API_BASE}/api/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            setSuccess("Feedback submitted successfully! Thank you for your review.");
            setShowFeedbackModal(false);
            setFeedbackBooking(null);
            setFeedbackForm({ rating: 0, comment: "" });
            
            // Refresh feedback data for this booking
            await loadBookingFeedbacks(bookings);
        } catch (e) {
            setError(e.message);
            // Keep the modal open if there's an error so the user can try again
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

    const renderStars = (rating) => {
        console.log("Rendering stars for rating:", rating, "Type:", typeof rating);
        return (
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={{
                            fontSize: "1rem",
                            color: star <= rating ? "#ffc107" : "#d1d5db",
                            display: star <= rating ? "inline" : "none" // Only show stars up to the rating
                        }}
                    >
                        ⭐
                    </span>
                ))}
                <span style={{ 
                    fontSize: "0.8rem", 
                    color: "#6c757d", 
                    marginLeft: "4px",
                    fontWeight: "500"
                }}>
                    ({rating}/5)
                </span>
            </div>
        );
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
                                        {booking.serviceName || "Service Appointment"}
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

                            {booking.status === "COMPLETED" && (
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                                    {bookingFeedbacks[booking.id] ? (
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "8px",
                                            padding: "8px 12px",
                                            background: "#f8f9fa",
                                            borderRadius: "6px",
                                            border: "1px solid #e9ecef"
                                        }}>
                                            <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500" }}>
                                                Your Rating:
                                            </span>
                                            {renderStars(bookingFeedbacks[booking.id].rating)}
                                            <span style={{ 
                                                fontSize: "12px", 
                                                color: "#28a745", 
                                                fontWeight: "600",
                                                marginLeft: "4px"
                                            }}>
                                                ✓ Rated
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSubmitFeedback(booking)}
                                            style={{
                                                padding: "8px 16px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#28a745",
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.background = "#218838";
                                                e.target.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.background = "#28a745";
                                                e.target.style.transform = "translateY(0)";
                                            }}
                                        >
                                            ⭐ Leave Feedback
                                        </button>
                                    )}
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
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            marginBottom: "30px",
                            paddingBottom: "15px",
                            borderBottom: "2px solid #f0f0f0"
                        }}>
                            <h3 style={{ 
                                color: "#1a73e8", 
                                margin: 0, 
                                fontSize: "1.5rem", 
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                ✏️ Edit Booking #{editingBooking.id}
                            </h3>
                            <button
                                onClick={() => setEditingBooking(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    color: "#999",
                                    padding: "5px",
                                    borderRadius: "50%",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = "#f5f5f5";
                                    e.target.style.color = "#666";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = "none";
                                    e.target.style.color = "#999";
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBooking} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Vehicle Selection */}
                            <div style={{ 
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <label style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px", 
                                    fontWeight: "600", 
                                    marginBottom: "12px", 
                                    color: "#495057",
                                    fontSize: "0.95rem"
                                }}>
                                    🚗 Vehicle
                                </label>
                                <select
                                    value={editForm.vehicleId}
                                    onChange={(e) => setEditForm({ ...editForm, vehicleId: e.target.value })}
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 16px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        fontSize: "0.95rem",
                                        backgroundColor: "white",
                                        transition: "all 0.2s ease",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
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

                            {/* Location Selection */}
                            <div style={{ 
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <label style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px", 
                                    fontWeight: "600", 
                                    marginBottom: "12px", 
                                    color: "#495057",
                                    fontSize: "0.95rem"
                                }}>
                                    📍 Location
                                </label>
                                <select
                                    value={editForm.locationId}
                                    onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 16px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        fontSize: "0.95rem",
                                        backgroundColor: "white",
                                        transition: "all 0.2s ease",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
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

                            {/* Date and Time Selection */}
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "1fr 1fr", 
                                gap: "20px",
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <div>
                                    <label style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "8px", 
                                        fontWeight: "600", 
                                        marginBottom: "12px", 
                                        color: "#495057",
                                        fontSize: "0.95rem"
                                    }}>
                                        📅 Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.preferredDate}
                                        onChange={(e) => setEditForm({ ...editForm, preferredDate: e.target.value })}
                                        min={new Date().toISOString().split("T")[0]}
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px 16px", 
                                            border: "2px solid #dee2e6", 
                                            borderRadius: "8px", 
                                            fontSize: "0.95rem",
                                            backgroundColor: "white",
                                            transition: "all 0.2s ease",
                                            outline: "none"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                        onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "8px", 
                                        fontWeight: "600", 
                                        marginBottom: "12px", 
                                        color: "#495057",
                                        fontSize: "0.95rem"
                                    }}>
                                        🕐 Time
                                    </label>
                                    <select
                                        value={editForm.preferredTime}
                                        onChange={(e) => setEditForm({ ...editForm, preferredTime: e.target.value })}
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px 16px", 
                                            border: "2px solid #dee2e6", 
                                            borderRadius: "8px", 
                                            fontSize: "0.95rem",
                                            backgroundColor: "white",
                                            transition: "all 0.2s ease",
                                            outline: "none"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                        onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
                                        required
                                    >
                                        <option value="">Select Time</option>
                                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ 
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <label style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px", 
                                    fontWeight: "600", 
                                    marginBottom: "12px", 
                                    color: "#495057",
                                    fontSize: "0.95rem"
                                }}>
                                    📝 Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="Add any special instructions or notes for your service..."
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 16px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        fontSize: "0.95rem",
                                        backgroundColor: "white",
                                        resize: "vertical",
                                        transition: "all 0.2s ease",
                                        outline: "none",
                                        fontFamily: "inherit"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ 
                                display: "flex", 
                                gap: "12px", 
                                justifyContent: "flex-end",
                                paddingTop: "10px",
                                borderTop: "1px solid #e9ecef"
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingBooking(null)}
                                    style={{ 
                                        padding: "12px 24px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        background: "white", 
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        color: "#6c757d",
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.borderColor = "#adb5bd";
                                        e.target.style.color = "#495057";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.borderColor = "#dee2e6";
                                        e.target.style.color = "#6c757d";
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ 
                                        padding: "12px 24px", 
                                        borderRadius: "8px", 
                                        backgroundColor: "#1a73e8", 
                                        color: "white", 
                                        border: "none", 
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "600",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = "#1557b0";
                                        e.target.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = "#1a73e8";
                                        e.target.style.transform = "translateY(0)";
                                    }}
                                >
                                    💾 Update Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && feedbackBooking && (
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
                        borderRadius: "16px",
                        padding: "30px",
                        maxWidth: "500px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflow: "auto",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between", 
                            marginBottom: "30px",
                            paddingBottom: "15px",
                            borderBottom: "2px solid #f0f0f0"
                        }}>
                            <h3 style={{ 
                                color: "#1a73e8", 
                                margin: 0, 
                                fontSize: "1.5rem", 
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}>
                                ⭐ Leave Feedback
                            </h3>
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    color: "#999",
                                    padding: "5px",
                                    borderRadius: "50%",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = "#f5f5f5";
                                    e.target.style.color = "#666";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = "none";
                                    e.target.style.color = "#999";
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{
                            background: "#f8f9fa",
                            padding: "20px",
                            borderRadius: "12px",
                            marginBottom: "20px",
                            border: "1px solid #e9ecef"
                        }}>
                            <h4 style={{ margin: "0 0 10px 0", color: "#495057", fontSize: "1rem" }}>
                                Booking #{feedbackBooking.id}
                            </h4>
                            <p style={{ margin: "0", color: "#6c757d", fontSize: "0.9rem" }}>
                                {feedbackBooking.serviceName || "Service Appointment"}
                            </p>
                        </div>

                        <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Rating Section */}
                            <div style={{ 
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <label style={{ 
                                    display: "block", 
                                    fontWeight: "600", 
                                    marginBottom: "15px", 
                                    color: "#495057",
                                    fontSize: "1rem"
                                }}>
                                    How would you rate this service? *
                                </label>
                                <div style={{ 
                                    display: "flex", 
                                    gap: "8px", 
                                    justifyContent: "center",
                                    flexWrap: "wrap"
                                }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                fontSize: "2.5rem",
                                                cursor: "pointer",
                                                padding: "8px",
                                                borderRadius: "50%",
                                                transition: "all 0.3s ease",
                                                color: star <= feedbackForm.rating ? "#ffc107" : "#d1d5db",
                                                filter: star <= feedbackForm.rating ? "drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))" : "none"
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.color = "#ffc107";
                                                e.target.style.transform = "scale(1.15)";
                                                e.target.style.filter = "drop-shadow(0 2px 8px rgba(255, 193, 7, 0.4))";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.color = star <= feedbackForm.rating ? "#ffc107" : "#d1d5db";
                                                e.target.style.transform = "scale(1)";
                                                e.target.style.filter = star <= feedbackForm.rating ? "drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))" : "none";
                                            }}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <div style={{ 
                                    textAlign: "center", 
                                    marginTop: "10px", 
                                    color: "#6c757d", 
                                    fontSize: "0.9rem" 
                                }}>
                                    {feedbackForm.rating > 0 && (
                                        <span>
                                            {feedbackForm.rating === 1 && "Poor"}
                                            {feedbackForm.rating === 2 && "Fair"}
                                            {feedbackForm.rating === 3 && "Good"}
                                            {feedbackForm.rating === 4 && "Very Good"}
                                            {feedbackForm.rating === 5 && "Excellent"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div style={{ 
                                background: "#f8f9fa", 
                                padding: "20px", 
                                borderRadius: "12px", 
                                border: "1px solid #e9ecef" 
                            }}>
                                <label style={{ 
                                    display: "block", 
                                    fontWeight: "600", 
                                    marginBottom: "12px", 
                                    color: "#495057",
                                    fontSize: "0.95rem"
                                }}>
                                    📝 Additional Comments (Optional)
                                </label>
                                <textarea
                                    value={feedbackForm.comment}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                                    rows={4}
                                    placeholder="Tell us about your experience with this service..."
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px 16px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        fontSize: "0.95rem",
                                        backgroundColor: "white",
                                        resize: "vertical",
                                        transition: "all 0.2s ease",
                                        outline: "none",
                                        fontFamily: "inherit"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={{ 
                                display: "flex", 
                                gap: "12px", 
                                justifyContent: "flex-end",
                                paddingTop: "10px",
                                borderTop: "1px solid #e9ecef"
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowFeedbackModal(false)}
                                    style={{ 
                                        padding: "12px 24px", 
                                        border: "2px solid #dee2e6", 
                                        borderRadius: "8px", 
                                        background: "white", 
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        color: "#6c757d",
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.borderColor = "#adb5bd";
                                        e.target.style.color = "#495057";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.borderColor = "#dee2e6";
                                        e.target.style.color = "#6c757d";
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ 
                                        padding: "12px 24px", 
                                        borderRadius: "8px", 
                                        backgroundColor: "#28a745", 
                                        color: "white", 
                                        border: "none", 
                                        cursor: "pointer",
                                        fontSize: "0.95rem",
                                        fontWeight: "600",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = "#218838";
                                        e.target.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = "#28a745";
                                        e.target.style.transform = "translateY(0)";
                                    }}
                                >
                                    💾 Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
