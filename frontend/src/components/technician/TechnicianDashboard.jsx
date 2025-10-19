import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function TechnicianDashboard({ onNavigate }) {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const getJobStats = () => {
        const stats = {
            QUEUED: jobs.filter(job => job.status === 'QUEUED').length,
            IN_PROGRESS: jobs.filter(job => job.status === 'IN_PROGRESS').length,
            BLOCKED: jobs.filter(job => job.status === 'BLOCKED').length,
            DONE: jobs.filter(job => job.status === 'DONE').length,
            CANCELLED: jobs.filter(job => job.status === 'CANCELLED').length
        };
        return stats;
    };

    const getPendingBookings = () => {
        return bookings.filter(booking => 
            !jobs.some(job => job.bookingId === booking.id)
        ).length;
    };

    const getStatusConfig = (status) => {
        const configs = {
            QUEUED: {
                color: '#6c757d',
                gradient: 'linear-gradient(135deg, #6c757d, #495057)',
                icon: '⏳',
                label: 'Queued'
            },
            IN_PROGRESS: {
                color: '#007bff',
                gradient: 'linear-gradient(135deg, #007bff, #0056b3)',
                icon: '🔧',
                label: 'In Progress'
            },
            BLOCKED: {
                color: '#dc3545',
                gradient: 'linear-gradient(135deg, #dc3545, #c82333)',
                icon: '🚫',
                label: 'Blocked'
            },
            DONE: {
                color: '#28a745',
                gradient: 'linear-gradient(135deg, #28a745, #1e7e34)',
                icon: '✅',
                label: 'Completed'
            },
            CANCELLED: {
                color: '#6f42c1',
                gradient: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
                icon: '❌',
                label: 'Cancelled'
            },
            PENDING: {
                color: '#ffc107',
                gradient: 'linear-gradient(135deg, #ffc107, #e0a800)',
                icon: '📋',
                label: 'Pending Assignment'
            }
        };
        return configs[status] || configs.QUEUED;
    };

    const getRecentJobs = () => {
        return jobs
            .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
            .slice(0, 5);
    };

    const getBookingDisplay = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return `Booking #${bookingId}`;
        return `${booking.type} - ${booking.customerEmail || 'Customer'}`;
    };

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "400px",
                fontSize: "18px",
                color: "#666"
            }}>
                <div>Loading dashboard...</div>
            </div>
        );
    }

    const stats = getJobStats();
    const pendingCount = getPendingBookings();
    const recentJobs = getRecentJobs();

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Welcome Header */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h1 style={{ 
                    color: "#1a73e8", 
                    margin: "0 0 10px 0",
                    fontSize: "2.5rem",
                    fontWeight: "700"
                }}>
                    Welcome, {user?.firstName || user?.role || 'User'}! 👋
                </h1>
                <p style={{ 
                    color: "#666", 
                    fontSize: "1.1rem",
                    margin: 0
                }}>
                    Here's your job overview for today
                </p>
            </div>

            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "15px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            )}

            {/* Job Status Overview */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "40px"
            }}>
                {/* Pending Assignments */}
                <div
                    style={{
                        background: getStatusConfig('PENDING').gradient,
                        color: "white",
                        padding: "25px",
                        borderRadius: "16px",
                        textAlign: "center",
                        boxShadow: `0 8px 25px ${getStatusConfig('PENDING').color}40`,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        cursor: "pointer"
                    }}
                    onClick={() => onNavigate('pending-jobs')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                        e.currentTarget.style.boxShadow = `0 15px 35px ${getStatusConfig('PENDING').color}50`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = `0 8px 25px ${getStatusConfig('PENDING').color}40`;
                    }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                        {getStatusConfig('PENDING').icon}
                    </div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "5px" }}>
                        {pendingCount}
                    </div>
                    <div style={{ fontSize: "1rem", opacity: 0.9 }}>
                        {getStatusConfig('PENDING').label}
                    </div>
                </div>

                {/* Job Status Cards */}
                {Object.entries(stats).map(([status, count]) => {
                    const config = getStatusConfig(status);
                    return (
                        <div
                            key={status}
                            style={{
                                background: config.gradient,
                                color: "white",
                                padding: "25px",
                                borderRadius: "16px",
                                textAlign: "center",
                                boxShadow: `0 8px 25px ${config.color}40`,
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                cursor: "pointer"
                            }}
                            onClick={() => onNavigate('job-management')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                                e.currentTarget.style.boxShadow = `0 15px 35px ${config.color}50`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                e.currentTarget.style.boxShadow = `0 8px 25px ${config.color}40`;
                            }}
                        >
                            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                                {config.icon}
                            </div>
                            <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "5px" }}>
                                {count}
                            </div>
                            <div style={{ fontSize: "1rem", opacity: 0.9 }}>
                                {config.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "25px",
                marginBottom: "30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{ 
                    color: "#1a73e8", 
                    marginBottom: "20px",
                    fontSize: "1.5rem",
                    fontWeight: "600"
                }}>
                    Quick Actions
                </h3>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px"
                }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate('job-management')}
                        style={{
                            padding: "15px 20px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            borderRadius: "10px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 20px rgba(26, 115, 232, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        🔧 Manage Jobs
                    </button>
                    
                    <button
                        className="btn btn-ok"
                        onClick={() => onNavigate('technicians')}
                        style={{
                            padding: "15px 20px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            borderRadius: "10px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 20px rgba(52, 168, 83, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        👥 View Technicians
                    </button>
                    
                    <button
                        className="btn"
                        onClick={() => onNavigate('pending-jobs')}
                        style={{
                            padding: "15px 20px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            borderRadius: "10px",
                            background: "#ffc107",
                            color: "white",
                            border: "none",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 20px rgba(255, 193, 7, 0.3)";
                            e.target.style.background = "#e0a800";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = "#ffc107";
                        }}
                    >
                        📋 Assign Pending
                    </button>
                </div>
            </div>

            {/* Recent Jobs */}
            <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "25px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{ 
                    color: "#1a73e8", 
                    marginBottom: "20px",
                    fontSize: "1.5rem",
                    fontWeight: "600"
                }}>
                    Recent Jobs
                </h3>
                
                {recentJobs.length === 0 ? (
                    <div style={{ 
                        textAlign: "center", 
                        color: "#666",
                        padding: "40px 20px"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📝</div>
                        <p>No jobs assigned yet</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {recentJobs.map((job, index) => {
                            const config = getStatusConfig(job.status);
                            return (
                                <div
                                    key={job.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "15px 20px",
                                        background: index % 2 === 0 ? "#f8f9fa" : "white",
                                        borderRadius: "10px",
                                        border: `2px solid ${config.color}20`,
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateX(5px)";
                                        e.currentTarget.style.borderColor = config.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateX(0)";
                                        e.currentTarget.style.borderColor = `${config.color}20`;
                                    }}
                                >
                                    <div>
                                        <div style={{ 
                                            fontWeight: "600", 
                                            color: "#1a1a1a",
                                            marginBottom: "5px"
                                        }}>
                                            Job #{job.id} - {getBookingDisplay(job.bookingId)}
                                        </div>
                                        <div style={{ 
                                            fontSize: "14px", 
                                            color: "#666"
                                        }}>
                                            Assigned: {new Date(job.assignedAt).toLocaleString()}
                                        </div>
                                        {job.technicianName && (
                                            <div style={{ 
                                                fontSize: "14px", 
                                                color: "#1a73e8",
                                                marginTop: "2px"
                                            }}>
                                                Technician: {job.technicianName}
                                            </div>
                                        )}
                                    </div>
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
