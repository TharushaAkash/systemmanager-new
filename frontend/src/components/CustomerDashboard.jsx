import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import FuelStationBooking from "./FuelStationBooking";
import ServiceCenterBooking from "./ServiceCenterBooking";
import CustomerInvoices from "./CustomerInvoices";

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("fuel-booking");

    const tabs = [
        { id: "fuel-booking", label: "Fuel Station Booking", icon: "⛽" },
        { id: "service-booking", label: "Service Center Booking", icon: "🔧" },
        { id: "my-bookings", label: "My Bookings", icon: "📋" },
        { id: "invoices", label: "My Invoices", icon: "🧾" }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "fuel-booking":
                return <FuelStationBooking />;
            case "service-booking":
                return <ServiceCenterBooking />;
            case "my-bookings":
                return <MyBookingsView />;
            case "invoices":
                return <CustomerInvoices />;
            default:
                return <FuelStationBooking />;
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                    Welcome, {user?.fullName || user?.email}!
                </h1>
                <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
                    Manage your fuel station visits, service appointments, and view your transaction history.
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "30px",
                borderBottom: "2px solid #ecf0f1",
                paddingBottom: "10px"
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 20px",
                            border: "none",
                            borderRadius: "8px 8px 0 0",
                            backgroundColor: activeTab === tab.id ? "#3498db" : "#ecf0f1",
                            color: activeTab === tab.id ? "white" : "#2c3e50",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: activeTab === tab.id ? "600" : "400",
                            transition: "all 0.3s ease",
                            borderBottom: activeTab === tab.id ? "3px solid #2980b9" : "3px solid transparent"
                        }}
                    >
                        <span style={{ fontSize: "16px" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                minHeight: "500px"
            }}>
                {renderTabContent()}
            </div>
        </div>
    );
}

// My Bookings View Component
function MyBookingsView() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBookings = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`http://localhost:8080/api/customers/${user.id}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setBookings(data);
        } catch (err) {
            console.error("Error loading bookings:", err);
            setError(`Failed to load bookings: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user && token) {
            loadBookings();
        }
    }, [user, token]);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        try {
            return new Date(dateTimeString).toLocaleString();
        } catch {
            return dateTimeString;
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h3>Loading your bookings...</h3>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: "20px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "5px",
                margin: "20px"
            }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>All My Bookings</h2>
                <button
                    onClick={loadBookings}
                    style={{
                        backgroundColor: "#27ae60",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {bookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
                    <h3>No bookings found</h3>
                    <p>You haven't made any bookings yet. Use the tabs above to create fuel or service bookings.</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white"
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>ID</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Type</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Location</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Vehicle</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Service/Fuel</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Status</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Start Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                    <td style={{ padding: "12px" }}>{booking.id}</td>
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
                                    <td style={{ padding: "12px" }}>Location {booking.locationId}</td>
                                    <td style={{ padding: "12px" }}>Vehicle {booking.vehicleId}</td>
                                    <td style={{ padding: "12px" }}>
                                        {booking.serviceTypeId ? `Service ${booking.serviceTypeId}` : 
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
