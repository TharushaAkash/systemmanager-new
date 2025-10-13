import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function CustomerDashboard({ onNavigate }) {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        totalSpent: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load bookings for stats
            const response = await fetch(`http://localhost:8080/api/customers/${user.id}/bookings`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            
            if (response.ok) {
                const bookings = await response.json();
                const completed = bookings.filter(b => b.status === 'COMPLETED').length;
                const pending = bookings.filter(b => b.status === 'PENDING' || b.status === 'IN_PROGRESS').length;
                
                setStats({
                    totalBookings: bookings.length,
                    completedBookings: completed,
                    pendingBookings: pending,
                    totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
                });
                
                setRecentBookings(bookings.slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #f0f8ff 100%)',
            position: 'relative'
        }}>
            {/* Background Pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 60%, rgba(29, 78, 216, 0.05) 0%, transparent 50%)
                `,
                pointerEvents: 'none'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Modern Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                    padding: '2rem 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Image */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(rgba(30, 64, 175, 0.8), rgba(59, 130, 246, 0.8)), url('https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&h=600&fit=crop') center/cover`,
                        filter: 'blur(1px)'
                    }}></div>
                    
                    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <h1 style={{ 
                                    color: 'white', 
                                    margin: '0 0 0.5rem 0', 
                                    fontSize: '2.5rem',
                                    fontWeight: '800',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    Welcome back, {user?.fullName || user?.email?.split('@')[0]}!
                </h1>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.1rem',
                                    margin: 0,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>
                                    Manage your fuel station visits, service appointments, and track your automotive journey
                                </p>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                padding: '1rem 1.5rem',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>
                                <div style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Current Time</div>
                                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { label: 'Total Bookings', value: stats.totalBookings, icon: '📋', color: '#3b82f6' },
                                { label: 'Completed', value: stats.completedBookings, icon: '✅', color: '#10b981' },
                                { label: 'Pending', value: stats.pendingBookings, icon: '⏳', color: '#f59e0b' },
                                { label: 'Total Spent', value: `Rs. ${stats.totalSpent.toLocaleString()}`, icon: '💰', color: '#8b5cf6' }
                            ].map((stat, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                                    <div style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
            </div>

                {/* Main Content */}
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        minHeight: '600px',
                        overflow: 'hidden',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                        <DashboardView stats={stats} recentBookings={recentBookings} loading={loading} onNavigate={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard View Component
function DashboardView({ stats, recentBookings, loading, onNavigate }) {

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        try {
            return new Date(dateTimeString).toLocaleString();
        } catch {
            return dateTimeString;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "COMPLETED": return "#10b981";
            case "CANCELLED": return "#ef4444";
            case "IN_PROGRESS": return "#f59e0b";
            case "PENDING": return "#6b7280";
            default: return "#3b82f6";
        }
    };

    if (loading) {
        return (
            <div style={{ 
                padding: "4rem", 
                textAlign: "center",
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Loading your dashboard...</h3>
                <p style={{ color: '#6b7280' }}>Please wait while we fetch your data</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '0' }}>
            {/* Service Categories Section */}
            <div style={{
                padding: '4rem 2rem', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                color: '#1e293b',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
                    opacity: 0.8
                }}></div>
                
                <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#1e293b',
                            margin: '0 0 1rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            Our Services
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#64748b',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Professional automotive solutions with cutting-edge technology
                        </p>
                    </div>

                    {/* Service Categories Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginBottom: '4rem'
                    }}>
                        {/* Auto Repairs Category */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            borderRadius: '20px',
                            padding: '2.5rem',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => onNavigate('service-booking')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f1f5f9)';
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(37, 99, 235, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>🔧</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: '700',
                                        margin: '0 0 0.5rem 0',
                                        color: '#1e293b'
                                    }}>
                                        Auto Repairs
                                    </h3>
                                    <p style={{
                                        color: '#64748b',
                                        margin: 0,
                                        fontSize: '0.9rem'
                                    }}>
                                        Professional repair services
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {['Engine Repair', 'Brake Service', 'Transmission', 'Suspension'].map((service, idx) => (
                                    <span key={idx} style={{
                                        background: '#2563eb',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '25px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        border: '1px solid #2563eb'
                                    }}>
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Auto Services Category */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            borderRadius: '20px',
                            padding: '2.5rem',
                            border: '2px solid #e2e8f0',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => onNavigate('fuel-booking')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f1f5f9)';
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(37, 99, 235, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>⛽</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: '700',
                                        margin: '0 0 0.5rem 0',
                                        color: '#1e293b'
                                    }}>
                                        Fuel Services
                                    </h3>
                                    <p style={{
                                        color: '#64748b',
                                        margin: 0,
                                        fontSize: '0.9rem'
                                    }}>
                                        Fuel station services
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {['Petrol', 'Diesel', 'Premium Fuel', 'Fuel Additives'].map((service, idx) => (
                                    <span key={idx} style={{
                                        background: '#2563eb',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '25px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        border: '1px solid #2563eb'
                                    }}>
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Icons Grid */}
            <div style={{ 
                padding: '4rem 2rem', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#1e293b',
                            margin: '0 0 1rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            Our Expertise
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#64748b',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Professional automotive solutions with cutting-edge technology
                        </p>
                    </div>

                    {/* Service Icons Grid with Images */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem'
                    }}>
                        {[
                            { 
                                icon: '🔑', 
                                name: 'Car Keys', 
                                description: 'Key programming & replacement',
                                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
                            },
                            { 
                                icon: '🧯', 
                                name: 'Safety Equipment', 
                                description: 'Fire safety & emergency tools',
                                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
                            },
                            { 
                                icon: '⛽', 
                                name: 'Fuel Services', 
                                description: 'Fuel system maintenance',
                                image: 'https://images.unsplash.com/photo-1644246905181-c3753e9a82bd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974?w=400&h=300&fit=crop'
                            },
                            { 
                                icon: '🏪', 
                                name: 'Gas Station', 
                                description: '24/7 fuel availability',
                                image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1174?w=400&h=300&fit=crop'
                            },
                            { 
                                icon: '🚗', 
                                name: 'Steering', 
                                description: 'Steering system repair',
                                image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
                            },
                            { 
                                icon: '⚙️', 
                                name: 'Transmission', 
                                description: 'Transmission service & repair',
                                image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'
                            }
                        ].map((service, index) => (
                            <div key={index} style={{
                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                borderRadius: '20px',
                                padding: '0',
                                textAlign: 'center',
                                border: '2px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => onNavigate('services')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.borderColor = '#2563eb';
                                e.currentTarget.style.boxShadow = '0 25px 50px rgba(37, 99, 235, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                            }}>
                                {/* Service Image Background */}
                                <div style={{
                                    height: '150px',
                                    background: `linear-gradient(rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.2)), url(${service.image}) center/cover`,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                        borderRadius: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>{service.icon}</span>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div style={{ padding: '1.5rem' }}>
                                    <h4 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        margin: '0 0 0.5rem 0'
                                    }}>
                                        {service.name}
                                    </h4>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '0.9rem',
                                        margin: 0,
                                        lineHeight: '1.4'
                                    }}>
                                        {service.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '2rem',
                borderTop: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: '700', 
                        color: '#1f2937', 
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        Recent Activity
                    </h2>
                    <p style={{ 
                        color: '#6b7280', 
                        textAlign: 'center', 
                        marginBottom: '2rem',
                        fontSize: '1.1rem'
                    }}>
                        Your latest bookings and transactions
                    </p>

                    {recentBookings.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '3rem', 
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No recent activity</h3>
                            <p style={{ color: '#6b7280' }}>Start by booking a fuel station visit or service appointment</p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gap: '1rem',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {recentBookings.map((booking, index) => (
                                <div key={booking.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                background: `linear-gradient(135deg, ${getStatusColor(booking.status)}, ${getStatusColor(booking.status)}dd)`,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                {booking.type === 'SERVICE' ? '🔧' : '⛽'}
                                            </div>
                                            <div>
                                                <h4 style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    margin: '0 0 0.25rem 0'
                                                }}>
                                                    {booking.type} Booking #{booking.id}
                                                </h4>
                                                <p style={{
                                                    color: '#6b7280',
                                                    fontSize: '0.9rem',
                                                    margin: 0
                                                }}>
                                                    {booking.serviceTypeId ? `Service ${booking.serviceTypeId}` : 
                                                     booking.fuelType ? `${booking.fuelType}${booking.litersRequested ? ` (${booking.litersRequested}L)` : ''}` : 'General Service'}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                backgroundColor: `${getStatusColor(booking.status)}20`,
                                                color: getStatusColor(booking.status),
                                                marginBottom: '0.5rem'
                                            }}>
                                                {booking.status}
                                            </div>
                                            <div style={{
                                                color: '#6b7280',
                                                fontSize: '0.85rem'
                                            }}>
                                                {formatDateTime(booking.startTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// My Bookings View Component
function MyBookingsView() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBookings = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`http://localhost:8080/api/customers/${user.id}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setBookings(data);
        } catch (err) {
            console.error("Error loading bookings:", err);
            setError(`Failed to load bookings: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            loadBookings();
        }
    }, [user, token]);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        try {
            return new Date(dateTimeString).toLocaleString();
        } catch {
            return dateTimeString;
        }
    };

    if (loading) {
        return (
            <div style={{ 
                padding: "4rem", 
                textAlign: "center",
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Loading your bookings...</h3>
                <p style={{ color: '#6b7280' }}>Please wait while we fetch your data</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: "2rem",
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                borderRadius: "12px",
                margin: "2rem",
                border: "1px solid #fecaca"
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <strong>Error</strong>
                </div>
                {error}
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "2rem" 
            }}>
                <h2 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: '700', 
                    color: '#1f2937',
                    margin: 0
                }}>
                    All My Bookings
                </h2>
                <button
                    onClick={loadBookings}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {bookings.length === 0 ? (
                <div style={{ 
                    textAlign: "center", 
                    padding: "4rem", 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '1.5rem' }}>No bookings found</h3>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        You haven't made any bookings yet. Use the tabs above to create fuel or service bookings.
                    </p>
                </div>
            ) : (
                <div style={{ 
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{
                        width: "100%",
                            borderCollapse: "collapse"
                    }}>
                        <thead>
                                <tr style={{ 
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderBottom: '2px solid rgba(59, 130, 246, 0.1)'
                                }}>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>ID</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Type</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Location</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Vehicle</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Service/Fuel</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Status</th>
                                    <th style={{ 
                                        padding: "1rem", 
                                        textAlign: "left", 
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>Start Time</th>
                            </tr>
                        </thead>
                        <tbody>
                                {bookings.map((booking, index) => (
                                    <tr key={booking.id} style={{ 
                                        borderBottom: index === bookings.length - 1 ? 'none' : "1px solid #f3f4f6",
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <td style={{ padding: "1rem", color: '#6b7280', fontWeight: '500' }}>#{booking.id}</td>
                                        <td style={{ padding: "1rem" }}>
                                        <span style={{
                                                padding: "0.5rem 1rem",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: '600',
                                                backgroundColor: booking.type === "SERVICE" ? "#dbeafe" : "#fef3c7",
                                                color: booking.type === "SERVICE" ? "#1e40af" : "#d97706"
                                        }}>
                                            {booking.type}
                                        </span>
                                    </td>
                                        <td style={{ padding: "1rem", color: '#374151' }}>Location {booking.locationId}</td>
                                        <td style={{ padding: "1rem", color: '#374151' }}>Vehicle {booking.vehicleId}</td>
                                        <td style={{ padding: "1rem", color: '#374151' }}>
                                        {booking.serviceTypeId ? `Service ${booking.serviceTypeId}` : 
                                         booking.fuelType ? `${booking.fuelType}${booking.litersRequested ? ` (${booking.litersRequested}L)` : ''}` : '-'}
                                    </td>
                                        <td style={{ padding: "1rem" }}>
                                        <span style={{
                                                padding: "0.5rem 1rem",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: '600',
                                            backgroundColor: 
                                                    booking.status === "COMPLETED" ? "#d1fae5" :
                                                    booking.status === "CANCELLED" ? "#fee2e2" :
                                                    booking.status === "IN_PROGRESS" ? "#fef3c7" :
                                                    "#f3f4f6",
                                            color: 
                                                    booking.status === "COMPLETED" ? "#065f46" :
                                                    booking.status === "CANCELLED" ? "#991b1b" :
                                                    booking.status === "IN_PROGRESS" ? "#d97706" :
                                                    "#374151"
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                        <td style={{ padding: "1rem", color: '#6b7280', fontSize: '0.9rem' }}>
                                            {formatDateTime(booking.startTime)}
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </div>
    );
}
