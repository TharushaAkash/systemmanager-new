import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080";

export default function ServicesShowcase({ onNavigate }) {
    const [hoveredService, setHoveredService] = useState(null);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load service types from database
    const loadServiceTypes = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/service-types`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setServiceTypes(data);
        } catch (e) {
            setError(`Failed to load services: ${e.message}`);
            console.error("Error loading service types:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServiceTypes();
    }, []);

    const getCategoryColor = (category) => {
        const colors = {
            Safety: "#dc3545",
            Cosmetic: "#6f42c1",
            Repair: "#fd7e14",
            Maintenance: "#28a745",
            Comfort: "#17a2b8"
        };
        return colors[category] || "#6c757d";
    };

    // Helper functions to determine service properties from database service types
    const getServiceCategory = (serviceName) => {
        const name = serviceName.toLowerCase();
        if (name.includes('brake') || name.includes('safety')) return "Safety";
        if (name.includes('paint') || name.includes('body')) return "Cosmetic";
        if (name.includes('accident') || name.includes('repair')) return "Repair";
        if (name.includes('engine') || name.includes('tune') || name.includes('maintenance')) return "Maintenance";
        if (name.includes('tire') || name.includes('wheel')) return "Maintenance";
        if (name.includes('ac') || name.includes('air')) return "Comfort";
        return "Service";
    };

    const getServiceIcon = (serviceName) => {
        const name = serviceName.toLowerCase();
        if (name.includes('brake')) return "🛞";
        if (name.includes('paint') || name.includes('body')) return "🎨";
        if (name.includes('accident') || name.includes('repair')) return "🔧";
        if (name.includes('engine')) return "⚙️";
        if (name.includes('tire') || name.includes('wheel')) return "🚗";
        if (name.includes('ac') || name.includes('air')) return "❄️";
        return "🔧";
    };

    const getServiceFeatures = (serviceName) => {
        const name = serviceName.toLowerCase();
        if (name.includes('brake')) {
            return ["Brake pad replacement", "Brake fluid check", "Brake disc inspection", "Safety testing"];
        }
        if (name.includes('paint') || name.includes('body')) {
            return ["Surface preparation", "Primer application", "Color matching", "Clear coat finish"];
        }
        if (name.includes('accident') || name.includes('repair')) {
            return ["Damage assessment", "Panel replacement", "Frame straightening", "Paint touch-up"];
        }
        if (name.includes('engine')) {
            return ["Oil change", "Filter replacement", "Spark plug service", "Performance check"];
        }
        if (name.includes('tire') || name.includes('wheel')) {
            return ["Tire mounting", "Wheel balancing", "Alignment check", "Pressure monitoring"];
        }
        if (name.includes('ac') || name.includes('air')) {
            return ["Gas refilling", "Compressor check", "Filter cleaning", "Performance test"];
        }
        return ["Professional service", "Quality guarantee", "Expert technicians", "Fast turnaround"];
    };

    const getServiceDuration = (serviceName) => {
        const name = serviceName.toLowerCase();
        if (name.includes('brake')) return "2-3 hours";
        if (name.includes('paint') || name.includes('body')) return "3-5 days";
        if (name.includes('accident') || name.includes('repair')) return "5-7 days";
        if (name.includes('engine')) return "3-4 hours";
        if (name.includes('tire') || name.includes('wheel')) return "1-2 hours";
        if (name.includes('ac') || name.includes('air')) return "2-3 hours";
        return "2-4 hours";
    };

    const handleBookService = (serviceType) => {
        // Navigate to booking form with service pre-selected
        onNavigate('service-booking', { 
            bookingType: 'SERVICE', 
            selectedService: serviceType,
            showTypeSelector: true 
        });
    };

    const handleBookFuel = () => {
        // Navigate to booking form for fuel
        onNavigate('service-booking', { bookingType: 'FUEL', showTypeSelector: false });
    };

    if (loading) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "400px",
                fontSize: "18px",
                color: "#666"
            }}>
                Loading services...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "400px",
                flexDirection: "column",
                gap: "20px"
            }}>
                <div style={{ color: "#dc3545", fontSize: "18px" }}>⚠️ {error}</div>
                <button 
                    onClick={loadServiceTypes}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#1a73e8",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2 style={{ 
                    color: "#1a73e8", 
                    margin: "0 0 15px 0", 
                    fontSize: "2.5rem",
                    fontWeight: "700"
                }}>
                    Our Premium Services
                </h2>
                <p style={{ 
                    color: "#666", 
                    fontSize: "1.1rem", 
                    maxWidth: "600px", 
                    margin: "0 auto",
                    lineHeight: "1.6"
                }}>
                    Professional automotive services with expert technicians and quality guarantee. 
                    Book your service today and experience the difference.
                </p>
            </div>

            {/* Services Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "25px",
                marginBottom: "40px"
            }}>
                {/* Fuel Booking Card */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "25px",
                        boxShadow: hoveredService === 'fuel' 
                            ? "0 15px 35px rgba(0,0,0,0.15)" 
                            : "0 8px 25px rgba(0,0,0,0.1)",
                        border: `3px solid ${hoveredService === 'fuel' ? '#27ae60' : 'transparent'}`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: hoveredService === 'fuel' ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden"
                    }}
                    onMouseEnter={() => setHoveredService('fuel')}
                    onMouseLeave={() => setHoveredService(null)}
                >
                    {/* Animated Background */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: `linear-gradient(90deg, #27ae60, #27ae60aa)`,
                        transform: hoveredService === 'fuel' ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease"
                    }} />

                    {/* Service Header */}
                    <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        marginBottom: "15px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ 
                                fontSize: "2.5rem",
                                transform: hoveredService === 'fuel' ? "rotate(10deg) scale(1.1)" : "rotate(0deg) scale(1)",
                                transition: "transform 0.3s ease"
                            }}>
                                ⛽
                            </div>
                            <div>
                                <h3 style={{ 
                                    margin: 0, 
                                    color: "#1a1a1a",
                                    fontSize: "1.4rem",
                                    fontWeight: "600"
                                }}>
                                    Fuel Station Visit
                                </h3>
                                <span style={{
                                    padding: "3px 8px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    backgroundColor: "#27ae6020",
                                    color: "#27ae60",
                                    marginTop: "4px",
                                    display: "inline-block"
                                }}>
                                    FUEL
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p style={{ 
                        color: "#666", 
                        fontSize: "14px", 
                        lineHeight: "1.5",
                        marginBottom: "20px"
                    }}>
                        Book a visit to our fuel stations. Select your vehicle, fuel type, and preferred time for a quick refuel.
                    </p>

                    {/* Features */}
                    <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ 
                            color: "#333", 
                            fontSize: "13px", 
                            fontWeight: "600",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}>
                            What's Included:
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {["Petrol & Diesel Available", "Quick Service", "Professional Staff", "Clean Environment"].map((feature, index) => (
                                <span
                                    key={index}
                                    style={{
                                        padding: "4px 8px",
                                        background: "#f8f9fa",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        color: "#495057",
                                        border: "1px solid #e9ecef"
                                    }}
                                >
                                    ✓ {feature}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Service Details */}
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "8px"
                    }}>
                        <div>
                            <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Duration</div>
                            <div style={{ fontSize: "14px", color: "#333", fontWeight: "600" }}>
                                ⏱️ 15-30 minutes
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Starting from</div>
                            <div style={{ 
                                fontSize: "20px", 
                                color: "#27ae60", 
                                fontWeight: "700"
                            }}>
                                Market Rate
                            </div>
                        </div>
                    </div>

                    {/* Book Button */}
                    <button
                        onClick={handleBookFuel}
                        style={{
                            width: "100%",
                            padding: "14px 20px",
                            border: "none",
                            borderRadius: "10px",
                            background: hoveredService === 'fuel' 
                                ? "linear-gradient(135deg, #27ae60, #27ae60dd)"
                                : "#27ae60",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            transform: hoveredService === 'fuel' ? "translateY(-2px)" : "translateY(0)",
                            boxShadow: hoveredService === 'fuel' 
                                ? "0 8px 20px #27ae6040"
                                : "0 4px 12px rgba(39, 174, 96, 0.3)"
                        }}
                    >
                        ⛽ Book Fuel Station Visit
                    </button>
                </div>

                {serviceTypes.map((serviceType) => {
                    const serviceCategory = getServiceCategory(serviceType.name);
                    const categoryColor = getCategoryColor(serviceCategory);
                    const serviceIcon = getServiceIcon(serviceType.name);
                    const serviceFeatures = getServiceFeatures(serviceType.name);
                    const serviceDuration = getServiceDuration(serviceType.name);
                    const displayPrice = serviceType.price || serviceType.basePrice || 0;

                    return (
                        <div
                            key={serviceType.id}
                            style={{
                                background: "white",
                                borderRadius: "16px",
                                padding: "25px",
                                boxShadow: hoveredService === serviceType.id 
                                    ? "0 15px 35px rgba(0,0,0,0.15)" 
                                    : "0 8px 25px rgba(0,0,0,0.1)",
                                border: `3px solid ${hoveredService === serviceType.id ? categoryColor : 'transparent'}`,
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform: hoveredService === serviceType.id ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseEnter={() => setHoveredService(serviceType.id)}
                            onMouseLeave={() => setHoveredService(null)}
                        >
                        {/* Animated Background */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}aa)`,
                            transform: hoveredService === serviceType.id ? "scaleX(1)" : "scaleX(0)",
                            transformOrigin: "left",
                            transition: "transform 0.4s ease"
                        }} />

                        {/* Service Header */}
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            marginBottom: "15px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ 
                                    fontSize: "2.5rem",
                                    transform: hoveredService === serviceType.id ? "rotate(10deg) scale(1.1)" : "rotate(0deg) scale(1)",
                                    transition: "transform 0.3s ease"
                                }}>
                                    {serviceIcon}
                                </div>
                                <div>
                                    <h3 style={{ 
                                        margin: 0, 
                                        color: "#1a1a1a",
                                        fontSize: "1.4rem",
                                        fontWeight: "600"
                                    }}>
                                        {serviceType.name}
                                    </h3>
                                    <span style={{
                                        padding: "3px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        backgroundColor: `${categoryColor}20`,
                                        color: categoryColor,
                                        marginTop: "4px",
                                        display: "inline-block"
                                    }}>
                                        {serviceCategory}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p style={{ 
                            color: "#666", 
                            fontSize: "14px", 
                            lineHeight: "1.5",
                            marginBottom: "20px"
                        }}>
                            {serviceType.description || serviceType.label || `Professional ${serviceType.name.toLowerCase()} service with expert technicians.`}
                        </p>

                        {/* Features */}
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ 
                                color: "#333", 
                                fontSize: "13px", 
                                fontWeight: "600",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                What's Included:
                            </h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {serviceFeatures.map((feature, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: "4px 8px",
                                            background: "#f8f9fa",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            color: "#495057",
                                            border: "1px solid #e9ecef"
                                        }}
                                    >
                                        ✓ {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Service Details */}
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "12px",
                            background: "#f8f9fa",
                            borderRadius: "8px"
                        }}>
                            <div>
                                <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Duration</div>
                                <div style={{ fontSize: "14px", color: "#333", fontWeight: "600" }}>
                                    ⏱️ {serviceDuration}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Starting from</div>
                                <div style={{ 
                                    fontSize: "20px", 
                                    color: categoryColor, 
                                    fontWeight: "700"
                                }}>
                                    LKR {displayPrice.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Book Button */}
                        <button
                            onClick={() => handleBookService(serviceType)}
                            style={{
                                width: "100%",
                                padding: "14px 20px",
                                border: "none",
                                borderRadius: "10px",
                                background: hoveredService === serviceType.id 
                                    ? `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`
                                    : "#1a73e8",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                transform: hoveredService === serviceType.id ? "translateY(-2px)" : "translateY(0)",
                                boxShadow: hoveredService === serviceType.id 
                                    ? `0 8px 20px ${categoryColor}40`
                                    : "0 4px 12px rgba(26, 115, 232, 0.3)"
                            }}
                        >
                            📅 Book This Service
                        </button>
                        </div>
                    );
                })}
            </div>

            {/* Call to Action */}
            <div style={{
                background: "linear-gradient(135deg, #1a73e8, #4285f4)",
                borderRadius: "16px",
                padding: "30px",
                textAlign: "center",
                color: "white",
                boxShadow: "0 8px 25px rgba(26, 115, 232, 0.3)"
            }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>
                    Need a Custom Service?
                </h3>
                <p style={{ margin: "0 0 20px 0", opacity: 0.9 }}>
                    Can't find what you're looking for? Contact us for personalized automotive solutions.
                </p>
                <button
                    onClick={() => onNavigate('profile')}
                    style={{
                        padding: "12px 30px",
                        border: "2px solid white",
                        borderRadius: "8px",
                        background: "transparent",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "white";
                        e.target.style.color = "#1a73e8";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "white";
                    }}
                >
                    📞 Contact Us
                </button>
            </div>
        </div>
    );
}
