import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = "http://localhost:8080";

export default function FuelStationBooking() {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        locationId: "",
        vehicleId: "",
        fuelType: "",
        litersRequested: "",
        startTime: "",
        endTime: "",
        status: "PENDING"
    });

    // Load vehicles and fuel station locations
    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [vehiclesRes, locationsRes] = await Promise.all([
                fetch(`${API_BASE}/api/vehicles/by-customer/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/locations`)
            ]);

            if (!vehiclesRes.ok) {
                throw new Error(`Vehicles: ${vehiclesRes.status} ${vehiclesRes.statusText}`);
            }
            if (!locationsRes.ok) {
                throw new Error(`Locations: ${locationsRes.status} ${locationsRes.statusText}`);
            }

            const [vehiclesData, locationsData] = await Promise.all([
                vehiclesRes.json(),
                locationsRes.json()
            ]);

            // Filter only fuel stations
            const fuelStations = locationsData.filter(location => 
                location.type === "FUEL_STATION" || 
                location.name.toLowerCase().includes("fuel") ||
                location.name.toLowerCase().includes("station")
            );

            setVehicles(vehiclesData);
            setLocations(fuelStations);
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
                type: "FUEL",
                startTime: formatDateTime(form.startTime),
                endTime: formatDateTime(form.endTime),
                status: form.status,
                fuelType: form.fuelType,
                litersRequested: Number(form.litersRequested)
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
                fuelType: "",
                litersRequested: "",
                startTime: "",
                endTime: "",
                status: "PENDING"
            });
            setSuccess("Fuel station booking created successfully!");
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

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h3>Loading fuel stations and vehicles...</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                    ⛽ Fuel Station Booking
                </h2>
                <p style={{ color: "#7f8c8d" }}>
                    Book a visit to one of our fuel stations. Select your vehicle, fuel type, and preferred time.
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
                <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>Create Fuel Station Booking</h3>
                
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                            Fuel Station *
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
                            <option value="">Select Fuel Station</option>
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
                                backgroundColor: "#27ae60",
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
                            ⛽ Book Fuel Station Visit
                        </button>
                    </div>
                </form>
            </div>

            {/* Available Fuel Stations */}
            {locations.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                    <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Available Fuel Stations</h3>
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
                                    backgroundColor: "#e8f5e8",
                                    color: "#2e7d32",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}>
                                    FUEL STATION
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
