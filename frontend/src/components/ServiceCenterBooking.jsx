import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function ServiceCenterBooking({ bookingType = "SERVICE", showTypeSelector = true }) {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        locationId: "",
        vehicleId: "",
        serviceTypeId: "",
        bookingType: bookingType, // Use passed bookingType prop
        fuelType: "",
        litersRequested: "",
        startTime: "",
        endTime: "",
        status: "PENDING",
        description: "",
        urgency: "NORMAL",
        contactPreference: "EMAIL"
    });

    // Load vehicles, service centers, service types, and vehicle types
    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [vehiclesRes, locationsRes, serviceTypesRes] = await Promise.all([
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/locations`),
                fetch(`${API_BASE}/api/service-types`)
            ]);

            if (!vehiclesRes.ok) {
                throw new Error(`Vehicles: ${vehiclesRes.status} ${vehiclesRes.statusText}`);
            }
            if (!locationsRes.ok) {
                throw new Error(`Locations: ${locationsRes.status} ${locationsRes.statusText}`);
            }
            if (!serviceTypesRes.ok) {
                throw new Error(`Service Types: ${serviceTypesRes.status} ${serviceTypesRes.statusText}`);
            }

            const [vehiclesData, locationsData, serviceTypesData] = await Promise.all([
                vehiclesRes.json(),
                locationsRes.json(),
                serviceTypesRes.json()
            ]);

            // Filter locations based on type
            const filteredLocations = locationsData.filter(location => 
                location.type === "SERVICE_CENTER" || 
                location.type === "FUEL_STATION" ||
                location.name.toLowerCase().includes("service") ||
                location.name.toLowerCase().includes("center") ||
                location.name.toLowerCase().includes("fuel") ||
                location.name.toLowerCase().includes("station")
            );

            setVehicles(vehiclesData);
            setLocations(filteredLocations);
            setServiceTypes(serviceTypesData);
        } catch (err) {
            console.error("Error loading data:", err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            loadData();
        }
    }, [user, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            // Ensure datetime format includes seconds
            const formatDateTime = (dateTimeStr) => {
                if (!dateTimeStr) return dateTimeStr;
                // If the string doesn't end with seconds, add :00
                return dateTimeStr.includes(':00') ? dateTimeStr : `${dateTimeStr}:00`;
            };

            const requestBody = {
                locationId: Number(form.locationId),
                vehicleId: Number(form.vehicleId),
                type: form.bookingType,
                startTime: formatDateTime(form.startTime),
                endTime: formatDateTime(form.endTime),
                status: form.status,
                description: form.description,
                urgency: form.urgency,
                contactPreference: form.contactPreference,
                ...(form.bookingType === "SERVICE" && { serviceTypeId: Number(form.serviceTypeId) }),
                ...(form.bookingType === "FUEL" && { 
                    fuelType: form.fuelType,
                    litersRequested: Number(form.litersRequested)
                })
            };

            const response = await fetch(`${API_BASE}/api/customers/${user.id}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Reset form and show success
            setForm({
                locationId: "",
                vehicleId: "",
                serviceTypeId: "",
                bookingType: "SERVICE",
                fuelType: "",
                litersRequested: "",
                startTime: "",
                endTime: "",
                status: "PENDING",
                description: "",
                urgency: "NORMAL",
                contactPreference: "EMAIL"
            });
            setSuccess(`${form.bookingType === "SERVICE" ? "Service" : "Fuel"} booking created successfully!`);
        } catch (err) {
            console.error("Error creating booking:", err);
            setError(`Failed to create booking: ${err.message}`);
        }
    };

    const getLocationName = (locationId) => {
        const location = locations.find(l => l.id === locationId);
        return location ? location.name : `Location ${locationId}`;
    };

    const getVehicleName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model}` : `Vehicle ${vehicleId}`;
    };

    const getServiceName = (serviceTypeId) => {
        const service = serviceTypes.find(s => s.id === serviceTypeId);
        return service ? service.name : `Service ${serviceTypeId}`;
    };


    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h3>Loading service centers, vehicles, and services...</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                    🔧 Service & Fuel Booking
                </h2>
                <p style={{ color: "#7f8c8d" }}>
                    Book a service appointment or fuel station visit. Select your vehicle, service type, and preferred time.
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "20px",
                    border: "1px solid #c3e6cb"
                }}>
                    {success}
                </div>
            )}

            <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #dee2e6"
            }}>
                <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>
                    Create {form.bookingType === "SERVICE" ? "Service Center" : "Fuel Station"} Booking
                </h3>
                
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    {showTypeSelector && (
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                                Booking Type *
                            </label>
                            <select
                                name="bookingType"
                                value={form.bookingType}
                                onChange={handleInputChange}
                                required
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    borderRadius: "6px", 
                                    border: "1px solid #ced4da",
                                    fontSize: "14px",
                                    backgroundColor: "white"
                                }}
                            >
                                <option value="SERVICE">🔧 Service</option>
                                <option value="FUEL">⛽ Fuel</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            {form.bookingType === "SERVICE" ? "Service Center" : "Fuel Station"} *
                        </label>
                        <select
                            name="locationId"
                            value={form.locationId}
                            onChange={handleInputChange}
                            required
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                borderRadius: "6px", 
                                border: "1px solid #ced4da",
                                fontSize: "14px",
                                backgroundColor: "white"
                            }}
                        >
                            <option value="">Select Service Center</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>
                                    {location.name} - {location.address || "Address not available"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Your Vehicle *
                        </label>
                        <select
                            name="vehicleId"
                            value={form.vehicleId}
                            onChange={handleInputChange}
                            required
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                borderRadius: "6px", 
                                border: "1px solid #ced4da",
                                fontSize: "14px",
                                backgroundColor: "white"
                            }}
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.plateNumber} - {vehicle.make} {vehicle.model} ({vehicle.fuelType})
                                </option>
                            ))}
                        </select>
                    </div>


                    {form.bookingType === "SERVICE" && (
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                                Service Type *
                            </label>
                            <select
                                name="serviceTypeId"
                                value={form.serviceTypeId}
                                onChange={handleInputChange}
                                required
                                style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    borderRadius: "6px", 
                                    border: "1px solid #ced4da",
                                    fontSize: "14px",
                                    backgroundColor: "white"
                                }}
                            >
                                <option value="">Select Service</option>
                                {serviceTypes.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - ${service.price} ({service.description})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.bookingType === "FUEL" && (
                        <>
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                                    Fuel Type *
                                </label>
                                <select
                                    name="fuelType"
                                    value={form.fuelType}
                                    onChange={handleInputChange}
                                    required
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px", 
                                        borderRadius: "6px", 
                                        border: "1px solid #ced4da",
                                        fontSize: "14px",
                                        backgroundColor: "white"
                                    }}
                                >
                                    <option value="">Select Fuel Type</option>
                                    <option value="PETROL">Petrol</option>
                                    <option value="DIESEL">Diesel</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                                    Liters Requested *
                                </label>
                                <input
                                    type="number"
                                    name="litersRequested"
                                    value={form.litersRequested}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="100"
                                    step="0.1"
                                    required
                                    placeholder="e.g., 25.5"
                                    style={{ 
                                        width: "100%", 
                                        padding: "12px", 
                                        borderRadius: "6px", 
                                        border: "1px solid #ced4da",
                                        fontSize: "14px"
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Preferred Start Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleInputChange}
                            required
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                borderRadius: "6px", 
                                border: "1px solid #ced4da",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Expected End Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleInputChange}
                            required
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                borderRadius: "6px", 
                                border: "1px solid #ced4da",
                                fontSize: "14px"
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            placeholder="Please describe the service needed or any specific requirements..."
                            rows={4}
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                borderRadius: "6px", 
                                border: "1px solid #ced4da",
                                fontSize: "14px",
                                resize: "vertical"
                            }}
                        />
                    </div>

                    {/* Urgency Level */}
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Urgency Level
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                            {[
                                { value: "LOW", label: "Low Priority", color: "#28a745", description: "Can wait 1-2 weeks" },
                                { value: "NORMAL", label: "Normal", color: "#1a73e8", description: "Within a week" },
                                { value: "HIGH", label: "High Priority", color: "#fd7e14", description: "Within 2-3 days" },
                                { value: "URGENT", label: "Urgent", color: "#dc3545", description: "ASAP - Same day if possible" }
                            ].map(option => (
                                <label
                                    key={option.value}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px",
                                        border: `2px solid ${form.urgency === option.value ? option.color : '#e1e5e9'}`,
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        background: form.urgency === option.value ? `${option.color}10` : "white"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="urgency"
                                        value={option.value}
                                        checked={form.urgency === option.value}
                                        onChange={handleInputChange}
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

                    {/* Contact Preference */}
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Preferred Contact Method
                        </label>
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                            {[
                                { value: "EMAIL", label: "📧 Email" },
                                { value: "PHONE", label: "📞 Phone" },
                                { value: "SMS", label: "💬 SMS" }
                            ].map(option => (
                                <label key={option.value} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="contactPreference"
                                        value={option.value}
                                        checked={form.contactPreference === option.value}
                                        onChange={handleInputChange}
                                        style={{ marginRight: "8px" }}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <button
                            type="submit"
                            style={{
                                backgroundColor: "#3498db",
                                color: "white",
                                border: "none",
                                padding: "12px 30px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "600",
                                minWidth: "200px"
                            }}
                        >
                            {form.bookingType === "SERVICE" ? "🔧 Book Service Appointment" : "⛽ Book Fuel Station Visit"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Available Services */}
            {form.bookingType === "SERVICE" && serviceTypes.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                    <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Available Services</h3>
                    <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        {serviceTypes.map(service => (
                            <div
                                key={service.id}
                                style={{
                                    backgroundColor: "white",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    border: "1px solid #dee2e6",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                            >
                                <h4 style={{ color: "#2c3e50", marginBottom: "8px" }}>{service.name}</h4>
                                <p style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: "8px" }}>
                                    {service.description || "No description available"}
                                </p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{
                                        padding: "4px 8px",
                                        backgroundColor: "#e8f5e8",
                                        color: "#2e7d32",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        ${service.price}
                                    </span>
                                    <span style={{
                                        padding: "4px 8px",
                                        backgroundColor: "#e3f2fd",
                                        color: "#1976d2",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {service.code}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Locations */}
            {locations.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                    <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>
                        Available {form.bookingType === "SERVICE" ? "Service Centers" : "Fuel Stations"}
                    </h3>
                    <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                        {locations.map(location => (
                            <div
                                key={location.id}
                                style={{
                                    backgroundColor: "white",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    border: "1px solid #dee2e6",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                            >
                                <h4 style={{ color: "#2c3e50", marginBottom: "8px" }}>{location.name}</h4>
                                <p style={{ color: "#7f8c8d", fontSize: "14px", margin: "0" }}>
                                    {location.address || "Address not available"}
                                </p>
                                <span style={{
                                    display: "inline-block",
                                    marginTop: "8px",
                                    padding: "4px 8px",
                                    backgroundColor: form.bookingType === "SERVICE" ? "#e3f2fd" : "#e8f5e8",
                                    color: form.bookingType === "SERVICE" ? "#1976d2" : "#2e7d32",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    {form.bookingType === "SERVICE" ? "SERVICE CENTER" : "FUEL STATION"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
