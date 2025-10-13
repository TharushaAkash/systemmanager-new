// src/components/Layout.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedNavigation from "./RoleBasedNavigation";
import InventoryItems from "./inventory";
import NewInventoryItem from "./NewInventoryItem";
import StockMoves from "./StockMoves";
import VehicleTypes from "./VehicleTypes";
import OperationsDashboard from "./OperationsDashboard";
import InvoiceList from "./InvoiceList";
import InvoiceDetail from "./InvoiceDetail";
import FinanceLedger from "./FinanceLedger";
import Bookings from "./Bookings";
import Customers from "./Customers";
import Vehicles from "./Vehicles";
import ServiceTypes from "./ServiceTypes";
import UserManagement from "./UserManagement";
import MyVehicles from "./MyVehicles";
import JobManagement from "./JobManagement";
import TechnicianDashboard from "./TechnicianDashboard";
import Technicians from "./Technicians";
import PendingJobs from "./PendingJobs";
import CurrentJobs from "./CurrentJobs";
import CustomerProfile from "./CustomerProfile";
import ServicesShowcase from "./ServicesShowcase";
import ServiceCenterBooking from "./ServiceCenterBooking";
import CustomerMyBookings from "./CustomerMyBookings";
import PaymentGateway from "./PaymentGateway";

function Home({ onNavigate }) {
    const { user, hasRole } = useAuth();
    
    const getRoleBasedContent = () => {
        if (hasRole("CUSTOMER")) {
            return {
                title: "Welcome to AutoFuel Lanka",
                subtitle: "Manage your fuel station visits, service appointments, and vehicles",
                icon: "🚗",
                color: "#3b82f6",
                buttons: [
                    { key: "my-vehicles", label: "My Vehicles", icon: "🚙", color: "blue" },
                    { key: "services", label: "Our Services", icon: "🔧", color: "green" },
                    { key: "service-booking", label: "Book Service", icon: "📅", color: "purple" },
                    { key: "my-bookings", label: "My Bookings", icon: "📋", color: "orange" }
                ]
            };
        } else if (hasRole("TECHNICIAN")) {
            return {
                title: "Technician Dashboard",
                subtitle: "Manage your assigned jobs and track work progress",
                icon: "🔧",
                color: "#8b5cf6",
                buttons: [
                    { key: "job-management", label: "Job Management", icon: "⚙️", color: "purple" },
                    { key: "current-jobs", label: "Current Jobs", icon: "📋", color: "blue" }
                ]
            };
        } else if (hasRole("STAFF")) {
            return {
                title: "Staff Management Dashboard",
                subtitle: "Complete CRUD operations for system management",
                icon: "👨‍💼",
                color: "#10b981",
                crudSections: [
                    {
                        title: "Inventory Management",
                        description: "Control inventory items and stock levels",
                        icon: "📦",
                        color: "#22c55e",
                        key: "inventory",
                        operations: ["Add Items", "View Inventory", "Update Stock", "Delete Items"]
                    },
                    {
                        title: "Booking Management",
                        description: "Handle customer bookings and appointments",
                        icon: "📅",
                        color: "#f59e0b",
                        key: "bookings",
                        operations: ["Create Bookings", "View Bookings", "Update Status", "Cancel Bookings"]
                    }
                ]
            };
        } else if (hasRole("MANAGER")) {
            return {
                title: "Manager Dashboard",
                subtitle: "Service and vehicle management operations",
                icon: "🤵",
                color: "#8b5cf6",
                crudSections: [
                    {
                        title: "Service Management",
                        description: "Manage service types, pricing, and offerings",
                        icon: "🔧",
                        color: "#a855f7",
                        key: "service-types",
                        operations: ["Create Services", "View Services", "Edit Services", "Delete Services"]
                    },
                    {
                        title: "Vehicle Management",
                        description: "Manage vehicle types and specifications",
                        icon: "🚗",
                        color: "#06b6d4",
                        key: "vehicles",
                        operations: ["Add Vehicle Types", "View Vehicles", "Update Specs", "Remove Types"]
                    }
                ]
            };
        } else if (hasRole("FINANCE")) {
            return {
                title: "Finance Dashboard",
                subtitle: "Invoice management, payments, and financial reporting",
                icon: "💰",
                color: "#f59e0b",
                buttons: [
                    { key: "invoices", label: "Manage Invoices", icon: "📄", color: "yellow" },
                    { key: "finance-ledger", label: "Finance Ledger", icon: "📊", color: "green" }
                ]
            };
        } else if (hasRole("ADMIN")) {
            return {
                title: "Admin Dashboard",
                subtitle: "Complete system administration and management",
                icon: "👑",
                color: "#ef4444",
                crudSections: [
                    {
                        title: "User Management",
                        description: "Manage all user accounts, roles, and permissions",
                        icon: "👥",
                        color: "#ef4444",
                        key: "user-management",
                        operations: ["Create Users", "View All Users", "Edit Roles", "Delete Users"]
                    },
                    {
                        title: "System Overview",
                        description: "Monitor system performance and operations",
                        icon: "📊",
                        color: "#3b82f6",
                        key: "operations-dashboard",
                        operations: ["View Reports", "System Stats", "Monitor Activity", "Generate Reports"]
                    },
                    {
                        title: "Customer Management",
                        description: "Oversee customer accounts and data",
                        icon: "👤",
                        color: "#0ea5e9",
                        key: "customers",
                        operations: ["View Customers", "Edit Accounts", "Manage Data", "Audit Trail"]
                    },
                    {
                        title: "Inventory Control",
                        description: "Supervise inventory and stock management",
                        icon: "📦",
                        color: "#22c55e",
                        key: "inventory",
                        operations: ["View Inventory", "Stock Reports", "Manage Items", "Audit Stock"]
                    },
                    {
                        title: "Booking Oversight",
                        description: "Monitor and manage all bookings",
                        icon: "📅",
                        color: "#f59e0b",
                        key: "bookings",
                        operations: ["View Bookings", "Manage Status", "Generate Reports", "Audit Bookings"]
                    },
                    {
                        title: "Service Management",
                        description: "Oversee service types and pricing",
                        icon: "🔧",
                        color: "#a855f7",
                        key: "service-types",
                        operations: ["View Services", "Edit Pricing", "Manage Types", "Audit Services"]
                    }
                ]
            };
        }
        return { 
            title: "AutoFuel Lanka", 
            subtitle: "Fuel & Service Management System", 
            icon: "⛽",
            color: "#6366f1",
            buttons: [] 
        };
    };

    const content = getRoleBasedContent();
    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "0",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
            
            {/* Header Section */}
            <div style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "20px 0"
            }}>
                <div style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{
                            fontSize: "2.5rem",
                            animation: "float 3s ease-in-out infinite"
                        }}>
                            {content.icon}
                        </div>
                        <div>
                            <h1 style={{
                                color: "white",
                                margin: "0",
                                fontSize: "1.8rem",
                                fontWeight: "700"
                            }}>
                                AutoFuel Lanka
                            </h1>
                            <p style={{
                                color: "rgba(255, 255, 255, 0.8)",
                                margin: "0",
                                fontSize: "0.9rem"
                            }}>
                                {currentDate} • {currentTime}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: "10px 20px",
                        borderRadius: "25px",
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        {user?.firstName ? `Welcome, ${user.firstName}!` : `Welcome, ${user?.role || 'User'}!`}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px"
            }}>
                {/* Welcome Card */}
                <div style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "20px",
                    padding: "40px",
                    marginBottom: "30px",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    animation: "fadeInUp 0.8s ease-out"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <div style={{
                            fontSize: "4rem",
                            marginBottom: "20px",
                            animation: "pulse 2s ease-in-out infinite"
                        }}>
                            {content.icon}
                        </div>
                        <h2 style={{
                            color: content.color,
                            margin: "0 0 10px 0",
                            fontSize: "2.5rem",
                            fontWeight: "700"
                        }}>
                            {content.title}
                        </h2>
                        <p style={{
                            color: "#6b7280",
                            fontSize: "1.2rem",
                            margin: "0",
                            lineHeight: "1.6"
                        }}>
                            {content.subtitle}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                        marginBottom: "30px"
                    }}>
                        <div style={{
                            background: `linear-gradient(135deg, ${content.color}20, ${content.color}10)`,
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: `2px solid ${content.color}30`
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>👤</div>
                            <div style={{ fontWeight: "600", color: content.color, marginBottom: "5px" }}>
                                {user?.role || 'User'}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Role</div>
                        </div>
                        <div style={{
                            background: `linear-gradient(135deg, ${content.color}20, ${content.color}10)`,
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: `2px solid ${content.color}30`
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📧</div>
                            <div style={{ fontWeight: "600", color: content.color, marginBottom: "5px", fontSize: "0.9rem" }}>
                                {user?.email || 'Not logged in'}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Email</div>
                        </div>
                        <div style={{
                            background: `linear-gradient(135deg, ${content.color}20, ${content.color}10)`,
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                            border: `2px solid ${content.color}30`
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🕐</div>
                            <div style={{ fontWeight: "600", color: content.color, marginBottom: "5px" }}>
                                {currentTime}
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Current Time</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {content.buttons && content.buttons.length > 0 && (
                    <div style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "30px",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        animation: "fadeInUp 0.8s ease-out 0.2s both"
                    }}>
                        <h3 style={{
                            color: "#1f2937",
                            margin: "0 0 25px 0",
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            textAlign: "center"
                        }}>
                            Quick Actions
                        </h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "20px"
                        }}>
                            {content.buttons.map((button, index) => (
                                <button
                                    key={button.key}
                                    onClick={() => onNavigate(button.key)}
                                    style={{
                                        background: `linear-gradient(135deg, ${getButtonColor(button.color)} 0%, ${getButtonColor(button.color, true)} 100%)`,
                                        color: "white",
                                        border: "none",
                                        borderRadius: "15px",
                                        padding: "20px",
                                        fontSize: "1rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        animation: `fadeInUp 0.8s ease-out ${0.3 + index * 0.1}s both`
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = "translateY(-5px)";
                                        e.target.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.2)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = "translateY(0)";
                                        e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem" }}>{button.icon}</span>
                                    <span>{button.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* CRUD Sections for STAFF */}
                {content.crudSections && content.crudSections.length > 0 && (
                    <div style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        padding: "30px",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        animation: "fadeInUp 0.8s ease-out 0.2s both"
                    }}>
                        <h3 style={{
                            color: "#1f2937",
                            margin: "0 0 30px 0",
                            fontSize: "1.8rem",
                            fontWeight: "700",
                            textAlign: "center"
                        }}>
                            🛠️ Staff CRUD Operations
                        </h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                            gap: "25px"
                        }}>
                            {content.crudSections.map((section, index) => (
                                <div
                                    key={section.key}
                                    onClick={() => onNavigate(section.key)}
                                    style={{
                                        background: `linear-gradient(135deg, ${section.color}10, ${section.color}05)`,
                                        border: `2px solid ${section.color}30`,
                                        borderRadius: "20px",
                                        padding: "25px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        animation: `fadeInUp 0.8s ease-out ${0.4 + index * 0.1}s both`
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = `0 15px 35px ${section.color}30`;
                                        e.currentTarget.style.borderColor = section.color;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.borderColor = `${section.color}30`;
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "15px"
                                    }}>
                                        <div style={{
                                            fontSize: "2.5rem",
                                            marginRight: "15px"
                                        }}>
                                            {section.icon}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                color: section.color,
                                                margin: "0 0 5px 0",
                                                fontSize: "1.3rem",
                                                fontWeight: "700"
                                            }}>
                                                {section.title}
                                            </h4>
                                            <p style={{
                                                color: "#6b7280",
                                                margin: "0",
                                                fontSize: "0.9rem"
                                            }}>
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "8px",
                                        marginTop: "15px"
                                    }}>
                                        {section.operations.map((operation, opIndex) => (
                                            <div
                                                key={opIndex}
                                                style={{
                                                    background: "rgba(255, 255, 255, 0.7)",
                                                    padding: "8px 12px",
                                                    borderRadius: "8px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "500",
                                                    color: section.color,
                                                    textAlign: "center",
                                                    border: `1px solid ${section.color}20`
                                                }}
                                            >
                                                {operation}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getButtonColor(color, isDark = false) {
    const colors = {
        blue: isDark ? "#1d4ed8" : "#3b82f6",
        green: isDark ? "#059669" : "#10b981",
        purple: isDark ? "#7c3aed" : "#8b5cf6",
        orange: isDark ? "#ea580c" : "#f59e0b",
        red: isDark ? "#dc2626" : "#ef4444",
        indigo: isDark ? "#4338ca" : "#6366f1",
        pink: isDark ? "#db2777" : "#ec4899",
        yellow: isDark ? "#d97706" : "#f59e0b"
    };
    return colors[color] || colors.blue;
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: "#6b7280" }}>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export default function Layout({ onNavigate }) {
    const [page, setPage] = useState("home");
    const [navigationParams, setNavigationParams] = useState({});
    const { user, hasRole, logout } = useAuth();

    // --- hash URL sync with role-based validation ---
    const DEFAULT_PAGE = "home";
    const readHash = () => (window.location.hash || "").replace(/^#\/?/, "") || DEFAULT_PAGE;
    const writeHash = (key) => {
        const h = `#/${key}`;
        if (window.location.hash !== h) window.history.pushState({}, "", h);
    };
    
    // Check if a page is accessible for the current user role
    const isPageAccessible = (pageKey) => {
        if (!user) return false;
        
        // Define role-based page access
        const rolePages = {
            'CUSTOMER': ['home', 'my-vehicles', 'services', 'service-booking', 'payment-gateway', 'my-bookings', 'profile'],
            'TECHNICIAN': ['home', 'job-management', 'current-jobs', 'technicians', 'pending-jobs'],
            'STAFF': ['home', 'user-management', 'customers', 'vehicles', 'bookings', 'service-types', 'inventory', 'inventory-new', 'inventory-moves', 'vehicle-types', 'operations-dashboard'],
            'MANAGER': ['home', 'operations-dashboard', 'service-types', 'vehicles'],
            'FINANCE': ['home', 'invoices', 'invoice-detail', 'finance-ledger'],
            'ADMIN': ['home', 'user-management', 'customers', 'vehicles', 'bookings', 'service-types', 'inventory', 'inventory-new', 'inventory-moves', 'vehicle-types', 'operations-dashboard', 'invoices', 'invoice-detail', 'finance-ledger']
        };
        
        const userPages = rolePages[user.role] || [];
        return userPages.includes(pageKey);
    };
    
    const navigateTo = (key, params = {}) => { 
        if (key) { 
            // Check if the page is accessible for the current user
            if (isPageAccessible(key)) {
                setPage(key); 
                setNavigationParams(params);
                writeHash(key); 
            } else {
                // Redirect to home if page is not accessible
                setPage('home');
                setNavigationParams({});
                writeHash('home');
            }
        } 
    };
    
    useEffect(() => {
        const currentHash = readHash();
        
        // If the current hash page is not accessible for the user's role, redirect to home
        if (!isPageAccessible(currentHash)) {
            setPage('home');
            writeHash('home');
        } else {
            setPage(currentHash);
        }
        
        const onChange = () => {
            const newHash = readHash();
            if (!isPageAccessible(newHash)) {
                setPage('home');
                writeHash('home');
            } else {
                setPage(newHash);
            }
        };
        
        window.addEventListener("popstate", onChange);
        window.addEventListener("hashchange", onChange);
        return () => {
            window.removeEventListener("popstate", onChange);
            window.removeEventListener("hashchange", onChange);
        };
    }, [user]); // Re-run when user changes
    // --- end hash sync ---

    // Check if user is admin for special layout
    const isAdmin = user?.role === "ADMIN";

    // Get role-specific styling
    const getRoleStyling = () => {
        const role = user?.role;
        switch (role) {
            case 'ADMIN':
                return {
                    icon: '👑',
                    title: 'Admin Panel',
                    color: '#667eea',
                    bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                    headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    accessText: 'Administrator Access'
                };
            case 'STAFF':
                return {
                    icon: '👨‍💼',
                    title: 'Staff Panel',
                    color: '#10b981',
                    bgGradient: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)',
                    headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    accessText: 'Staff Access'
                };
            case 'TECHNICIAN':
                return {
                    icon: '🔧',
                    title: 'Technician Panel',
                    color: '#8b5cf6',
                    bgGradient: 'linear-gradient(180deg, #581c87 0%, #6b21a8 100%)',
                    headerGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    accessText: 'Technician Access'
                };
            case 'FINANCE':
                return {
                    icon: '💰',
                    title: 'Finance Panel',
                    color: '#f59e0b',
                    bgGradient: 'linear-gradient(180deg, #92400e 0%, #b45309 100%)',
                    headerGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    accessText: 'Finance Access'
                };
            case 'CUSTOMER':
                return {
                    icon: '👤',
                    title: 'Customer Panel',
                    color: '#3b82f6',
                    bgGradient: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
                    headerGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    accessText: 'Customer Access'
                };
            default:
                return {
                    icon: '👤',
                    title: 'User Panel',
                    color: '#6b7280',
                    bgGradient: 'linear-gradient(180deg, #374151 0%, #4b5563 100%)',
                    headerGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    accessText: 'User Access'
                };
        }
    };

    const roleStyling = getRoleStyling();

    // Get role-specific navigation items (excluding customers)
    const getRoleNavigationItems = () => {
        const role = user?.role;
        switch (role) {
            case 'ADMIN':
                return [
                    {
                        title: "System Management",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
                            { key: "user-management", label: "User Management", icon: "👥", color: "#ef4444" },
                            { key: "customers", label: "Customer Management", icon: "👤", color: "#0ea5e9" },
                            { key: "operations-dashboard", label: "Operations Dashboard", icon: "📊", color: "#3b82f6" }
                        ]
                    },
                    {
                        title: "Business Operations",
                        items: [
                            { key: "inventory", label: "Inventory Management", icon: "📦", color: "#22c55e" },
                            { key: "bookings", label: "Booking Management", icon: "📅", color: "#f59e0b" },
                            { key: "service-types", label: "Service Management", icon: "🔧", color: "#a855f7" },
                            { key: "vehicles", label: "Vehicle Management", icon: "🚗", color: "#06b6d4" },
                            { key: "invoices", label: "Invoice Management", icon: "📄", color: "#f59e0b" },
                            { key: "finance-ledger", label: "Finance Ledger", icon: "💰", color: "#10b981" }
                        ]
                    }
                ];
            case 'STAFF':
                return [
                    {
                        title: "Operations Management",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
                            { key: "operations-dashboard", label: "Operations Dashboard", icon: "📊", color: "#3b82f6" },
                            { key: "inventory", label: "Inventory Management", icon: "📦", color: "#22c55e" },
                            { key: "bookings", label: "Booking Management", icon: "📅", color: "#f59e0b" }
                        ]
                    }
                ];
            case 'TECHNICIAN':
                return [
                    {
                        title: "Job Management",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
                            { key: "job-management", label: "Job Management", icon: "⚙️", color: "#8b5cf6" },
                            { key: "current-jobs", label: "Current Jobs", icon: "📋", color: "#3b82f6" },
                            { key: "pending-jobs", label: "Pending Jobs", icon: "⏳", color: "#f59e0b" },
                            { key: "technicians", label: "Technicians", icon: "👨‍🔧", color: "#10b981" }
                        ]
                    }
                ];
            case 'MANAGER':
                return [
                    {
                        title: "Management Operations",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
                            { key: "operations-dashboard", label: "Operations Dashboard", icon: "📊", color: "#3b82f6" },
                            { key: "service-types", label: "Service Management", icon: "🔧", color: "#a855f7" },
                            { key: "vehicles", label: "Vehicle Management", icon: "🚗", color: "#06b6d4" }
                        ]
                    }
                ];
            case 'FINANCE':
                return [
                    {
                        title: "Financial Management",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" },
                            { key: "invoices", label: "Invoice Management", icon: "📄", color: "#f59e0b" },
                            { key: "finance-ledger", label: "Finance Ledger", icon: "💰", color: "#10b981" }
                        ]
                    }
                ];
            default:
                return [
                    {
                        title: "Navigation",
                        items: [
                            { key: "home", label: "Dashboard", icon: "🏠", color: "#3b82f6" }
                        ]
                    }
                ];
        }
    };

    // Check if user is customer for different layout
    const isCustomer = user?.role === "CUSTOMER";

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {isCustomer ? (
                // Customer Layout - Traditional Header/Footer
                <>
                    <header className="app-header">
                        <div className="container header-inner">
                            <h1 className="brand">AutoFuel Lanka</h1>
                            <RoleBasedNavigation onNavigate={navigateTo} currentPage={page} />
                        </div>
                    </header>

                    <main style={{ flex: 1 }}>
                        {page === "home" && <Home onNavigate={navigateTo} />}
                        
                        {/* Customer Pages */}
                        {page === "my-vehicles" && <section className="section"><div className="container"><MyVehicles /></div></section>}
                        {page === "services" && <section className="section"><div className="container"><ProtectedRoute requiredRole="CUSTOMER"><ServicesShowcase onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "service-booking" && <section className="section"><div className="container"><ProtectedRoute requiredRole="CUSTOMER"><ServiceCenterBooking bookingType={navigationParams.bookingType || "SERVICE"} showTypeSelector={navigationParams.showTypeSelector !== false} onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "payment-gateway" && <section className="section"><div className="container"><ProtectedRoute requiredRole="CUSTOMER"><PaymentGateway bookingData={navigationParams.bookingData || navigationParams} onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "my-bookings" && <section className="section"><div className="container"><ProtectedRoute requiredRole="CUSTOMER"><CustomerMyBookings onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "profile" && <section className="section"><div className="container"><ProtectedRoute requiredRole="CUSTOMER"><CustomerProfile /></ProtectedRoute></div></section>}
                    </main>

                    <footer className="app-footer">
                        <div className="container footer-inner">
                            <small>© {new Date().getFullYear()} AutoFuel Lanka. All rights reserved.</small>
                        </div>
                    </footer>
                </>
            ) : (
                // Admin/Staff/Technician/Finance Layout - Sidebar
                <div style={{ display: "flex", minHeight: "100vh" }}>
                    {/* Sidebar */}
                    <div style={{
                        width: "280px",
                        background: roleStyling.bgGradient,
                        color: "white",
                        position: "fixed",
                        height: "100vh",
                        overflowY: "auto",
                        zIndex: 1000
                    }}>
                        {/* Role Header */}
                        <div style={{
                            padding: "2rem 1.5rem",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            background: roleStyling.headerGradient
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                <div style={{ fontSize: "2rem" }}>{roleStyling.icon}</div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700" }}>{roleStyling.title}</h2>
                                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>AutoFuel Lanka</p>
                                </div>
                            </div>
                            <div style={{
                                background: "rgba(255,255,255,0.1)",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                fontSize: "0.9rem"
                            }}>
                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>Welcome, {user?.email}</div>
                                <div style={{ opacity: 0.8, fontSize: "0.8rem" }}>{roleStyling.accessText}</div>
                            </div>
                        </div>

                    {/* Role-Specific Navigation */}
                    <nav style={{ 
                        padding: "1.5rem 0", 
                        display: "flex", 
                        flexDirection: "column", 
                        height: "calc(100vh - 200px)",
                        position: "relative"
                    }}>
                        <div style={{ flex: 1 }}>
                            {getRoleNavigationItems().map((section, sectionIndex) => (
                                <div key={sectionIndex}>
                                    <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
                                        <h3 style={{ 
                                            fontSize: "0.8rem", 
                                            fontWeight: "600", 
                                            color: "rgba(255,255,255,0.6)", 
                                            margin: "0 0 0.75rem 0",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            {section.title}
                                        </h3>
                                    </div>
                                    
                                    {section.items.map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => navigateTo(item.key)}
                                            style={{
                                                width: "100%",
                                                background: page === item.key 
                                                    ? `linear-gradient(135deg, ${item.color}, ${item.color}dd)` 
                                                    : "transparent",
                                                color: "white",
                                                border: "none",
                                                padding: "1rem 1.5rem",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.75rem",
                                                fontSize: "0.95rem",
                                                fontWeight: "500",
                                                borderLeft: page === item.key ? `4px solid ${item.color}` : "4px solid transparent"
                                            }}
                                            onMouseEnter={(e) => {
                                                if (page !== item.key) {
                                                    e.target.style.background = "rgba(255,255,255,0.1)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (page !== item.key) {
                                                    e.target.style.background = "transparent";
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Logout Button - At the bottom */}
                        <div style={{ 
                            marginTop: "auto",
                            padding: "1.5rem",
                            borderTop: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            <button
                                onClick={logout}
                                style={{
                                    width: "100%",
                                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                                    color: "white",
                                    border: "none",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                }}
                            >
                                <span>🚪</span>
                                Logout
                            </button>
                        </div>
                    </nav>
                    </div>

                {/* Main Content Area */}
                <div style={{ 
                    flex: 1, 
                    marginLeft: "280px",
                    background: "#f8fafc",
                    minHeight: "100vh"
                }}>
                    <main style={{ padding: "2rem" }}>
                        {/* Role-Specific Dashboard Content */}
                        {page === "home" && (
                            <div style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "2rem",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                            }}>
                                <h1 style={{ color: "#1a1a1a", margin: "0 0 1rem 0", fontSize: "2rem" }}>
                                    {roleStyling.icon} {roleStyling.title}
                                </h1>
                                <p style={{ color: "#666", margin: "0 0 2rem 0", fontSize: "1.1rem" }}>
                                    Welcome to the AutoFuel Lanka {roleStyling.title}. Manage your tasks and operations from here.
                                </p>
                                
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                    gap: "1.5rem"
                                }}>
                                    {getRoleNavigationItems()[0]?.items.slice(1, 5).map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                                                color: "white",
                                                padding: "1.5rem",
                                                borderRadius: "12px",
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease"
                                            }}
                                            onClick={() => navigateTo(item.key)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-5px)";
                                                e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}40`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{item.icon}</div>
                                            <h3 style={{ margin: "0 0 0.5rem 0" }}>{item.label}</h3>
                                            <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>
                                                {item.key === 'user-management' && 'Manage user accounts and permissions'}
                                                {item.key === 'inventory' && 'Track and manage inventory items'}
                                                {item.key === 'bookings' && 'Manage customer bookings and appointments'}
                                                {item.key === 'job-management' && 'Manage and track job assignments'}
                                                {item.key === 'invoices' && 'Handle invoice management and billing'}
                                                {item.key === 'my-vehicles' && 'Manage your registered vehicles'}
                                                {item.key === 'services' && 'Browse available services and pricing'}
                                                {item.key === 'operations-dashboard' && 'Monitor system operations and performance'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Role Pages (Non-Customer) */}
                        {/* Technician */}
                        {page === "job-management" && <section className="section"><div className="container"><ProtectedRoute requiredRole="TECHNICIAN"><JobManagement /></ProtectedRoute></div></section>}
                        {page === "current-jobs" && <section className="section"><div className="container"><ProtectedRoute requiredRole="TECHNICIAN"><CurrentJobs /></ProtectedRoute></div></section>}
                        {page === "technicians" && <section className="section"><div className="container"><ProtectedRoute requiredRole="TECHNICIAN"><Technicians /></ProtectedRoute></div></section>}
                        {page === "pending-jobs" && <section className="section"><div className="container"><ProtectedRoute requiredRole="TECHNICIAN"><PendingJobs /></ProtectedRoute></div></section>}

                        {/* Staff/Admin */}
                        {page === "user-management" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><UserManagement /></ProtectedRoute></div></section>}
                        {page === "customers" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><Customers /></ProtectedRoute></div></section>}
                        {page === "vehicles" && <section className="section"><div className="container"><ProtectedRoute requiredRole={["STAFF", "MANAGER"]}><Vehicles /></ProtectedRoute></div></section>}
                        {page === "bookings" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><Bookings /></ProtectedRoute></div></section>}
                        {page === "service-types" && <section className="section"><div className="container"><ProtectedRoute requiredRole={["STAFF", "MANAGER"]}><ServiceTypes /></ProtectedRoute></div></section>}
                        {page === "inventory" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><InventoryItems onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "inventory-new" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><NewInventoryItem onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "inventory-moves" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><StockMoves onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page === "vehicle-types" && <section className="section"><div className="container"><ProtectedRoute requiredRole="STAFF"><VehicleTypes /></ProtectedRoute></div></section>}
                        {page === "operations-dashboard" && <section className="section"><div className="container"><ProtectedRoute requiredRole={["STAFF", "MANAGER"]}><OperationsDashboard onNavigate={navigateTo} /></ProtectedRoute></div></section>}

                        {/* Finance */}
                        {page === "invoices" && <section className="section"><div className="container"><ProtectedRoute requiredRole="FINANCE"><InvoiceList onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                        {page.startsWith("invoice-detail-") && (
                            <section className="section"><div className="container">
                                <ProtectedRoute requiredRole="FINANCE">
                                    <InvoiceDetail invoiceId={parseInt(page.replace("invoice-detail-", ""))} onNavigate={navigateTo} />
                                </ProtectedRoute>
                            </div></section>
                        )}
                        {page === "finance-ledger" && <section className="section"><div className="container"><ProtectedRoute requiredRole="FINANCE"><FinanceLedger onNavigate={navigateTo} /></ProtectedRoute></div></section>}
                    </main>
                </div>
            </div>
            )}
        </div>
    );
}
