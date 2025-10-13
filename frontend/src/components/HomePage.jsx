import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage({ onNavigate }) {
    const { isAuthenticated } = useAuth();
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [inquiryForm, setInquiryForm] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
    });
    const [isScrolled, setIsScrolled] = useState(false);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Scroll effect for navigation
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const services = [
        {
            id: 1,
            name: "Brake Repair",
            description: "Complete brake system inspection, repair, and replacement services",
            price: 15000,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            features: ["Brake pad replacement", "Brake fluid check", "Safety testing"],
            duration: "2-3 hours"
        },
        {
            id: 2,
            name: "Full Body Painting",
            description: "Professional automotive painting with premium quality finish",
            price: 85000,
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
            features: ["Surface preparation", "Color matching", "Clear coat finish"],
            duration: "3-5 days"
        },
        {
            id: 3,
            name: "Engine Tune-Up",
            description: "Complete engine maintenance and performance optimization",
            price: 25000,
            image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
            features: ["Oil change", "Filter replacement", "Performance check"],
            duration: "3-4 hours"
        },
        {
            id: 4,
            name: "Tire Services",
            description: "Tire installation, balancing, and alignment services",
            price: 8000,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            features: ["Tire mounting", "Wheel balancing", "Alignment check"],
            duration: "1-2 hours"
        }
    ];

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Business Owner",
            content: "AutoFuel Lanka has been servicing my fleet for over 3 years. Their professionalism and quality of work is unmatched. Highly recommended!",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Taxi Driver",
            content: "Fast, reliable, and affordable service. They fixed my engine issues in no time and the pricing was very reasonable.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "Emma Rodriguez",
            role: "Teacher",
            content: "Excellent customer service and quality work. My car looks brand new after their painting service. Will definitely come back!",
            rating: 5,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        }
    ];

    const handleInquirySubmit = (e) => {
        e.preventDefault();
        // Handle inquiry submission
        alert('Thank you for your inquiry! We will contact you soon.');
        setInquiryForm({ name: '', email: '', phone: '', service: '', message: '' });
    };

    const handleServiceClick = (service) => {
        if (isAuthenticated()) {
            onNavigate('service-booking', { service });
        } else {
            onNavigate('login');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {/* Automotive Service Navigation Bar */}
            <nav style={{
                background: 'white',
                padding: '1rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                            fontSize: '1.5rem',
                            color: '#333'
                        }}>⚙️</div>
                        <h1 style={{ 
                            color: '#333', 
                            margin: 0, 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                        }}>
                            AutoFuel Lanka
                        </h1>
                    </div>

                    {/* Navigation Links */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            style={{
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                borderBottom: '2px solid #2563eb',
                                paddingBottom: '0.25rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >HOME</button>
                        <button 
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                color: '#333',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                transition: 'color 0.3s ease',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.color = '#333'}
                        >SERVICES</button>
                        <button 
                            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                color: '#333',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                transition: 'color 0.3s ease',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.color = '#333'}
                        >ABOUT</button>
                        <button 
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                color: '#333',
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                transition: 'color 0.3s ease',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.color = '#333'}
                        >CONTACT</button>
                    </div>

                    {/* Right Side Button */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => onNavigate('login')}
                            style={{
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#1d4ed8';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#2563eb';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'transparent',
                                color: '#2563eb',
                                border: '2px solid #2563eb',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#2563eb';
                                e.target.style.color = 'white';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#2563eb';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            GET A QUOTE
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Vehicle Background */}
            <section style={{
                background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&h=1080&fit=crop') center/cover`,
                padding: '8rem 0',
                color: 'white',
                position: 'relative',
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <div style={{ flex: '1', maxWidth: '600px' }}>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            letterSpacing: '2px',
                            marginBottom: '1rem',
                            color: '#f3f4f6'
                        }}>
                            BEST AUTO SERVICES
                        </div>
                    <h1 style={{
                            fontSize: '3.5rem',
                        fontWeight: '800',
                            margin: '0 0 2rem 0',
                        lineHeight: '1.1',
                            textShadow: '0 4px 8px rgba(0,0,0,0.5)'
                        }}>
                            Innovative Solutions<br />For Automobile
                    </h1>
                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '2px solid white',
                                padding: '1rem 2rem',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'white';
                            }}
                        >
                            LEARN MORE
                        </button>
                    </div>
                </div>
            </section>

            {/* White & Blue Service Categories Section */}
            <section style={{ 
                padding: '6rem 0', 
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
                
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
                    {/* Section Header */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '3rem',
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
                                    <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: '700',
                                        margin: '0 0 0.5rem 0',
                                        color: '#1e293b'
                                    }}>
                                        Auto Services
                                    </h3>
                                    <p style={{
                                        color: '#64748b',
                                        margin: 0,
                                        fontSize: '0.9rem'
                                    }}>
                                        Comprehensive maintenance
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {['Oil Change', 'Tire Service', 'AC Repair', 'Diagnostics'].map((service, idx) => (
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

                    {/* Service Icons Grid with Supercar Images */}
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
                                {/* Supercar Image Background */}
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
            </section>

            {/* Why Choose Us Section */}
            <section id="about" style={{ 
                padding: '6rem 0', 
                background: 'white'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                        {/* Left Side - Content */}
                        <div style={{ flex: '1' }}>
                            <div style={{ 
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                letterSpacing: '2px',
                                color: '#6b7280',
                                marginBottom: '1rem'
                            }}>
                                WHY CHOOSE US
                        </div>
                            <h2 style={{
                                fontSize: '3rem',
                                fontWeight: '800',
                                color: '#1f2937',
                                margin: '0 0 2rem 0',
                                lineHeight: '1.1'
                            }}>
                                We Offer A Complete<br />Diagnostic For Your Car
                            </h2>
                            <p style={{ 
                                fontSize: '1.1rem',
                                color: '#6b7280',
                                lineHeight: '1.7',
                                marginBottom: '2rem'
                            }}>
                                Vehicles are becoming ever more complex and challenging to repair. 
                                Our service has the upper hand in overcoming these challenges by 
                                pairing technology and innovation.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    'WE HAVE 24/7 EMERGENCY HOTLINE',
                                    'MOBILE DIAGNOSTIC SERVICE AT HOME',
                                    'MANAGE YOUR CAR ONLINE 24/7'
                                ].map((feature, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            color: '#2563eb',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}>✓</div>
                                        <span style={{
                                            color: '#374151',
                                            fontSize: '1rem',
                                            fontWeight: '500'
                                        }}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Vehicle Images */}
                        <div style={{ flex: '1', display: 'flex', gap: '1rem', position: 'relative' }}>
                            <div style={{
                                flex: '1',
                                height: '400px',
                                background: `url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=600&fit=crop') center/cover`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }} />
                            <div style={{
                                flex: '1',
                                height: '400px',
                                background: `url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=600&fit=crop') center/cover`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                marginTop: '2rem'
                            }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Dark Automotive Services Section */}
            <section id="services" style={{ 
                padding: '6rem 0', 
                background: '#0f0f0f',
                color: 'white',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    {/* Services Title */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: 'white',
                            margin: '0 0 1rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            OUR SERVICES
                        </h2>
                        <div style={{
                            width: '100px',
                            height: '3px',
                            background: '#2563eb',
                            margin: '0 auto'
                        }}></div>
                    </div>

                    {/* Tilted Service Panels */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginBottom: '4rem',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            {
                                name: 'PPF',
                                fullName: 'Paint Protection Film',
                                image: 'https://plus.unsplash.com/premium_photo-1664299618568-f1338781d7ad?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170?w=300&h=400&fit=crop',
                                description: 'Ultimate paint protection with self-healing film technology'
                            },
                            {
                                name: 'CERAMIC COATING',
                                fullName: 'Ceramic Coating',
                                image: 'https://plus.unsplash.com/premium_photo-1682142358040-cc602ecb0366?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1187?w=300&h=400&fit=crop',
                                description: 'Long-lasting protection with hydrophobic properties'
                            },
                            {
                                name: 'Tyre Service',
                                fullName: 'Tyre Service',
                                image: 'https://plus.unsplash.com/premium_photo-1663021813022-04dbaa414fee?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687?w=300&h=400&fit=crop',
                                description: 'Next-generation coating with superior durability'
                            },
                            {
                                name: 'Car Wash',
                                fullName: 'Car Wash',
                                image: 'https://images.unsplash.com/photo-1575844611398-2a68400b437c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1172?w=300&h=400&fit=crop',
                                description: 'Professional collision repair and bodywork services'
                            }
                        ].map((service, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '280px',
                                    height: '400px',
                                    background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${service.image}) center/cover`,
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    transform: 'rotate(2deg)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(37, 99, 235, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'rotate(2deg) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '2rem',
                                    left: '2rem',
                                    right: '2rem'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        margin: '0 0 0.5rem 0',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                        letterSpacing: '1px'
                                    }}>
                                        {service.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#e5e7eb',
                                        margin: 0,
                                        lineHeight: '1.4',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                    }}>
                                        {service.description}
                                    </p>
                                </div>
                                
                                    <div style={{
                                        position: 'absolute',
                                    bottom: '2rem',
                                    left: '2rem',
                                    right: '2rem'
                                }}>
                                    <button
                                        style={{
                                            width: '100%',
                                            background: 'rgba(37, 99, 235, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#2563eb';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(37, 99, 235, 0.9)';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Learn More
                                    </button>
                                    </div>
                            </div>
                        ))}
                    </div>

                    {/* Prominent Vehicle Showcase */}
                                    <div style={{
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '800px',
                            height: '500px',
                            background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&h=800&fit=crop') center/cover`,
                                        borderRadius: '20px',
                            margin: '0 auto',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                bottom: '3rem',
                                left: '3rem',
                                right: '3rem'
                            }}>
                                    <h3 style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '800',
                                    color: 'white',
                                        margin: '0 0 1rem 0',
                                    textShadow: '0 4px 8px rgba(0,0,0,0.8)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px'
                                    }}>
                                    Premium Automotive Care
                                    </h3>
                                    <p style={{
                                    fontSize: '1.2rem',
                                    color: '#e5e7eb',
                                    margin: '0 0 2rem 0',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                        lineHeight: '1.6'
                                    }}>
                                    Experience the ultimate in automotive protection and restoration services
                                </p>
                                <button
                                    style={{
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        padding: '1rem 2.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#1d4ed8';
                                        e.target.style.transform = 'translateY(-3px)';
                                        e.target.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#2563eb';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                                    }}
                                >
                                    Get Quote Now
                                </button>
                                </div>
                            </div>
                    </div>
                </div>
            </section>

            {/* Modern Testimonials Section with Carousel */}
            <section style={{ 
                padding: '6rem 0', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            color: '#1f2937',
                            margin: '0 0 1.5rem 0',
                            animation: 'fadeInUp 0.8s ease-out'
                        }}>
                            What Our Customers Say
                        </h2>
                        <p style={{
                            fontSize: '1.25rem',
                            color: '#4a5568',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.7',
                            animation: 'fadeInUp 0.8s ease-out 0.2s both'
                        }}>
                            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
                        </p>
                    </div>

                    <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(26, 115, 232, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            transform: `translateX(-${activeTestimonial * 100}%)`,
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: `${testimonials.length * 100}%`
                        }}>
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={testimonial.id}
                                    style={{
                                        width: `${100 / testimonials.length}%`,
                                        padding: '4rem 3rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '400px'
                                    }}
                                >
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        background: `url(${testimonial.image}) center/cover`,
                                        margin: '0 auto 2rem auto',
                                        border: '4px solid rgba(26, 115, 232, 0.1)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                        animation: 'pulse 2s ease-in-out infinite'
                                    }} />
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '2rem'
                                    }}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} style={{ 
                                                color: '#ffc107', 
                                                fontSize: '1.5rem',
                                                filter: 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))'
                                            }}>★</span>
                                        ))}
                                    </div>
                                    <p style={{
                                        color: '#4a5568',
                                        fontSize: '1.25rem',
                                        lineHeight: '1.7',
                                        margin: '0 0 2rem 0',
                                        fontStyle: 'italic',
                                        maxWidth: '600px',
                                        position: 'relative'
                                    }}>
                                        <span style={{
                                            fontSize: '3rem',
                                            color: '#1a73e8',
                                            position: 'absolute',
                                            top: '-1rem',
                                            left: '-2rem',
                                            opacity: 0.3
                                        }}>"</span>
                                        {testimonial.content}
                                        <span style={{
                                            fontSize: '3rem',
                                            color: '#1a73e8',
                                            position: 'absolute',
                                            bottom: '-2rem',
                                            right: '-1rem',
                                            opacity: 0.3
                                        }}>"</span>
                                    </p>
                                    <div>
                                        <h4 style={{
                                            color: '#1a1a1a',
                                            margin: '0 0 0.5rem 0',
                                            fontSize: '1.5rem',
                                            fontWeight: '700'
                                        }}>
                                            {testimonial.name}
                                        </h4>
                                        <p style={{
                                            color: '#1a73e8',
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontWeight: '600'
                                        }}>
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Carousel Navigation */}
                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '1rem'
                        }}>
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: index === activeTestimonial 
                                            ? 'linear-gradient(135deg, #1a73e8, #4285f4)' 
                                            : 'rgba(26, 115, 232, 0.3)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: index === activeTestimonial 
                                            ? '0 4px 15px rgba(26, 115, 232, 0.4)' 
                                            : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (index !== activeTestimonial) {
                                            e.target.style.background = 'rgba(26, 115, 232, 0.6)';
                                            e.target.style.transform = 'scale(1.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (index !== activeTestimonial) {
                                            e.target.style.background = 'rgba(26, 115, 232, 0.3)';
                                            e.target.style.transform = 'scale(1)';
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Inquiries Section */}
            <section id="inquiries" style={{ padding: '4rem 0', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0'
                        }}>
                            Have Questions?
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Send us your inquiries and we'll get back to you within 24 hours.
                        </p>
                    </div>

                    <div style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <form onSubmit={handleInquirySubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={inquiryForm.name}
                                        onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={inquiryForm.email}
                                        onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={inquiryForm.phone}
                                        onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                                        Service Interest
                                    </label>
                                    <select
                                        value={inquiryForm.service}
                                        onChange={(e) => setInquiryForm({...inquiryForm, service: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Select a service</option>
                                        <option value="brake-repair">Brake Repair</option>
                                        <option value="body-painting">Body Painting</option>
                                        <option value="engine-tuneup">Engine Tune-Up</option>
                                        <option value="tire-services">Tire Services</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                                    Message *
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={inquiryForm.message}
                                    onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Tell us about your requirements..."
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    background: '#1a73e8',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#1557b0';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#1a73e8';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Send Inquiry
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section id="contact" style={{ padding: '4rem 0', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0'
                        }}>
                            Contact Information
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Get in touch with us for any questions or to schedule your next service appointment.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📍</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Address</h3>
                            <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
                                123 Main Street<br />
                                Colombo 03, Sri Lanka<br />
                                Postal Code: 00300
                            </p>
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📞</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Phone</h3>
                            <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
                                +94 11 234 5678<br />
                                +94 77 123 4567<br />
                                Mon-Fri: 8AM-6PM
                            </p>
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✉️</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Email</h3>
                            <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
                                info@autofuellanka.com<br />
                                support@autofuellanka.com<br />
                                We respond within 24 hours
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                background: '#1f2937',
                color: 'white',
                padding: '3rem 0',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>⚙️</div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>AutoFuel Lanka</h3>
                    </div>
                    <p style={{ color: '#9ca3af', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                        Your trusted partner for premium automotive services
                    </p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                        © {new Date().getFullYear()} AutoFuel Lanka. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
