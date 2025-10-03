import { useState } from "react";

export default function ServicesShowcase({ onNavigate }) {
    const [hoveredService, setHoveredService] = useState(null);

    const services = [
        {
            id: 1,
            name: "Brake Repair",
            description: "Complete brake system inspection, repair, and replacement services",
            price: 15000,
            icon: "🛞",
            features: ["Brake pad replacement", "Brake fluid check", "Brake disc inspection", "Safety testing"],
            duration: "2-3 hours",
            category: "Safety"
        },
        {
            id: 2,
            name: "Full Body Painting",
            description: "Professional automotive painting with premium quality finish",
            price: 85000,
            icon: "🎨",
            features: ["Surface preparation", "Primer application", "Color matching", "Clear coat finish"],
            duration: "3-5 days",
            category: "Cosmetic"
        },
        {
            id: 3,
            name: "Accident Repair",
            description: "Comprehensive collision repair and bodywork restoration",
            price: 120000,
            icon: "🔧",
            features: ["Damage assessment", "Panel replacement", "Frame straightening", "Paint touch-up"],
            duration: "5-7 days",
            category: "Repair"
        },
        {
            id: 4,
            name: "Engine Tune-Up",
            description: "Complete engine maintenance and performance optimization",
            price: 25000,
            icon: "⚙️",
            features: ["Oil change", "Filter replacement", "Spark plug service", "Performance check"],
            duration: "3-4 hours",
            category: "Maintenance"
        },
        {
            id: 5,
            name: "Tire Services",
            description: "Tire installation, balancing, and alignment services",
            price: 8000,
            icon: "🚗",
            features: ["Tire mounting", "Wheel balancing", "Alignment check", "Pressure monitoring"],
            duration: "1-2 hours",
            category: "Maintenance"
        },
        {
            id: 6,
            name: "Air Conditioning",
            description: "AC system repair, maintenance, and gas refilling",
            price: 12000,
            icon: "❄️",
            features: ["Gas refilling", "Compressor check", "Filter cleaning", "Performance test"],
            duration: "2-3 hours",
            category: "Comfort"
        }
    ];

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

    const handleBookService = (service) => {
        // Navigate to booking form with service pre-selected
        onNavigate('service-booking', { service });
    };

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
                {services.map((service) => (
                    <div
                        key={service.id}
                        style={{
                            background: "white",
                            borderRadius: "16px",
                            padding: "25px",
                            boxShadow: hoveredService === service.id 
                                ? "0 15px 35px rgba(0,0,0,0.15)" 
                                : "0 8px 25px rgba(0,0,0,0.1)",
                            border: `3px solid ${hoveredService === service.id ? getCategoryColor(service.category) : 'transparent'}`,
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: hoveredService === service.id ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onMouseEnter={() => setHoveredService(service.id)}
                        onMouseLeave={() => setHoveredService(null)}
                    >
                        {/* Animated Background */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: `linear-gradient(90deg, ${getCategoryColor(service.category)}, ${getCategoryColor(service.category)}aa)`,
                            transform: hoveredService === service.id ? "scaleX(1)" : "scaleX(0)",
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
                                    transform: hoveredService === service.id ? "rotate(10deg) scale(1.1)" : "rotate(0deg) scale(1)",
                                    transition: "transform 0.3s ease"
                                }}>
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 style={{ 
                                        margin: 0, 
                                        color: "#1a1a1a",
                                        fontSize: "1.4rem",
                                        fontWeight: "600"
                                    }}>
                                        {service.name}
                                    </h3>
                                    <span style={{
                                        padding: "3px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        backgroundColor: `${getCategoryColor(service.category)}20`,
                                        color: getCategoryColor(service.category),
                                        marginTop: "4px",
                                        display: "inline-block"
                                    }}>
                                        {service.category}
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
                            {service.description}
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
                                {service.features.map((feature, index) => (
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
                                    ⏱️ {service.duration}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>Starting from</div>
                                <div style={{ 
                                    fontSize: "20px", 
                                    color: getCategoryColor(service.category), 
                                    fontWeight: "700"
                                }}>
                                    LKR {service.price.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Book Button */}
                        <button
                            onClick={() => handleBookService(service)}
                            style={{
                                width: "100%",
                                padding: "14px 20px",
                                border: "none",
                                borderRadius: "10px",
                                background: hoveredService === service.id 
                                    ? `linear-gradient(135deg, ${getCategoryColor(service.category)}, ${getCategoryColor(service.category)}dd)`
                                    : "#1a73e8",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                transform: hoveredService === service.id ? "translateY(-2px)" : "translateY(0)",
                                boxShadow: hoveredService === service.id 
                                    ? `0 8px 20px ${getCategoryColor(service.category)}40`
                                    : "0 4px 12px rgba(26, 115, 232, 0.3)"
                            }}
                        >
                            📅 Book This Service
                        </button>
                    </div>
                ))}
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
