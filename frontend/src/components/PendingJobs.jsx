import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function PendingJobs() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [assigningJob, setAssigningJob] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/bookings`, { headers }),
                fetch(`${API_BASE}/api/jobs`, { headers }),
                fetch(`${API_BASE}/api/users`, { headers })
            ];

            const [bookingsRes, jobsRes, usersRes] = await Promise.all(requests);
            
            if (!bookingsRes.ok) throw new Error(`Bookings fetch failed: ${bookingsRes.status}`);
            if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);
            if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);

            const [bookingsData, jobsData, usersData] = await Promise.all([
                bookingsRes.json(),
                jobsRes.json(),
                usersRes.json()
            ]);

            setBookings(bookingsData);
            setJobs(jobsData);
            setTechnicians(usersData.filter(u => u.role === 'TECHNICIAN' || u.role === 'STAFF'));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const assignJob = async (bookingId, technicianId) => {
        setError("");
        setAssigningJob(bookingId);
        
        try {
            const response = await fetch(`${API_BASE}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId: bookingId,
                    technicianId: technicianId,
                    notes: "Auto-assigned from pending jobs"
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            loadData(); // Refresh data
        } catch (e) {
            setError(e.message);
        } finally {
            setAssigningJob(null);
        }
    };

    // Get bookings that are CONFIRMED and don't have jobs assigned yet
    const pendingBookings = bookings.filter(booking => 
        booking.status === 'CONFIRMED' && 
        !jobs.some(job => job.bookingId === booking.id)
    );

    const getBookingTypeColor = (type) => {
        switch (type) {
            case 'FUEL': return '#ff9800';
            case 'SERVICE': return '#2196f3';
            default: return '#6c757d';
        }
    };

    const getBookingStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#ffc107';
            case 'CONFIRMED': return '#28a745';
            case 'IN_PROGRESS': return '#007bff';
            case 'COMPLETED': return '#6f42c1';
            case 'CANCELLED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getAvailableTechnicians = () => {
        return technicians.filter(tech => 
            !jobs.some(job => 
                job.technicianId === tech.id && 
                ['QUEUED', 'IN_PROGRESS', 'BLOCKED'].includes(job.status)
            )
        );
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading pending jobs...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#1a73e8" }}>Pending Job Assignments</h2>
                <button 
                    className="btn btn-primary"
                    onClick={loadData}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {/* Summary Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}>
                <div style={{
                    background: "linear-gradient(135deg, #ffc107, #ffb300)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(255, 193, 7, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {pendingBookings.length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Confirmed & Pending</div>
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
                        {bookings.filter(b => b.status === 'CONFIRMED').length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Total Confirmed</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #17a2b8, #138496)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(23, 162, 184, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {getAvailableTechnicians().length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Available Technicians</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #1a73e8, #4285f4)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(26, 115, 232, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {jobs.length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Total Jobs</div>
                </div>
            </div>

            {/* Pending Bookings */}
            {pendingBookings.length === 0 ? (
                <div style={{
                    background: "white",
                    padding: "40px",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "#666",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎉</div>
                    <h3 style={{ color: "#28a745", marginBottom: "10px" }}>All Caught Up!</h3>
                    <p>No confirmed bookings waiting for job assignment.</p>
                    <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                        Only bookings with "CONFIRMED" status appear here.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "20px"
                }}>
                    {pendingBookings.map((booking) => (
                        <div
                            key={booking.id}
                            style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                border: "2px solid #ffc107",
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
                                    Booking #{booking.id}
                                </h3>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "15px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        backgroundColor: getBookingTypeColor(booking.type),
                                        color: "white"
                                    }}>
                                        {booking.type}
                                    </span>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "15px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        backgroundColor: getBookingStatusColor(booking.status),
                                        color: "white"
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Customer:</strong>
                                    <div style={{ marginTop: "2px" }}>
                                        {booking.customerEmail || "Not specified"}
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: "8px" }}>
                                    <strong style={{ color: "#666" }}>Schedule:</strong>
                                    <div style={{ marginTop: "2px" }}>
                                        {booking.startTime ? new Date(booking.startTime).toLocaleString() : "Not scheduled"}
                                    </div>
                                </div>

                                {booking.serviceTypeName && (
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Service:</strong>
                                        <div style={{ marginTop: "2px", color: "#1a73e8" }}>
                                            {booking.serviceTypeName}
                                        </div>
                                    </div>
                                )}

                                {booking.fuelType && (
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Fuel Type:</strong>
                                        <div style={{ marginTop: "2px" }}>
                                            {booking.fuelType} ({booking.litersRequested}L)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Assignment Section */}
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
                                    ASSIGN TO TECHNICIAN:
                                </div>
                                
                                {getAvailableTechnicians().length === 0 ? (
                                    <div style={{ 
                                        color: "#dc3545", 
                                        fontSize: "14px",
                                        fontStyle: "italic"
                                    }}>
                                        No available technicians
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {getAvailableTechnicians().map(tech => (
                                            <button
                                                key={tech.id}
                                                onClick={() => assignJob(booking.id, tech.id)}
                                                disabled={assigningJob === booking.id}
                                                style={{
                                                    padding: "6px 12px",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    background: assigningJob === booking.id ? "#6c757d" : "#28a745",
                                                    color: "white",
                                                    cursor: assigningJob === booking.id ? "not-allowed" : "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (assigningJob !== booking.id) {
                                                        e.target.style.background = "#218838";
                                                        e.target.style.transform = "translateY(-1px)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (assigningJob !== booking.id) {
                                                        e.target.style.background = "#28a745";
                                                        e.target.style.transform = "translateY(0)";
                                                    }
                                                }}
                                            >
                                                {assigningJob === booking.id ? "Assigning..." : 
                                                 (tech.firstName && tech.lastName 
                                                    ? `${tech.firstName} ${tech.lastName}` 
                                                    : tech.email)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
