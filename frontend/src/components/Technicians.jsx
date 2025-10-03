import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function Technicians() {
    const { token } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/users`, { headers }),
                fetch(`${API_BASE}/api/jobs`, { headers })
            ];

            const [usersRes, jobsRes] = await Promise.all(requests);
            
            if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
            if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);

            const [usersData, jobsData] = await Promise.all([
                usersRes.json(),
                jobsRes.json()
            ]);

            // Filter users to only show technicians and staff
            setTechnicians(usersData.filter(u => u.role === 'TECHNICIAN' || u.role === 'STAFF'));
            setJobs(jobsData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const getTechnicianStatus = (technicianId) => {
        const activeJob = jobs.find(job => 
            job.technicianId === technicianId && 
            ['QUEUED', 'IN_PROGRESS', 'BLOCKED'].includes(job.status)
        );
        return activeJob ? 'BUSY' : 'AVAILABLE';
    };

    const getTechnicianActiveJob = (technicianId) => {
        return jobs.find(job => 
            job.technicianId === technicianId && 
            ['QUEUED', 'IN_PROGRESS', 'BLOCKED'].includes(job.status)
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return '#28a745';
            case 'BUSY': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getJobStatusColor = (status) => {
        switch (status) {
            case 'QUEUED': return '#6c757d';
            case 'IN_PROGRESS': return '#007bff';
            case 'BLOCKED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading technicians...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#1a73e8" }}>Available Technicians</h2>
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
                    background: "linear-gradient(135deg, #28a745, #20c997)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {technicians.filter(t => getTechnicianStatus(t.id) === 'AVAILABLE').length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Available</div>
                </div>

                <div style={{
                    background: "linear-gradient(135deg, #dc3545, #e74c3c)",
                    color: "white",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)"
                }}>
                    <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "5px" }}>
                        {technicians.filter(t => getTechnicianStatus(t.id) === 'BUSY').length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Busy</div>
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
                        {technicians.length}
                    </div>
                    <div style={{ fontSize: "16px", opacity: 0.9 }}>Total Technicians</div>
                </div>
            </div>

            {/* Technicians Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
            }}>
                {technicians.length === 0 ? (
                    <div style={{ 
                        gridColumn: "1 / -1",
                        padding: "40px", 
                        textAlign: "center", 
                        color: "#666",
                        background: "white",
                        borderRadius: "12px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        No technicians found.
                    </div>
                ) : (
                    technicians.map((technician) => {
                        const status = getTechnicianStatus(technician.id);
                        const activeJob = getTechnicianActiveJob(technician.id);
                        
                        return (
                            <div
                                key={technician.id}
                                style={{
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    border: `3px solid ${getStatusColor(status)}`,
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                }}
                            >
                                {/* Header with status */}
                                <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    marginBottom: "15px"
                                }}>
                                    <div>
                                        <h3 style={{ 
                                            margin: 0, 
                                            color: "#1a1a1a",
                                            fontSize: "18px",
                                            fontWeight: "600"
                                        }}>
                                            {technician.firstName && technician.lastName 
                                                ? `${technician.firstName} ${technician.lastName}` 
                                                : technician.email}
                                        </h3>
                                        <p style={{ 
                                            margin: "5px 0 0 0", 
                                            color: "#666",
                                            fontSize: "14px"
                                        }}>
                                            ID: #{technician.id}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        backgroundColor: getStatusColor(status),
                                        color: "white",
                                        textTransform: "uppercase"
                                    }}>
                                        {status}
                                    </span>
                                </div>

                                {/* Details */}
                                <div style={{ marginBottom: "15px" }}>
                                    <div style={{ 
                                        display: "grid", 
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "10px",
                                        fontSize: "14px"
                                    }}>
                                        <div>
                                            <strong style={{ color: "#666" }}>Role:</strong>
                                            <div style={{ 
                                                color: "#1a73e8", 
                                                fontWeight: "600",
                                                marginTop: "2px"
                                            }}>
                                                {technician.role}
                                            </div>
                                        </div>
                                        <div>
                                            <strong style={{ color: "#666" }}>Phone:</strong>
                                            <div style={{ marginTop: "2px" }}>
                                                {technician.phone || "Not provided"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                    <strong style={{ color: "#666" }}>Email:</strong>
                                    <div style={{ marginTop: "2px", color: "#1a73e8" }}>
                                        {technician.email}
                                    </div>
                                </div>

                                {technician.address && (
                                    <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                                        <strong style={{ color: "#666" }}>Address:</strong>
                                        <div style={{ marginTop: "2px" }}>
                                            {technician.address}
                                            {technician.city && `, ${technician.city}`}
                                            {technician.postalCode && ` ${technician.postalCode}`}
                                        </div>
                                    </div>
                                )}

                                {/* Active Job Info */}
                                {activeJob && (
                                    <div style={{
                                        background: "#f8f9fa",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        marginTop: "15px",
                                        border: "1px solid #dee2e6"
                                    }}>
                                        <div style={{ 
                                            fontSize: "12px", 
                                            fontWeight: "600", 
                                            color: "#666",
                                            marginBottom: "5px"
                                        }}>
                                            CURRENT JOB:
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                                Job #{activeJob.id}
                                            </span>
                                            <span style={{
                                                padding: "3px 8px",
                                                borderRadius: "12px",
                                                fontSize: "10px",
                                                fontWeight: "600",
                                                backgroundColor: getJobStatusColor(activeJob.status),
                                                color: "white"
                                            }}>
                                                {activeJob.status}
                                            </span>
                                        </div>
                                        {activeJob.assignedAt && (
                                            <div style={{ 
                                                fontSize: "12px", 
                                                color: "#666",
                                                marginTop: "5px"
                                            }}>
                                                Assigned: {new Date(activeJob.assignedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
