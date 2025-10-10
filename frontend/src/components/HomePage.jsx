import { useState } from 'react';
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
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navigation Bar */}
            <nav style={{
                background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                padding: '1rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                        <div style={{ fontSize: '2rem' }}>⛽</div>
                        <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            AutoFuel Lanka
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => document.getElementById('inquiries').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'transparent',
                                border: '2px solid white',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#1a73e8';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'white';
                            }}
                        >
                            Inquiries
                        </button>
                        <button
                            onClick={() => onNavigate('login')}
                            style={{
                                background: 'white',
                                border: 'none',
                                color: '#1a73e8',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '4rem 0',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '700',
                        margin: '0 0 1rem 0',
                        lineHeight: '1.2'
                    }}>
                        Welcome to AutoFuel Lanka
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        margin: '0 auto 2rem auto',
                        opacity: 0.9,
                        maxWidth: '600px'
                    }}>
                        Your trusted partner for premium automotive services. 
                        From fuel station management to comprehensive vehicle maintenance, 
                        we deliver excellence in every service.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'white',
                                color: '#1a73e8',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Our Services
                        </button>
                        <button
                            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '2px solid white',
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#1a73e8';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'white';
                            }}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Company Overview */}
            <section style={{ padding: '4rem 0', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0'
                        }}>
                            About AutoFuel Lanka
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            maxWidth: '800px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            With over 15 years of experience in the automotive industry, 
                            AutoFuel Lanka has established itself as the leading provider 
                            of fuel station management and vehicle maintenance services in Sri Lanka.
                        </p>
                    </div>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        marginTop: '3rem'
                    }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Excellence</h3>
                            <p style={{ color: '#666', margin: 0 }}>
                                Award-winning service quality with certified technicians and state-of-the-art equipment.
                            </p>
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Speed</h3>
                            <p style={{ color: '#666', margin: 0 }}>
                                Fast and efficient service delivery without compromising on quality standards.
                            </p>
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                            <h3 style={{ color: '#1a1a1a', margin: '0 0 1rem 0' }}>Reliability</h3>
                            <p style={{ color: '#666', margin: 0 }}>
                                Trusted by thousands of customers with 99% satisfaction rate and comprehensive warranties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" style={{ padding: '4rem 0', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            margin: '0 0 1rem 0'
                        }}>
                            Our Services
                        </h2>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            maxWidth: '600px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}>
                            Professional automotive services with expert technicians and quality guarantee. 
                            Login to book your service today.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {services.map((service) => (
                            <div
                                key={service.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                                }}
                                onClick={() => handleServiceClick(service)}
                            >
                                <div style={{
                                    height: '200px',
                                    background: `url(${service.image}) center/cover`,
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        LKR {service.price.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        margin: '0 0 0.5rem 0'
                                    }}>
                                        {service.name}
                                    </h3>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        margin: '0 0 1rem 0',
                                        lineHeight: '1.5'
                                    }}>
                                        {service.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{
                                            background: '#e3f2fd',
                                            color: '#1976d2',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500'
                                        }}>
                                            ⏱️ {service.duration}
                                        </span>
                                    </div>
                                    <button
                                        style={{
                                            width: '100%',
                                            background: isAuthenticated() ? '#1a73e8' : '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: isAuthenticated() ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.3s ease'
                                        }}
                                        disabled={!isAuthenticated()}
                                    >
                                        {isAuthenticated() ? 'Book Service' : 'Login to Book'}
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
