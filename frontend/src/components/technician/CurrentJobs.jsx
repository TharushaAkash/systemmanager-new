import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function CurrentJobs() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/jobs`, { headers }),
                fetch(`${API_BASE}/api/bookings`, { headers })
            ];

            const [jobsRes, bookingsRes] = await Promise.all(requests);
            
            if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);
            if (!bookingsRes.ok) throw new Error(`Bookings fetch failed: ${bookingsRes.status}`);

            const [jobsData, bookingsData] = await Promise.all([
                jobsRes.json(),
                bookingsRes.json()
            ]);

            setJobs(jobsData);
            setBookings(bookingsData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const updateJobStatus = async (jobId, newStatus) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/jobs/${jobId}?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            loadData(); // Refresh data
        } catch (e) {
            setError(e.message);
        }
    };

    const getOngoingJobs = () => {
        return jobs.filter(job => ['QUEUED', 'IN_PROGRESS', 'BLOCKED'].includes(job.status));
    };

    const getFilteredJobs = () => {
        const ongoingJobs = getOngoingJobs();
        if (filterStatus === "ALL") return ongoingJobs;
        return ongoingJobs.filter(job => job.status === filterStatus);
    };

    const getBookingDisplay = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return `Booking #${bookingId}`;
        return `${booking.type} - ${booking.customerEmail || 'Customer'} (${new Date(booking.startTime).toLocaleDateString()})`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'QUEUED': return '#6c757d';
            case 'IN_PROGRESS': return '#007bff';
            case 'BLOCKED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            QUEUED: { color: '#6c757d', icon: '⏳', label: 'Queued' },
            IN_PROGRESS: { color: '#007bff', icon: '🔧', label: 'In Progress' },
            BLOCKED: { color: '#dc3545', icon: '🚫', label: 'Blocked' }
        };
        return configs[status] || configs.QUEUED;
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'QUEUED': return 'IN_PROGRESS';
            case 'IN_PROGRESS': return 'DONE';
            case 'BLOCKED': return 'IN_PROGRESS';
            default: return null;
        }
    };

    const getStatusButtonText = (currentStatus) => {
        switch (currentStatus) {
            case 'QUEUED': return 'Start Job';
            case 'IN_PROGRESS': return 'Complete Job';
            case 'BLOCKED': return 'Resume Job';
            default: return 'Update';
        }
    };

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading current jobs...</div>
            </div>
        );
    }

    const ongoingJobs = getOngoingJobs();
    const filteredJobs = getFilteredJobs();

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#1a73e8" }}>Current Ongoing Jobs</h2>
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
                {['QUEUED', 'IN_PROGRESS', 'BLOCKED'].map(status => {
                    const count = ongoingJobs.filter(job => job.status === status).length;
                    const config = getStatusConfig(status);
                    return (
                        <div
                            key={status}
                            style={{
                                background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                                color: "white",
                                padding: "20px",
                                borderRadius: "12px",
                                textAlign: "center",
                                boxShadow: `0 4px 15px ${config.color}40`,
                                cursor: "pointer",
                                transition: "transform 0.2s ease"
                            }}
                            onClick={() => setFilterStatus(status)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                                {config.icon}
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "5px" }}>
                                {count}
                            </div>
                            <div style={{ fontSize: "14px", opacity: 0.9 }}>
                                {config.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <label style={{ fontWeight: "600" }}>Filter by Status:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        fontSize: "14px"
                    }}
                >
                    <option value="ALL">All Ongoing</option>
                    <option value="QUEUED">Queued</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                </select>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
                <div style={{
                    background: "white",
                    padding: "40px",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "#666",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎉</div>
                    <h3 style={{ color: "#28a745", marginBottom: "10px" }}>No Ongoing Jobs!</h3>
                    <p>
                        {filterStatus === "ALL" 
                            ? "All jobs are completed or there are no active jobs."
                            : `No jobs with status: ${filterStatus}`
                        }
                    </p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "20px"
                }}>
                    {filteredJobs.map((job) => {
                        const config = getStatusConfig(job.status);
                        const nextStatus = getNextStatus(job.status);
                        
                        return (
                            <div
                                key={job.id}
                                style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    border: `3px solid ${config.color}`,
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
                                        Job #{job.id}
                                    </h3>
                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        backgroundColor: config.color,
                                        color: "white"
                                    }}>
                                        {config.icon} {job.status}
                                    </span>
                                </div>

                                {/* Job Details */}
                                <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Booking:</strong>
                                        <div style={{ marginTop: "2px" }}>
                                            {getBookingDisplay(job.bookingId)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Technician:</strong>
                                        <div style={{ marginTop: "2px", color: "#1a73e8" }}>
                                            {job.technicianName || `Technician #${job.technicianId}`}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "8px" }}>
                                        <strong style={{ color: "#666" }}>Assigned:</strong>
                                        <div style={{ marginTop: "2px" }}>
                                            {job.assignedAt ? new Date(job.assignedAt).toLocaleString() : "N/A"}
                                        </div>
                                    </div>

                                    {job.notes && (
                                        <div style={{ marginBottom: "8px" }}>
                                            <strong style={{ color: "#666" }}>Notes:</strong>
                                            <div style={{ 
                                                marginTop: "2px",
                                                background: "#f8f9fa",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                fontSize: "13px"
                                            }}>
                                                {job.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    {nextStatus && (
                                        <button
                                            onClick={() => updateJobStatus(job.id, nextStatus)}
                                            style={{
                                                padding: "8px 16px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#28a745",
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "#218838";
                                                e.target.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "#28a745";
                                                e.target.style.transform = "translateY(0)";
                                            }}
                                        >
                                            {getStatusButtonText(job.status)}
                                        </button>
                                    )}
                                    
                                    {job.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => updateJobStatus(job.id, 'BLOCKED')}
                                            style={{
                                                padding: "8px 16px",
                                                border: "none",
                                                borderRadius: "6px",
                                                background: "#dc3545",
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: "13px",
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
                                            🚫 Block Job
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
