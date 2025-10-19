import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function CustomerProfile() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        postalCode: user?.postalCode || ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Initialize form with user data when component mounts or user changes
    useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                city: user.city || "",
                postalCode: user.postalCode || ""
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Create update data excluding email (since it can't be changed)
            const updateData = {
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone,
                address: profileForm.address,
                city: profileForm.city,
                postalCode: profileForm.postalCode
            };

            const response = await fetch(`${API_BASE}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            setSuccess("Profile updated successfully!");
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("New passwords don't match!");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError("New password must be at least 6 characters long!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/users/${user.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            setSuccess("Password updated successfully!");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordForm(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ color: "#1a73e8", margin: "0 0 10px 0", fontSize: "2rem" }}>
                    My Profile
                </h2>
                <p style={{ color: "#666", margin: 0 }}>
                    Manage your account information and security settings
                </p>
            </div>

            {error && (
                <div style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: "#e8f5e8",
                    color: "#2e7d32",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    {success}
                </div>
            )}

            {/* Profile Information */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <h3 style={{ color: "#1a73e8", marginBottom: "20px", fontSize: "1.3rem" }}>
                    Personal Information
                </h3>

                <form onSubmit={handleProfileUpdate}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginBottom: "20px"
                    }}>
                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profileForm.lastName}
                                onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Email <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "400" }}>(Cannot be changed)</span>
                            </label>
                            <input
                                type="email"
                                value={profileForm.email}
                                readOnly
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    backgroundColor: "#f8f9fa",
                                    color: "#6b7280",
                                    cursor: "not-allowed"
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                            Address
                        </label>
                        <input
                            type="text"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #e1e5e9",
                                borderRadius: "8px",
                                fontSize: "14px",
                                transition: "border-color 0.3s ease"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                        />
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "20px",
                        marginBottom: "25px"
                    }}>
                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                City
                            </label>
                            <input
                                type="text"
                                value={profileForm.city}
                                onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Postal Code
                            </label>
                            <input
                                type="text"
                                value={profileForm.postalCode}
                                onChange={(e) => setProfileForm({...profileForm, postalCode: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            padding: "12px 30px",
                            fontSize: "16px",
                            fontWeight: "600",
                            borderRadius: "8px"
                        }}
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </div>

            {/* Password Reset Section */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ color: "#1a73e8", margin: 0, fontSize: "1.3rem" }}>
                        Security Settings
                    </h3>
                    <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="btn"
                        style={{
                            background: "#dc3545",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none"
                        }}
                    >
                        {showPasswordForm ? "Cancel" : "Change Password"}
                    </button>
                </div>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordReset}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e1e5e9",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    transition: "border-color 0.3s ease"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                required
                            />
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                            marginBottom: "25px"
                        }}>
                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "2px solid #e1e5e9",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        transition: "border-color 0.3s ease"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "2px solid #e1e5e9",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        transition: "border-color 0.3s ease"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                    onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{
                                background: "#28a745",
                                color: "white",
                                padding: "12px 30px",
                                fontSize: "16px",
                                fontWeight: "600",
                                borderRadius: "8px",
                                border: "none"
                            }}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                {!showPasswordForm && (
                    <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
                        Keep your account secure by using a strong password and updating it regularly.
                    </p>
                )}
            </div>
        </div>
    );
}
