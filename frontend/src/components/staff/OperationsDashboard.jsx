import { useEffect, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = "http://localhost:8080";

export default function OperationsDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const loadSummary = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/reports/dashboard-summary`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSummary(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (reportType) => {
        try {
            const res = await fetch(`${API_BASE}/api/reports/${reportType}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${reportType}_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert("Error downloading report: " + e.message);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h1>Operations Manager Dashboard</h1>
                <button 
                    onClick={() => onNavigate && onNavigate("home")}
                    style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                >
                    Back to Home
                </button>
            </div>

            {loading ? (
                <p>Loading dashboard...</p>
            ) : err ? (
                <p style={{ color: "red" }}>Error: {err}</p>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                        gap: 20, 
                        marginBottom: 40 
                    }}>
                        <SummaryCard 
                            title="Inventory Items" 
                            value={summary?.totalInventoryItems || 0}
                            color="#007bff"
                            icon="📦"
                        />
                        <SummaryCard 
                            title="Low Stock Items" 
                            value={summary?.lowStockItems || 0}
                            color={summary?.lowStockItems > 0 ? "#dc3545" : "#28a745"}
                            icon="⚠️"
                        />
                        <SummaryCard 
                            title="Total Customers" 
                            value={summary?.totalCustomers || 0}
                            color="#17a2b8"
                            icon="👥"
                        />
                        <SummaryCard 
                            title="Total Bookings" 
                            value={summary?.totalBookings || 0}
                            color="#ffc107"
                            icon="📅"
                        />
                        <SummaryCard 
                            title="Vehicle Types" 
                            value={summary?.totalVehicleTypes || 0}
                            color="#6f42c1"
                            icon="🚗"
                        />
                    </div>

                    {/* Management Tools - Role-based */}
                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ 
                            color: "#1f2937", 
                            marginBottom: "25px", 
                            fontSize: "1.8rem", 
                            fontWeight: "600",
                            textAlign: "center"
                        }}>
                            {user?.role === "MANAGER" ? "🤵 Manager Management Tools" : "🛠️ Staff Management Tools"}
                        </h2>
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                            gap: "25px",
                            justifyContent: "center"
                        }}>
                            {user?.role === "MANAGER" ? (
                                <>
                                    <div style={{
                                        background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                                        padding: "30px",
                                        borderRadius: "15px",
                                        border: "2px solid #e9d5ff",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => onNavigate && onNavigate("service-types")}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-5px)";
                                        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                                        e.target.style.borderColor = "#a855f7";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.borderColor = "#e9d5ff";
                                    }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔧</div>
                                        <h3 style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "1.3rem" }}>Service Management</h3>
                                        <p style={{ color: "#6b7280", margin: "0", fontSize: "0.95rem" }}>
                                            Manage service types, pricing, and offerings
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                                        padding: "30px",
                                        borderRadius: "15px",
                                        border: "2px solid #e0f2fe",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => onNavigate && onNavigate("vehicles")}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-5px)";
                                        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                                        e.target.style.borderColor = "#06b6d4";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.borderColor = "#e0f2fe";
                                    }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🚗</div>
                                        <h3 style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "1.3rem" }}>Vehicle Management</h3>
                                        <p style={{ color: "#6b7280", margin: "0", fontSize: "0.95rem" }}>
                                            Manage vehicle types and specifications
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                        padding: "30px",
                                        borderRadius: "15px",
                                        border: "2px solid #dcfce7",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => onNavigate && onNavigate("inventory")}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-5px)";
                                        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                                        e.target.style.borderColor = "#22c55e";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.borderColor = "#dcfce7";
                                    }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📦</div>
                                        <h3 style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "1.3rem" }}>Inventory Management</h3>
                                        <p style={{ color: "#6b7280", margin: "0", fontSize: "0.95rem" }}>
                                            Manage inventory items, stock levels, and reorder points
                                        </p>
                                    </div>

                                    <div style={{
                                        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                        padding: "30px",
                                        borderRadius: "15px",
                                        border: "2px solid #fde68a",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => onNavigate && onNavigate("bookings")}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-5px)";
                                        e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                                        e.target.style.borderColor = "#f59e0b";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "none";
                                        e.target.style.borderColor = "#fde68a";
                                    }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📅</div>
                                        <h3 style={{ color: "#1f2937", margin: "0 0 10px 0", fontSize: "1.3rem" }}>Booking Management</h3>
                                        <p style={{ color: "#6b7280", margin: "0", fontSize: "0.95rem" }}>
                                            View and manage all customer bookings and appointments
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Reports Section - Role-based */}
                    <div>
                        <h2>Download Reports</h2>
                        <p style={{ color: "#6c757d", marginBottom: 20 }}>
                            Download comprehensive reports for analysis and record keeping
                        </p>
                        
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                            gap: 20,
                            justifyContent: "center"
                        }}>
                            {user?.role === "MANAGER" ? (
                                <>
                                    <ReportCard 
                                        title="Inventory Report"
                                        description="Complete inventory items with stock levels and reorder status"
                                        icon="📦"
                                        onDownload={() => downloadReport("inventory")}
                                        color="#007bff"
                                    />
                                    <ReportCard 
                                        title="Vehicle Types Report"
                                        description="All vehicle types with specifications and details"
                                        icon="🚗"
                                        onDownload={() => downloadReport("vehicle-types")}
                                        color="#06b6d4"
                                    />
                                </>
                            ) : (
                                <>
                                    <ReportCard 
                                        title="Inventory Report"
                                        description="Complete inventory items with stock levels and reorder status"
                                        icon="📦"
                                        onDownload={() => downloadReport("inventory")}
                                        color="#007bff"
                                    />
                                    <ReportCard 
                                        title="Bookings Report"
                                        description="All bookings with customer and service details"
                                        icon="📅"
                                        onDownload={() => downloadReport("bookings")}
                                        color="#ffc107"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Summary Card Component
function SummaryCard({ title, value, color, icon }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            textAlign: "center"
        }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color, marginBottom: 5 }}>
                {value}
            </div>
            <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>{title}</div>
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon, onClick, color }) {
    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 8,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #e9ecef",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderLeft: `4px solid ${color}`
            }}
            onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
            onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "1.5rem", marginRight: 10 }}>{icon}</span>
                <h3 style={{ margin: 0, color }}>{title}</h3>
            </div>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "0.9rem" }}>{description}</p>
        </div>
    );
}

// Report Card Component
function ReportCard({ title, description, icon, onDownload, color }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "1.5rem", marginRight: 10 }}>{icon}</span>
                <h3 style={{ margin: 0, color }}>{title}</h3>
            </div>
            <p style={{ margin: "0 0 15px 0", color: "#6c757d", fontSize: "0.9rem" }}>
                {description}
            </p>
            <button
                onClick={onDownload}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: color,
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "bold"
                }}
            >
                📥 Download CSV
            </button>
        </div>
    );
}
