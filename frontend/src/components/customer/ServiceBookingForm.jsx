import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function ServiceBookingForm({ onNavigate, selectedService = null }) {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [vehicles, setVehicles] = useState([]);
    const [locations, setLocations] = useState([]);

    const [bookingForm, setBookingForm] = useState({
        vehicleId: "",
        locationId: "",
        serviceType: selectedService?.name || "",
        preferredDate: "",
        preferredTime: "",
        description: selectedService?.description || "",
        urgency: "NORMAL",
        contactPreference: "EMAIL"
    });

    const urgencyOptions = [
        { value: "LOW", label: "Low Priority", color: "#28a745", description: "Can wait 1-2 weeks" },
        { value: "NORMAL", label: "Normal", color: "#1a73e8", description: "Within a week" },
        { value: "HIGH", label: "High Priority", color: "#fd7e14", description: "Within 2-3 days" },
        { value: "URGENT", label: "Urgent", color: "#dc3545", description: "ASAP - Same day if possible" }
    ];

    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00", 
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const loadData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const requests = [
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, { headers }),
                fetch(`${API_BASE}/api/locations`)
            ];

            const [vehiclesRes, locationsRes] = await Promise.all(requests);
            
            if (vehiclesRes.ok) {
                const vehiclesData = await vehiclesRes.json();
                setVehicles(vehiclesData);
            }
            
            if (locationsRes.ok) {
                const locationsData = await locationsRes.json();
                // Filter for service centers
                setLocations(locationsData.filter(loc => loc.type === 'SERVICE_CENTER'));
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Validate required fields
            if (!bookingForm.vehicleId || !bookingForm.locationId || !bookingForm.preferredDate || !bookingForm.preferredTime) {
                throw new Error("Please fill in all required fields");
            }

            // Get vehicle and location details for payment gateway
            const selectedVehicle = vehicles.find(v => v.id === parseInt(bookingForm.vehicleId));
            const selectedLocation = locations.find(l => l.id === parseInt(bookingForm.locationId));

            const bookingData = {
                vehicleId: bookingForm.vehicleId,
                locationId: bookingForm.locationId,
                serviceType: bookingForm.serviceType,
                preferredDate: bookingForm.preferredDate,
                preferredTime: bookingForm.preferredTime,
                description: bookingForm.description,
                urgency: bookingForm.urgency,
                contactPreference: bookingForm.contactPreference,
                vehicle: selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year}) - ${selectedVehicle.licensePlate}` : "",
                location: selectedLocation ? `${selectedLocation.name} - ${selectedLocation.address}` : ""
            };

            // Navigate to payment gateway with booking data
            onNavigate('payment-gateway', bookingData);

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "30px", textAlign: "center" }}>
                <h2 style={{ 
                    color: "#1a73e8", 
                    margin: "0 0 10px 0", 
                    fontSize: "2rem",
                    fontWeight: "700"
                }}>
                    Book Your Service
                </h2>
                <p style={{ color: "#666", margin: 0 }}>
                    Fill in the details below to schedule your automotive service
                </p>
            </div>

            {/* Selected Service Info */}
            {selectedService && (
                <div style={{
                    background: "linear-gradient(135deg, #e8f4fd, #f0f8ff)",
                    border: "2px solid #1a73e8",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "25px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <div style={{ fontSize: "2rem" }}>{selectedService.icon}</div>
                        <div>
                            <h3 style={{ margin: 0, color: "#1a73e8", fontSize: "1.3rem" }}>
                                {selectedService.name}
                            </h3>
                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
                                Starting from LKR {selectedService.price?.toLocaleString()} • {selectedService.duration}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Booking Form */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <form onSubmit={handleSubmit}>
                    {/* Vehicle and Location */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        marginBottom: "25px"
                    }}>
                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Select Vehicle *
                            </label>
                            <select
                                value={bookingForm.vehicleId}
                                onChange={(e) => setBookingForm({...bookingForm, vehicleId: e.target.value})}
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
                            >
                                <option value="">Choose your vehicle</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Service Location *
                            </label>
                            <select
                                value={bookingForm.locationId}
                                onChange={(e) => setBookingForm({...bookingForm, locationId: e.target.value})}
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
                            >
                                <option value="">Choose service center</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.name} - {location.address}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Service Type */}
                    <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                            Service Type *
                        </label>
                        <input
                            type="text"
                            value={bookingForm.serviceType}
                            onChange={(e) => setBookingForm({...bookingForm, serviceType: e.target.value})}
                            placeholder="e.g., Brake Repair, Oil Change, Full Service"
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

                    {/* Date and Time */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        marginBottom: "25px"
                    }}>
                        <div>
                            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                                Preferred Date *
                            </label>
                            <input
                                type="date"
                                value={bookingForm.preferredDate}
                                onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                                min={today}
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
                                Preferred Time *
                            </label>
                            <select
                                value={bookingForm.preferredTime}
                                onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
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
                            >
                                <option value="">Select time slot</option>
                                {timeSlots.map(time => (
                                    <option key={time} value={time}>
                                        {time}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Urgency Level */}
                    <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                            Urgency Level
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                            {urgencyOptions.map(option => (
                                <label
                                    key={option.value}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px",
                                        border: `2px solid ${bookingForm.urgency === option.value ? option.color : '#e1e5e9'}`,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        background: bookingForm.urgency === option.value ? `${option.color}10` : "white"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="urgency"
                                        value={option.value}
                                        checked={bookingForm.urgency === option.value}
                                        onChange={(e) => setBookingForm({...bookingForm, urgency: e.target.value})}
                                        style={{ marginRight: "8px" }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: "600", color: option.color, fontSize: "14px" }}>
                                            {option.label}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#666" }}>
                                            {option.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                            Service Description
                        </label>
                        <textarea
                            value={bookingForm.description}
                            onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                            placeholder="Please describe the issue or service needed in detail..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #e1e5e9",
                                borderRadius: "8px",
                                fontSize: "14px",
                                transition: "border-color 0.3s ease",
                                resize: "vertical"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                            onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                        />
                    </div>

                    {/* Contact Preference */}
                    <div style={{ marginBottom: "30px" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>
                            Preferred Contact Method
                        </label>
                        <div style={{ display: "flex", gap: "20px" }}>
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="contactPreference"
                                    value="EMAIL"
                                    checked={bookingForm.contactPreference === "EMAIL"}
                                    onChange={(e) => setBookingForm({...bookingForm, contactPreference: e.target.value})}
                                    style={{ marginRight: "8px" }}
                                />
                                📧 Email
                            </label>
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="contactPreference"
                                    value="PHONE"
                                    checked={bookingForm.contactPreference === "PHONE"}
                                    onChange={(e) => setBookingForm({...bookingForm, contactPreference: e.target.value})}
                                    style={{ marginRight: "8px" }}
                                />
                                📞 Phone
                            </label>
                            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="contactPreference"
                                    value="SMS"
                                    checked={bookingForm.contactPreference === "SMS"}
                                    onChange={(e) => setBookingForm({...bookingForm, contactPreference: e.target.value})}
                                    style={{ marginRight: "8px" }}
                                />
                                💬 SMS
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                        <button
                            type="button"
                            onClick={() => onNavigate('services')}
                            style={{
                                padding: "14px 30px",
                                border: "2px solid #6c757d",
                                borderRadius: "8px",
                                background: "white",
                                color: "#6c757d",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            ← Back to Services
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "14px 30px",
                                border: "none",
                                borderRadius: "8px",
                                background: loading ? "#6c757d" : "linear-gradient(135deg, #1a73e8, #4285f4)",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(26, 115, 232, 0.3)"
                            }}
                        >
                            {loading ? "Processing..." : "💳 Proceed to Payment"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Box */}
            <div style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginTop: "20px",
                textAlign: "center"
            }}>
                <h4 style={{ color: "#495057", margin: "0 0 10px 0" }}>💳 Payment Process</h4>
                <p style={{ color: "#6c757d", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                    After filling the booking details, you'll be redirected to our secure payment gateway 
                    to complete your booking. Payment is required to confirm your appointment. 
                    An invoice will be generated automatically after successful payment.
                </p>
            </div>
        </div>
    );
}
