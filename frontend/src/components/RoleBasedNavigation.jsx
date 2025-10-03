import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

const API_BASE = "http://localhost:8080";

export default function RoleBasedNavigation({ onNavigate, currentPage }) {
    const { user, logout, hasRole, token } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);

    const loadPendingCount = async () => {
        if (user?.role === "TECHNICIAN" && token) {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const [bookingsRes, jobsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/bookings`, { headers }),
                    fetch(`${API_BASE}/api/jobs`, { headers })
                ]);

                if (bookingsRes.ok && jobsRes.ok) {
                    const [bookingsData, jobsData] = await Promise.all([
                        bookingsRes.json(),
                        jobsRes.json()
                    ]);

                    // Count bookings that don't have jobs assigned yet
                    const pending = bookingsData.filter(booking => 
                        !jobsData.some(job => job.bookingId === booking.id)
                    ).length;

                    setPendingCount(pending);
                }
            } catch (error) {
                console.error('Error loading pending count:', error);
            }
        }
    };

    useEffect(() => {
        loadPendingCount();
        // Refresh every 30 seconds
        const interval = setInterval(loadPendingCount, 30000);
        return () => clearInterval(interval);
    }, [user, token]);

    const getNavigationItems = () => {
        const items = [
            { key: "home", label: "Home", roles: ["CUSTOMER", "TECHNICIAN", "STAFF", "FINANCE"] }
        ];

        // Check exact role, not hierarchy
        if (user?.role === "CUSTOMER") {
            items.push(
                { key: "my-vehicles", label: "My Vehicles", roles: ["CUSTOMER"] },
                { key: "services", label: "Services", roles: ["CUSTOMER"] },
                { key: "my-bookings", label: "My Bookings", roles: ["CUSTOMER"] },
                { key: "profile", label: "Profile", roles: ["CUSTOMER"] }
            );
        }

        if (user?.role === "TECHNICIAN") {
            items.push(
                { key: "job-management", label: "Job Management", roles: ["TECHNICIAN"] },
                { key: "current-jobs", label: "Current Jobs", roles: ["TECHNICIAN"] },
                { key: "technicians", label: "Technicians", roles: ["TECHNICIAN"] },
                { 
                    key: "pending-jobs", 
                    label: pendingCount > 0 ? `🔔 Pending (${pendingCount})` : "Pending", 
                    roles: ["TECHNICIAN"],
                    hasPending: pendingCount > 0
                }
            );
        }

        // Staff: keep only Operations Dashboard in the top nav
        if (user?.role === "STAFF") {
            items.push(
                { key: "operations-dashboard", label: "Operations Dashboard", roles: ["STAFF"] }
            );
        }

        if (user?.role === "FINANCE") {
            items.push(
                { key: "invoices", label: "Invoices", roles: ["FINANCE"] },
                { key: "finance-ledger", label: "Finance Ledger", roles: ["FINANCE"] }
            );
        }

        if (user?.role === "ADMIN") {
            items.push(
                { key: "user-management", label: "User Management", roles: ["ADMIN"] },
                { key: "operations-dashboard", label: "Operations Dashboard", roles: ["ADMIN"] }
            );
        }

        return items;
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="nav">
            {navigationItems.map(item => (
                <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    style={{
                        background: currentPage === item.key ? '#007bff' : 
                                   (item.hasPending ? 'rgba(255, 193, 7, 0.2)' : 'transparent'),
                        color: currentPage === item.key ? 'white' : 
                               (item.hasPending ? '#ffc107' : 'inherit'),
                        border: item.hasPending ? '1px solid rgba(255, 193, 7, 0.3)' : 'none',
                        animation: item.hasPending ? 'pulse 2s infinite' : 'none'
                    }}
                >
                    {item.label}
                </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    {user?.email} ({user?.role})
                </span>
                <button
                    onClick={logout}
                    style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
