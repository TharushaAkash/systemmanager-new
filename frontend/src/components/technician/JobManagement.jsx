import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function JobManagement() {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");

    const [form, setForm] = useState({
        bookingId: "",
        technicianId: "",
        notes: "",
        status: "QUEUED"
    });

    const jobStatuses = ["QUEUED", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"];

    // Load all necessary data
    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/jobs`, { headers }),
                fetch(`${API_BASE}/api/bookings`, { headers }),
                fetch(`${API_BASE}/api/technicians`, { headers })
            ];

            const [jobsRes, bookingsRes, techniciansRes] = await Promise.all(requests);
            
            if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);
            if (!bookingsRes.ok) throw new Error(`Bookings fetch failed: ${bookingsRes.status}`);
            if (!techniciansRes.ok) throw new Error(`Technicians fetch failed: ${techniciansRes.status}`);

            const [jobsData, bookingsData, techniciansData] = await Promise.all([
                jobsRes.json(),
                bookingsRes.json(),
                techniciansRes.json()
            ]);

            setJobs(jobsData);
            setBookings(bookingsData);
            // Only technicians should appear in the dropdown
            setTechnicians(techniciansData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            bookingId: "",
            technicianId: "",
            notes: "",
            status: "QUEUED"
        });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            let response;
            if (editId) {
                // Update existing job
                const updateData = {
                    notes: form.notes
                };
                response = await fetch(`${API_BASE}/api/jobs/${editId}?status=${form.status}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(updateData)
                });
            } else {
                // Create new job
                response = await fetch(`${API_BASE}/api/jobs`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(form)
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            resetForm();
            loadData();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleEdit = (job) => {
        setForm({
            bookingId: job.bookingId,
            technicianId: job.technicianId,
            notes: job.notes || "",
            status: job.status
        });
        setEditId(job.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this job?")) return;

        try {
            const response = await fetch(`${API_BASE}/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            loadData();
        } catch (e) {
            setError(e.message);
        }
    };

    const getBookingDisplay = (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return `Booking #${bookingId}`;
        return `${booking.type} - ${booking.customerEmail || 'Customer'} (${new Date(booking.startTime).toLocaleDateString()})`;
    };

    const getTechnicianName = (technicianId) => {
        const tech = technicians.find(t => t.id === technicianId);
        return tech ? (tech.firstName && tech.lastName ? `${tech.firstName} ${tech.lastName}` : tech.email) : `Technician #${technicianId}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'QUEUED': return '#6c757d';
            case 'IN_PROGRESS': return '#007bff';
            case 'BLOCKED': return '#dc3545';
            case 'DONE': return '#28a745';
            case 'CANCELLED': return '#6c757d';
            default: return '#6c757d';
        }
    };

    // Filter jobs based on status
    const filteredJobs = filterStatus 
        ? jobs.filter(job => job.status === filterStatus)
        : jobs;

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <div>Loading job management...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#1a73e8" }}>Job Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "Assign New Job"}
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

            {showForm && (
                <div style={{
                    background: "#f8f9fa",
                    padding: "20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    border: "1px solid #dee2e6"
                }}>
                    <h3>{editId ? "Update Job" : "Assign New Job"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginBottom: "15px" }}>
                            {!editId && (
                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>
                                        Booking:
                                    </label>
                                    <select
                                        value={form.bookingId}
                                        onChange={(e) => setForm({...form, bookingId: e.target.value})}
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            fontSize: "14px"
                                        }}
                                        required
                                    >
                                        <option value="">Select Booking</option>
                                        {bookings
                                            .filter(booking => !jobs.some(job => job.bookingId === booking.id))
                                            .map(booking => (
                                            <option key={booking.id} value={booking.id}>
                                                {getBookingDisplay(booking.id)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>
                                    Technician:
                                </label>
                                <select
                                    value={form.technicianId}
                                    onChange={(e) => setForm({...form, technicianId: e.target.value})}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                        fontSize: "14px"
                                    }}
                                    required
                                    disabled={editId} // Don't allow changing technician when editing
                                >
                                    <option value="">Select Technician</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {getTechnicianName(tech.id)} ({tech.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {editId && (
                                <div>
                                    <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>
                                        Status:
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({...form, status: e.target.value})}
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            fontSize: "14px"
                                        }}
                                    >
                                        {jobStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>
                                Notes:
                            </label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({...form, notes: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    minHeight: "80px",
                                    resize: "vertical"
                                }}
                                placeholder="Add any notes about this job..."
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button type="submit" className="btn btn-primary">
                                {editId ? "Update Job" : "Assign Job"}
                            </button>
                            <button type="button" className="btn" onClick={resetForm} style={{ background: "#6c757d", color: "white" }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", marginRight: "10px" }}>Filter by Status:</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: "6px 12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        fontSize: "14px"
                    }}
                >
                    <option value="">All Statuses</option>
                    {jobStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Jobs Table */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                {filteredJobs.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                        {filterStatus ? `No jobs found with status: ${filterStatus}` : "No jobs assigned yet."}
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa" }}>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Job ID
                                </th>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Booking Details
                                </th>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Technician
                                </th>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Status
                                </th>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Assigned
                                </th>
                                <th style={{ padding: "15px", textAlign: "left", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Notes
                                </th>
                                <th style={{ padding: "15px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job, index) => (
                                <tr key={job.id} style={{
                                    background: index % 2 === 0 ? "white" : "#f8f9fa"
                                }}>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6" }}>
                                        #{job.id}
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6" }}>
                                        {getBookingDisplay(job.bookingId)}
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6" }}>
                                        {job.technicianName || getTechnicianName(job.technicianId)}
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6" }}>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            backgroundColor: getStatusColor(job.status),
                                            color: "white"
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6" }}>
                                        {job.assignedAt ? new Date(job.assignedAt).toLocaleString() : "N/A"}
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6", maxWidth: "200px" }}>
                                        <div style={{ 
                                            overflow: "hidden", 
                                            textOverflow: "ellipsis", 
                                            whiteSpace: "nowrap",
                                            fontSize: "13px"
                                        }}>
                                            {job.notes || "No notes"}
                                        </div>
                                    </td>
                                    <td style={{ padding: "15px", borderBottom: "1px solid #dee2e6", textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                                            <button
                                                onClick={() => handleEdit(job)}
                                                style={{
                                                    padding: "6px 12px",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    background: "#007bff",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                style={{
                                                    padding: "6px 12px",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    background: "#dc3545",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "12px"
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Summary Stats */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                marginTop: "20px"
            }}>
                {jobStatuses.map(status => {
                    const count = jobs.filter(job => job.status === status).length;
                    return (
                        <div
                            key={status}
                            style={{
                                background: "white",
                                padding: "15px",
                                borderRadius: "8px",
                                textAlign: "center",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                border: `2px solid ${getStatusColor(status)}`
                            }}
                        >
                            <div style={{ fontSize: "24px", fontWeight: "bold", color: getStatusColor(status) }}>
                                {count}
                            </div>
                            <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                                {status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
