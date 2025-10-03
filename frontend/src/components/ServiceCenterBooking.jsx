import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function ServiceCenterBooking() {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        locationId: "",
        vehicleId: "",
        vehicleTypeId: "",
        serviceTypeId: "",
        startTime: "",
        endTime: "",
        status: "PENDING"
    });

    // Load vehicles, service centers, service types, and vehicle types
    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [vehiclesRes, locationsRes, serviceTypesRes, vehicleTypesRes] = await Promise.all([
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/locations`),
                fetch(`${API_BASE}/api/service-types`),
                fetch(`${API_BASE}/api/vehicle-types`)
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
            if (!vehicleTypesRes.ok) {
                throw new Error(`Vehicle Types: ${vehicleTypesRes.status} ${vehicleTypesRes.statusText}`);
            }

            const [vehiclesData, locationsData, serviceTypesData, vehicleTypesData] = await Promise.all([
                vehiclesRes.json(),
                locationsRes.json(),
                serviceTypesRes.json(),
                vehicleTypesRes.json()
            ]);

            // Filter only service centers
            const serviceCenters = locationsData.filter(location => 
                location.type === "SERVICE_CENTER" || 
                location.name.toLowerCase().includes("service") ||
                location.name.toLowerCase().includes("center")
            );

            setVehicles(vehiclesData);
            setLocations(serviceCenters);
            setServiceTypes(serviceTypesData);
            setVehicleTypes(vehicleTypesData);
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
            const requestBody = {
                locationId: Number(form.locationId),
                vehicleId: Number(form.vehicleId),
                type: "SERVICE",
                startTime: form.startTime,
                endTime: form.endTime,
                status: form.status,
                serviceTypeId: Number(form.serviceTypeId)
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
                vehicleTypeId: "",
                serviceTypeId: "",
                startTime: "",
                endTime: "",
                status: "PENDING"
            });
            setSuccess("Service center booking created successfully!");
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

    const getVehicleTypeName = (vehicleTypeId) => {
        const vehicleType = vehicleTypes.find(vt => vt.id === vehicleTypeId);
        return vehicleType ? vehicleType.getFullName() : `Vehicle Type ${vehicleTypeId}`;
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
                    🔧 Service Center Booking
                </h2>
                <p style={{ color: "#7f8c8d" }}>
                    Book a service appointment at one of our service centers. Select your vehicle, service type, and preferred time.
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
                <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>Create Service Center Booking</h3>
                
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Service Center *
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

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Vehicle Type *
                        </label>
                        <select
                            name="vehicleTypeId"
                            value={form.vehicleTypeId}
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
                            <option value="">Select Vehicle Type</option>
                            {vehicleTypes.map(vehicleType => (
                                <option key={vehicleType.id} value={vehicleType.id}>
                                    {vehicleType.make} {vehicleType.model} {vehicleType.year} ({vehicleType.fuelType})
                                </option>
                            ))}
                        </select>
                    </div>

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
                            🔧 Book Service Appointment
                        </button>
                    </div>
                </form>
            </div>

            {/* Available Services */}
            {serviceTypes.length > 0 && (
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

            {/* Available Service Centers */}
            {locations.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                    <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Available Service Centers</h3>
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
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    SERVICE CENTER
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
