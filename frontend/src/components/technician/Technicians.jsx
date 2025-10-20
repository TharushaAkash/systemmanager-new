import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function Technicians() {
    const { token } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ type: "", message: "" });
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        role: "TECHNICIAN",
        password: ""
    });
    const [fieldErrors, setFieldErrors] = useState({});

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/technicians`, { headers }),
                fetch(`${API_BASE}/api/jobs`, { headers })
            ];

            const [usersRes, jobsRes] = await Promise.all(requests);
            
            if (!usersRes.ok) throw new Error(`Technicians fetch failed: ${usersRes.status}`);
            if (!jobsRes.ok) throw new Error(`Jobs fetch failed: ${jobsRes.status}`);

            const [usersData, jobsData] = await Promise.all([
                usersRes.json(),
                jobsRes.json()
            ]);

            // usersData is already technicians list
            setTechnicians(usersData);
            setJobs(jobsData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setForm({
            id: null,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
            role: "TECHNICIAN",
            password: ""
        });
        setShowModal(true);
    };

    const openEditModal = (tech) => {
        setIsEdit(true);
        setForm({
            id: tech.id,
            firstName: tech.firstName || "",
            lastName: tech.lastName || "",
            email: tech.email || "",
            phone: tech.phone || "",
            address: tech.address || "",
            city: tech.city || "",
            postalCode: tech.postalCode || "",
            role: tech.role || "TECHNICIAN",
            password: ""
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (!saving) setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: "" }));
    };

    const saveTechnician = async () => {
        setSaving(true);
        setError("");
        setToast({ type: "", message: "" });
        // basic validation
        const emailOk = /.+@.+\..+/.test(form.email);
        const errors = {};
        if (!form.firstName) errors.firstName = "First name is required";
        if (!form.lastName) errors.lastName = "Last name is required";
        if (!emailOk) errors.email = "Enter a valid email";
        if (!isEdit && !form.password) errors.password = "Password is required";

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setSaving(false);
            return;
        }
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            if (isEdit) {
                const res = await fetch(`${API_BASE}/api/technicians/${form.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        firstName: form.firstName,
                        lastName: form.lastName,
                        email: form.email,
                        phone: form.phone,
                        address: form.address,
                        city: form.city,
                        postalCode: form.postalCode,
                        // only send password if provided
                        ...(form.password ? { password: form.password } : {})
                    })
                });
                if (!res.ok) throw new Error(`Update failed: ${res.status}`);
                setToast({ type: "success", message: "Technician updated" });
            } else {
                const res = await fetch(`${API_BASE}/api/technicians`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        firstName: form.firstName,
                        lastName: form.lastName,
                        email: form.email,
                        phone: form.phone,
                        address: form.address,
                        city: form.city,
                        postalCode: form.postalCode,
                        password: form.password
                    })
                });
                if (!res.ok) throw new Error(`Create failed: ${res.status}`);
                setToast({ type: "success", message: "Technician created" });
            }
            setShowModal(false);
            await loadData();
        } catch (e) {
            setError(e.message);
            setToast({ type: "error", message: e.message });
        } finally {
            setSaving(false);
        }
    };

    const deleteTechnician = async (id) => {
        if (!window.confirm('Delete this technician?')) return;
        setError("");
        setToast({ type: "", message: "" });
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${API_BASE}/api/technicians/${id}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            setToast({ type: "success", message: "Technician deleted" });
            await loadData();
        } catch (e) {
            setError(e.message);
            setToast({ type: "error", message: e.message });
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="btn btn-secondary"
                        onClick={loadData}
                    >
                        Refresh
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={openCreateModal}
                        style={{ boxShadow:'0 8px 20px rgba(26,115,232,0.25)' }}
                        onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; }}
                        onMouseLeave={(e)=>{ e.currentTarget.style.transform='translateY(0)'; }}
                    >
                        + Add Technician
                    </button>
                </div>
            </div>

            {(error || toast.message) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {error && (
                        <div style={{
                            background: "#ffebee",
                            color: "#c62828",
                            padding: "12px",
                            borderRadius: "8px"
                        }}>
                            {error}
                        </div>
                    )}
                    {toast.message && (
                        <div style={{
                            alignSelf: 'flex-end',
                            background: toast.type === 'success' ? '#e6ffed' : '#ffefef',
                            color: toast.type === 'success' ? '#1a7f37' : '#b00020',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                            {toast.message}
                        </div>
                    )}
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

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button className="btn btn-sm btn-primary" onClick={() => openEditModal(technician)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteTechnician(technician.id)}>Delete</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Simple Attractive Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)', 
                    zIndex: 1000,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '16px', 
                        width: '600px', 
                        maxWidth: '95vw', 
                        padding: '0',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
                        border: '1px solid #e1e5e9',
                        overflow: 'hidden'
                    }}>
                        {/* Simple Header */}
                        <div style={{ 
                            background: '#1a73e8',
                            padding: '24px',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                        {isEdit ? '✏️ Edit Technician' : '👨‍🔧 Add Technician'}
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                                        {isEdit ? 'Update technician details' : 'Create new technician account'}
                                    </p>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    disabled={saving}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        color: 'white',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div style={{ padding: '32px' }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '20px',
                                marginBottom: '24px'
                            }}>
                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        First Name *
                                    </label>
                                    <input 
                                        name="firstName" 
                                        value={form.firstName} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="Enter first name" 
                                    />
                                    {fieldErrors.firstName && (
                                        <div style={{ 
                                            color: '#ef4444', 
                                            fontSize: '12px', 
                                            marginTop: '4px'
                                        }}>
                                            {fieldErrors.firstName}
                                        </div>
                                    )}
                            </div>
                                
                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Last Name *
                                    </label>
                                    <input 
                                        name="lastName" 
                                        value={form.lastName} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="Enter last name" 
                                    />
                                    {fieldErrors.lastName && (
                                        <div style={{ 
                                            color: '#ef4444', 
                                            fontSize: '12px', 
                                            marginTop: '4px'
                                        }}>
                                            {fieldErrors.lastName}
                            </div>
                                    )}
                            </div>
                                
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Email Address *
                                    </label>
                                    <input 
                                        name="email" 
                                        type="email" 
                                        value={form.email} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="technician@example.com" 
                                    />
                                    {fieldErrors.email && (
                                        <div style={{ 
                                            color: '#ef4444', 
                                            fontSize: '12px', 
                                            marginTop: '4px'
                                        }}>
                                            {fieldErrors.email}
                                        </div>
                                    )}
                                </div>

                                {!isEdit && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ 
                                            fontSize: '14px', 
                                            color: '#374151', 
                                            fontWeight: '500',
                                            marginBottom: '8px',
                                            display: 'block'
                                        }}>
                                            Password *
                                        </label>
                                        <input 
                                            name="password" 
                                            type="password" 
                                            value={form.password} 
                                            onChange={handleChange} 
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                border: '2px solid #e5e7eb',
                                                outline: 'none',
                                                transition: 'border-color 0.2s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            placeholder="Minimum 6 characters" 
                                        />
                                        {fieldErrors.password && (
                                            <div style={{ 
                                                color: '#ef4444', 
                                                fontSize: '12px', 
                                                marginTop: '4px'
                                            }}>
                                                {fieldErrors.password}
                                            </div>
                                        )}
                                </div>
                            )}

                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Phone Number
                                    </label>
                                    <input 
                                        name="phone" 
                                        value={form.phone} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="0771234567" 
                                    />
                            </div>
                                
                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Role
                                    </label>
                                    <select 
                                        name="role" 
                                        value={form.role} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    >
                                        <option value="TECHNICIAN">Technician</option>
                                        <option value="STAFF">Staff</option>
                                </select>
                            </div>
                                
                            <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Address
                                    </label>
                                    <input 
                                        name="address" 
                                        value={form.address} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="Street address" 
                                    />
                            </div>
                                
                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        City
                                    </label>
                                    <input 
                                        name="city" 
                                        value={form.city} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="City" 
                                    />
                            </div>
                                
                            <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        color: '#374151', 
                                        fontWeight: '500',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Postal Code
                                    </label>
                                    <input 
                                        name="postalCode" 
                                        value={form.postalCode} 
                                        onChange={handleChange} 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            border: '2px solid #e5e7eb',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                        placeholder="Postal code" 
                                    />
                                </div>
                            </div>

                            {/* Simple Footer */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: '12px',
                                paddingTop: '16px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <button 
                                    onClick={closeModal} 
                                    disabled={saving}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: '2px solid #d1d5db',
                                        background: 'white',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#9ca3af';
                                        e.target.style.color = '#374151';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#d1d5db';
                                        e.target.style.color = '#6b7280';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveTechnician} 
                                    disabled={saving}
                                    style={{ 
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        background: '#1a73e8',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#1557b0';
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 8px rgba(26, 115, 232, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#1a73e8';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 4px rgba(26, 115, 232, 0.2)';
                                    }}
                                >
                                    {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Technician')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
