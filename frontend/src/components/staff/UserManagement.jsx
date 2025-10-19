import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = "http://localhost:8080";

export default function UserManagement() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'CUSTOMER',
        address: '',
        city: '',
        postalCode: ''
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users. Status: ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Password validation
        if (name === 'password') {
            if (value && value.length < 6) {
                setPasswordError('Password must be at least 6 characters long');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Password validation
        if (!editingUser && (!form.password || form.password.length < 6)) {
            setPasswordError('Password must be at least 6 characters long');
            setError('Password must be at least 6 characters long');
            return;
        }
        
        if (editingUser && form.password && form.password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            setError('Password must be at least 6 characters long');
            return;
        }
        
        // Clear password error if validation passes
        setPasswordError('');
        
        try {
            const url = editingUser ? `${API_BASE}/api/users/${editingUser.id}` : `${API_BASE}/api/users`;
            const method = editingUser ? 'PUT' : 'POST';

            // Build payload, skip empty password if editing
            const payload = { ...form };
            if (editingUser && !form.password) {
                delete payload.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let message = `Failed to save user. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) message = errorData.message;
                } catch {}
                throw new Error(message);
            }

            await fetchUsers();

            // Reset form
            setForm({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                role: 'CUSTOMER',
                address: '',
                city: '',
                postalCode: ''
            });
            setPasswordError('');
            setShowForm(false);
            setEditingUser(null);
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.message);
        }
    };

    const handleEdit = (user) => {
        setForm({
            email: user.email,
            password: '', // don't prefill password
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            role: user.role,
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postalCode || ''
        });
        setPasswordError('');
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            // First check if user has related bookings
            const bookingsResponse = await fetch(`${API_BASE}/api/bookings?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (bookingsResponse.ok) {
                const bookings = await bookingsResponse.json();
                if (bookings.length > 0) {
                    setError(`Cannot delete this user because they have ${bookings.length} associated booking(s). Please delete the bookings first.`);
                    return;
                }
            }

            // Proceed with deletion if no bookings exist
            const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                let message = `Failed to delete user. Status: ${response.status}`;

                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        message = errorData.message;

                        // Check for foreign key constraint errors
                        if (message.includes('foreign key constraint') ||
                            message.includes('1451') ||
                            message.includes('Cannot delete or update a parent row')) {
                            message = 'Cannot delete this user because they have associated bookings. Please delete the bookings first or reassign them to another user.';
                        }
                    }
                } catch (e) {
                    // If we can't parse JSON, check status text
                    if (response.statusText) {
                        message = response.statusText;
                    }
                }

                throw new Error(message);
            }

            await fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setForm({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'CUSTOMER',
            address: '',
            city: '',
            postalCode: ''
        });
        setShowForm(false);
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' || user.role === filter;
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ 
            padding: "24px", 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
            maxWidth: 1400, 
            margin: "0 auto",
            backgroundColor: "#f8fafc",
            minHeight: "100vh"
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            {/* Header Section */}
            <div style={{ 
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                color: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: "2.5rem", 
                    fontWeight: "700",
                    background: "linear-gradient(45deg, #fff, #e0e7ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    👥 User Management
                </h1>
                <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                    Manage user accounts and permissions
                </p>
            </div>

            {/* Statistics Cards */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "20px", 
                marginBottom: "32px" 
            }}>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'CUSTOMER').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Customers</div>
                </div>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'STAFF').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Staff</div>
                </div>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#8b5cf6", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'TECHNICIAN').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Technicians</div>
                </div>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'FINANCE').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Finance</div>
                </div>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#dc2626", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'MANAGER').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Managers</div>
                </div>
                <div style={{ 
                    background: "white", 
                    padding: "24px", 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444", marginBottom: "8px" }}>
                        {users.filter(u => u.role === 'ADMIN').length}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>Admins</div>
                </div>
            </div>

            {/* Filters and Search */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "1.25rem", fontWeight: "600" }}>
                    🔍 Search & Filter
                </h3>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                    gap: "20px",
                    alignItems: "end"
                }}>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Filter by Role
                        </label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        >
                            <option value="all">All Users</option>
                            <option value="ADMIN">👑 Admins</option>
                            <option value="STAFF">👨‍💼 Staff</option>
                            <option value="TECHNICIAN">🔧 Technicians</option>
                            <option value="FINANCE">💰 Finance</option>
                            <option value="CUSTOMER">👤 Customers</option>
                            <option value="MANAGER">🤵 Manager</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Search Users
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Search by email or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px 12px 40px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                            <span style={{ 
                                position: "absolute", 
                                left: "12px", 
                                top: "50%", 
                                transform: "translateY(-50%)",
                                color: "#9ca3af"
                            }}>
                                🔍
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <button 
                            onClick={() => {
                                setShowForm(true);
                                setPasswordError('');
                                setEditingUser(null);
                            }}
                            style={{ 
                                width: "100%",
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(99, 102, 241, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(99, 102, 241, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(99, 102, 241, 0.3)";
                            }}
                        >
                            ➕ Add New User
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ 
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "1.25rem", fontWeight: "600" }}>
                        {editingUser ? "✏️ Edit User" : "➕ Add New User"}
                    </h3>
                    
                    <form onSubmit={handleSubmit} style={{ 
                        display: "grid", 
                        gap: "20px", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
                    }}>
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="user@example.com"
                                value={form.email}
                                onChange={handleInputChange}
                                required
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Password {editingUser ? "(leave blank to keep current)" : "*"}
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password (min 6 characters)"
                                value={form.password}
                                onChange={handleInputChange}
                                required={!editingUser}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: `2px solid ${passwordError ? "#ef4444" : "#e2e8f0"}`, 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none",
                                    backgroundColor: passwordError ? "#fef2f2" : "white"
                                }}
                                onFocus={(e) => e.target.style.borderColor = passwordError ? "#ef4444" : "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = passwordError ? "#ef4444" : "#e2e8f0"}
                            />
                            {passwordError && (
                                <div style={{
                                    color: "#ef4444",
                                    fontSize: "0.75rem",
                                    marginTop: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}>
                                    ⚠️ {passwordError}
                                </div>
                            )}
                            {form.password && form.password.length >= 6 && (
                                <div style={{
                                    color: "#22c55e",
                                    fontSize: "0.75rem",
                                    marginTop: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}>
                                    ✅ Password is valid
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="John"
                                value={form.firstName}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Doe"
                                value={form.lastName}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+1 (555) 123-4567"
                                value={form.phone}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Role *
                            </label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleInputChange}
                                required
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            >
                                <option value="CUSTOMER">👤 Customer</option>
                                <option value="STAFF">👨‍💼 Staff</option>
                                <option value="TECHNICIAN">🔧 Technician</option>
                                <option value="FINANCE">💰 Finance</option>
                                <option value="ADMIN">👑 Admin</option>
                                <option value="MANAGER">🤵 Manager</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                placeholder="123 Main St"
                                value={form.address}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                placeholder="New York"
                                value={form.city}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div>
                            <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "500", 
                                color: "#374151",
                                fontSize: "0.875rem"
                            }}>
                                Postal Code
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                placeholder="10001"
                                value={form.postalCode}
                                onChange={handleInputChange}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        
                        <div style={{ 
                            gridColumn: "1 / -1", 
                            display: "flex", 
                            gap: "12px", 
                            justifyContent: "flex-end",
                            marginTop: "10px"
                        }}>
                            <button 
                                type="submit"
                                style={{ 
                                    padding: "12px 24px", 
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 6px rgba(99, 102, 241, 0.3)"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 6px 12px rgba(99, 102, 241, 0.4)";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 4px 6px rgba(99, 102, 241, 0.3)";
                                }}
                            >
                                {editingUser ? "💾 Update User" : "➕ Create User"}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                style={{ 
                                    padding: "12px 24px", 
                                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                }}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    padding: "60px 20px",
                    textAlign: "center",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ 
                        width: "50px", 
                        height: "50px", 
                        border: "4px solid #e2e8f0", 
                        borderTop: "4px solid #6366f1", 
                        borderRadius: "50%", 
                        animation: "spin 1s linear infinite",
                        marginBottom: "20px"
                    }}></div>
                    <p style={{ 
                        fontSize: "1.1rem", 
                        color: "#6b7280", 
                        margin: 0,
                        fontWeight: "500"
                    }}>
                        Loading users...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{ 
                    padding: "16px", 
                    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", 
                    color: "#dc2626", 
                    marginBottom: "24px",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                }}>
                    <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                    <span style={{ fontWeight: "500" }}>Error: {error}</span>
                </div>
            )}

            {/* Users Table */}
            {!loading && !error && (
                <div style={{ 
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    border: "1px solid #e2e8f0"
                }}>
                    {filteredUsers.length === 0 ? (
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            padding: "60px 20px",
                            textAlign: "center"
                        }}>
                            <div style={{ 
                                fontSize: "3rem", 
                                marginBottom: "16px"
                            }}>👥</div>
                            <p style={{ 
                                color: "#6b7280", 
                                fontSize: "1.1rem",
                                fontWeight: "500",
                                margin: 0
                            }}>
                                No users found matching your criteria.
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ 
                                width: "100%", 
                                borderCollapse: "separate", 
                                borderSpacing: "0",
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        color: "white"
                                    }}>
                                        <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                                        <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                                        <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</th>
                                        <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                                        <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</th>
                                        <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr 
                                            key={user.id}
                                            style={{ 
                                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                                                borderBottom: "1px solid #e2e8f0",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
                                            }}
                                        >
                                            <td style={{ 
                                                padding: "16px", 
                                                fontWeight: "500", 
                                                color: "#374151",
                                                fontFamily: "monospace",
                                                fontSize: "0.9rem"
                                            }}>
                                                {user.email}
                                            </td>
                                            <td style={{ 
                                                padding: "16px", 
                                                fontWeight: "500", 
                                                color: "#1e293b"
                                            }}>
                                                {user.firstName && user.lastName 
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : "N/A"
                                                }
                                            </td>
                                            <td style={{ 
                                                padding: "16px", 
                                                color: "#6b7280",
                                                fontSize: "0.9rem"
                                            }}>
                                                {user.phone || "N/A"}
                                            </td>
                                            <td style={{ padding: "16px", textAlign: "center" }}>
                                                <span style={{ 
                                                    background: user.role === "ADMIN" ? "#fef2f2" : 
                                                              user.role === "MANAGER" ? "#fef3c7" :
                                                              user.role === "STAFF" ? "#eff6ff" : 
                                                              user.role === "TECHNICIAN" ? "#f3e8ff" :
                                                              user.role === "FINANCE" ? "#fef3c7" : "#f0fdf4",
                                                    color: user.role === "ADMIN" ? "#dc2626" : 
                                                          user.role === "MANAGER" ? "#92400e" :
                                                          user.role === "STAFF" ? "#1d4ed8" : 
                                                          user.role === "TECHNICIAN" ? "#7c3aed" :
                                                          user.role === "FINANCE" ? "#92400e" : "#166534",
                                                    padding: "4px 12px", 
                                                    borderRadius: "20px", 
                                                    fontSize: "0.75rem",
                                                    fontWeight: "600"
                                                }}>
                                                    {user.role === "ADMIN" ? "👑" : 
                                                     user.role === "MANAGER" ? "🤵" :
                                                     user.role === "STAFF" ? "👨‍💼" : 
                                                     user.role === "TECHNICIAN" ? "🔧" :
                                                     user.role === "FINANCE" ? "💰" : "👤"} {user.role}
                                                </span>
                                            </td>
                                            <td style={{ 
                                                padding: "16px", 
                                                color: "#6b7280",
                                                fontSize: "0.9rem"
                                            }}>
                                                {user.city && user.postalCode 
                                                    ? `${user.city}, ${user.postalCode}`
                                                    : "N/A"
                                                }
                                            </td>
                                            <td style={{ padding: "16px", textAlign: "center" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        style={{ 
                                                            padding: "6px 12px", 
                                                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                                            color: "white", 
                                                            border: "none", 
                                                            borderRadius: "6px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                        onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        style={{ 
                                                            padding: "6px 12px", 
                                                            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                                            color: "white", 
                                                            border: "none", 
                                                            borderRadius: "6px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "500",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                        onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
