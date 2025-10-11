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
            {/* Modern Navigation Bar with Glassmorphism */}
            <nav style={{
                background: isScrolled 
                    ? 'rgba(26, 115, 232, 0.95)' 
                    : 'linear-gradient(135deg, #1a73e8, #4285f4)',
                backdropFilter: 'blur(20px)',
                padding: '1rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: isScrolled 
                    ? '0 8px 32px rgba(26, 115, 232, 0.3)' 
                    : '0 2px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            fontSize: '2rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                            animation: 'float 3s ease-in-out infinite'
                        }}>⛽</div>
                        <h1 style={{ 
                            color: 'white', 
                            margin: 0, 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            AutoFuel Lanka
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => document.getElementById('inquiries').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(10px)',
                                fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Inquiries
                        </button>
                        <button
                            onClick={() => onNavigate('login')}
                            style={{
                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                border: 'none',
                                color: '#1a73e8',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-3px)';
                                e.target.style.boxShadow = '0 12px 30px rgba(26, 115, 232, 0.3)';
                                e.target.style.background = 'linear-gradient(135deg, #ffffff, #e2e8f0)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                            }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Modern Hero Section with Animated Background */}
            <section style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #1a73e8 100%)',
                padding: '6rem 0',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    animation: 'float 20s linear infinite',
                    opacity: 0.3
                }} />
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)',
                    borderRadius: '50%',
                    animation: 'pulse 4s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-5%',
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.05), transparent)',
                    borderRadius: '50%',
                    animation: 'float 6s ease-in-out infinite reverse'
                }} />
                
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 2rem',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <h1 style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        margin: '0 0 1.5rem 0',
                        lineHeight: '1.1',
                        background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        animation: 'fadeInUp 1s ease-out'
                    }}>
                        Welcome to AutoFuel Lanka
                    </h1>
                    <p style={{
                        fontSize: '1.375rem',
                        margin: '0 auto 3rem auto',
                        opacity: 0.95,
                        maxWidth: '700px',
                        lineHeight: '1.6',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        animation: 'fadeInUp 1s ease-out 0.2s both'
                    }}>
                        Your trusted partner for premium automotive services. 
                        From fuel station management to comprehensive vehicle maintenance, 
                        we deliver excellence in every service.
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap',
                        animation: 'fadeInUp 1s ease-out 0.4s both'
                    }}>
                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                color: '#1a73e8',
                                border: 'none',
                                padding: '1.25rem 2.5rem',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                                e.target.style.boxShadow = '0 15px 35px rgba(26, 115, 232, 0.3)';
                                e.target.style.background = 'linear-gradient(135deg, #ffffff, #e2e8f0)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                            }}
                        >
                            🚀 Our Services
                        </button>
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                padding: '1.25rem 2.5rem',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                e.target.style.transform = 'translateY(-4px) scale(1.02)';
                                e.target.style.boxShadow = '0 15px 35px rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            📞 Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Modern Company Overview */}
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
                            background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 1.5rem 0',
                            animation: 'fadeInUp 0.8s ease-out'
                        }}>
                            About AutoFuel Lanka
                        </h2>
                        <p style={{
                            fontSize: '1.25rem',
                            color: '#4a5568',
                            maxWidth: '900px',
                            margin: '0 auto',
                            lineHeight: '1.7',
                            animation: 'fadeInUp 0.8s ease-out 0.2s both'
                        }}>
                            With over 15 years of experience in the automotive industry, 
                            AutoFuel Lanka has established itself as the leading provider 
                            of fuel station management and vehicle maintenance services in Sri Lanka.
                        </p>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2.5rem',
                        marginTop: '4rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            padding: '3rem 2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '1px solid rgba(26, 115, 232, 0.1)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 60px rgba(26, 115, 232, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.1)';
                        }}>
                            <div style={{ 
                                fontSize: '4rem', 
                                marginBottom: '1.5rem',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}>🏆</div>
                            <h3 style={{ 
                                color: '#1a73e8', 
                                margin: '0 0 1rem 0',
                                fontSize: '1.5rem',
                                fontWeight: '700'
                            }}>Excellence</h3>
                            <p style={{ 
                                color: '#4a5568', 
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '1.1rem'
                            }}>
                                Award-winning service quality with certified technicians and state-of-the-art equipment.
                            </p>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            padding: '3rem 2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '1px solid rgba(26, 115, 232, 0.1)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 60px rgba(26, 115, 232, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.1)';
                        }}>
                            <div style={{ 
                                fontSize: '4rem', 
                                marginBottom: '1.5rem',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                animation: 'pulse 2s ease-in-out infinite 0.5s'
                            }}>⚡</div>
                            <h3 style={{ 
                                color: '#1a73e8', 
                                margin: '0 0 1rem 0',
                                fontSize: '1.5rem',
                                fontWeight: '700'
                            }}>Speed</h3>
                            <p style={{ 
                                color: '#4a5568', 
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '1.1rem'
                            }}>
                                Fast and efficient service delivery without compromising on quality standards.
                            </p>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            padding: '3rem 2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '1px solid rgba(26, 115, 232, 0.1)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = '0 20px 60px rgba(26, 115, 232, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.1)';
                        }}>
                            <div style={{ 
                                fontSize: '4rem', 
                                marginBottom: '1.5rem',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                animation: 'pulse 2s ease-in-out infinite 1s'
                            }}>🛡️</div>
                            <h3 style={{ 
                                color: '#1a73e8', 
                                margin: '0 0 1rem 0',
                                fontSize: '1.5rem',
                                fontWeight: '700'
                            }}>Reliability</h3>
                            <p style={{ 
                                color: '#4a5568', 
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '1.1rem'
                            }}>
                                Trusted by thousands of customers with 99% satisfaction rate and comprehensive warranties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Services Section */}
            <section id="services" style={{ 
                padding: '6rem 0', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 1.5rem 0',
                            animation: 'fadeInUp 0.8s ease-out'
                        }}>
                            Our Services
                        </h2>
                        <p style={{
                            fontSize: '1.25rem',
                            color: '#4a5568',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.7',
                            animation: 'fadeInUp 0.8s ease-out 0.2s both'
                        }}>
                            Professional automotive services with expert technicians and quality guarantee. 
                            Login to book your service today.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                style={{
                                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(26, 115, 232, 0.1)',
                                    position: 'relative',
                                    animation: `fadeInUp 0.8s ease-out ${0.1 * index}s both`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(26, 115, 232, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(26, 115, 232, 0.1)';
                                }}
                                onClick={() => handleServiceClick(service)}
                            >
                                <div style={{
                                    height: '220px',
                                    background: `linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${service.image}) center/cover`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '25px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        boxShadow: '0 4px 15px rgba(26, 115, 232, 0.3)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        LKR {service.price.toLocaleString()}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '1.5rem',
                                        left: '1.5rem',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#1a73e8'
                                    }}>
                                        ⏱️ {service.duration}
                                    </div>
                                </div>
                                <div style={{ padding: '2rem' }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        margin: '0 0 1rem 0',
                                        lineHeight: '1.3'
                                    }}>
                                        {service.name}
                                    </h3>
                                    <p style={{
                                        color: '#4a5568',
                                        fontSize: '1rem',
                                        margin: '0 0 1.5rem 0',
                                        lineHeight: '1.6'
                                    }}>
                                        {service.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {service.features.map((feature, idx) => (
                                            <span key={idx} style={{
                                                background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
                                                color: '#1a73e8',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '15px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                border: '1px solid rgba(26, 115, 232, 0.1)'
                                            }}>
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        style={{
                                            width: '100%',
                                            background: isAuthenticated() 
                                                ? 'linear-gradient(135deg, #1a73e8, #4285f4)' 
                                                : 'linear-gradient(135deg, #6c757d, #5a6268)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '16px',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: isAuthenticated() ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isAuthenticated() 
                                                ? '0 8px 25px rgba(26, 115, 232, 0.3)' 
                                                : '0 4px 15px rgba(108, 117, 125, 0.3)'
                                        }}
                                        disabled={!isAuthenticated()}
                                        onMouseEnter={(e) => {
                                            if (isAuthenticated()) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 12px 35px rgba(26, 115, 232, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (isAuthenticated()) {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(26, 115, 232, 0.3)';
                                            }
                                        }}
                                    >
                                        {isAuthenticated() ? '🚀 Book Service' : '🔒 Login to Book'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section style={{ padding: '4rem 0', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0'
                        }}>
                            What Our Customers Say
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        overflowX: 'auto',
                        padding: '1rem 0',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                style={{
                                    minWidth: '350px',
                                    background: '#f8fafc',
                                    padding: '2rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: `url(${testimonial.image}) center/cover`,
                                    margin: '0 auto 1rem auto'
                                }} />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.25rem',
                                    marginBottom: '1rem'
                                }}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} style={{ color: '#ffc107', fontSize: '1.2rem' }}>★</span>
                                    ))}
                                </div>
                                <p style={{
                                    color: '#666',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    margin: '0 0 1rem 0',
                                    fontStyle: 'italic'
                                }}>
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <h4 style={{
                                        color: '#1a1a1a',
                                        margin: '0 0 0.25rem 0',
                                        fontSize: '1.1rem',
                                        fontWeight: '600'
                                    }}>
                                        {testimonial.name}
                                    </h4>
                                    <p style={{
                                        color: '#666',
                                        margin: 0,
                                        fontSize: '0.9rem'
                                    }}>
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        ))}
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
                background: '#1a1a1a',
                color: 'white',
                padding: '2rem 0',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>⛽</div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>AutoFuel Lanka</h3>
                    </div>
                    <p style={{ color: '#ccc', margin: '0 0 1rem 0' }}>
                        Your trusted partner for premium automotive services
                    </p>
                    <p style={{ color: '#999', margin: 0, fontSize: '0.9rem' }}>
                        © {new Date().getFullYear()} AutoFuel Lanka. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
