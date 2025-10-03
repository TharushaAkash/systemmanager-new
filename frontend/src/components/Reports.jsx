import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function Reports() {
    const [reports, setReports] = useState({
        bookingsByDay: [],
        bookingsByLocation: [],
        bookingsByService: [],
        revenueSummary: {}
    });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // Load all reports
    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const [bookingsByDayRes, bookingsByLocationRes, bookingsByServiceRes, revenueSummaryRes] = await Promise.all([
                fetch(`${API_BASE}/api/reports/bookings-by-day`),
                fetch(`${API_BASE}/api/reports/bookings-by-location`),
                fetch(`${API_BASE}/api/reports/bookings-by-service`),
                fetch(`${API_BASE}/api/reports/revenue-summary`)
            ]);

            if (!bookingsByDayRes.ok) throw new Error(`HTTP ${bookingsByDayRes.status}`);
            if (!bookingsByLocationRes.ok) throw new Error(`HTTP ${bookingsByLocationRes.status}`);
            if (!bookingsByServiceRes.ok) throw new Error(`HTTP ${bookingsByServiceRes.status}`);
            if (!revenueSummaryRes.ok) throw new Error(`HTTP ${revenueSummaryRes.status}`);

            const [bookingsByDay, bookingsByLocation, bookingsByService, revenueSummary] = await Promise.all([
                bookingsByDayRes.json(),
                bookingsByLocationRes.json(),
                bookingsByServiceRes.json(),
                revenueSummaryRes.json()
            ]);

            setReports({
                bookingsByDay,
                bookingsByLocation,
                bookingsByService,
                revenueSummary
            });
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Download CSV function
    const downloadCSV = async (endpoint, filename) => {
        try {
            const res = await fetch(`${API_BASE}/api/reports/${endpoint}/csv`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            setErr(String(e.message));
        }
    };

    if (loading) return <p style={{ padding: 16 }}>Loading reports…</p>;
    if (err) return <p style={{ color: "red", padding: 16 }}>Error: {err}</p>;

    return (
        <div style={{ padding: 16 }}>
            <h1>Reports Dashboard</h1>

            {/* Revenue Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <h3 style={{ margin: "0 0 8px 0", color: "#495057" }}>Total Revenue</h3>
                    <p style={{ margin: 0, fontSize: "1.5em", fontWeight: "bold", color: "#28a745" }}>
                        ${reports.revenueSummary.totalRevenue?.toFixed(2) || "0.00"}
                    </p>
                </div>
                <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <h3 style={{ margin: "0 0 8px 0", color: "#495057" }}>Total Bookings</h3>
                    <p style={{ margin: 0, fontSize: "1.5em", fontWeight: "bold", color: "#007bff" }}>
                        {reports.revenueSummary.totalBookings || 0}
                    </p>
                </div>
                <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <h3 style={{ margin: "0 0 8px 0", color: "#495057" }}>Avg Revenue/Booking</h3>
                    <p style={{ margin: 0, fontSize: "1.5em", fontWeight: "bold", color: "#6f42c1" }}>
                        ${reports.revenueSummary.averageRevenuePerBooking?.toFixed(2) || "0.00"}
                    </p>
                </div>
            </div>

            {/* Reports Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
                
                {/* Bookings by Day */}
                <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Bookings by Day</h3>
                        <button 
                            onClick={() => downloadCSV("bookings-by-day", "bookings-by-day.csv")}
                            style={{ padding: "4px 8px", fontSize: "0.8em" }}
                        >
                            Download CSV
                        </button>
                    </div>
                    {reports.bookingsByDay.length === 0 ? (
                        <p style={{ color: "#6c757d" }}>No data available</p>
                    ) : (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {reports.bookingsByDay.map((item, index) => (
                                <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f3f4" }}>
                                    <span>{item.label}</span>
                                    <strong>{item.count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bookings by Location */}
                <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Bookings by Location</h3>
                        <button 
                            onClick={() => downloadCSV("bookings-by-location", "bookings-by-location.csv")}
                            style={{ padding: "4px 8px", fontSize: "0.8em" }}
                        >
                            Download CSV
                        </button>
                    </div>
                    {reports.bookingsByLocation.length === 0 ? (
                        <p style={{ color: "#6c757d" }}>No data available</p>
                    ) : (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {reports.bookingsByLocation.map((item, index) => (
                                <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f3f4" }}>
                                    <span>{item.label}</span>
                                    <strong>{item.count}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bookings by Service Type */}
                <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #dee2e6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Bookings by Service Type</h3>
                        <button 
                            onClick={() => downloadCSV("bookings-by-service", "bookings-by-service.csv")}
                            style={{ padding: "4px 8px", fontSize: "0.8em" }}
                        >
                            Download CSV
                        </button>
                    </div>
                    {reports.bookingsByService.length === 0 ? (
                        <p style={{ color: "#6c757d" }}>No data available</p>
                    ) : (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {reports.bookingsByService.map((item, index) => (
                                <div key={index} style={{ padding: "4px 0", borderBottom: "1px solid #f1f3f4" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>{item.label}</span>
                                        <strong>{item.count}</strong>
                                    </div>
                                    <div style={{ fontSize: "0.9em", color: "#28a745" }}>
                                        Revenue: ${item.revenue?.toFixed(2) || "0.00"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Refresh Button */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
                <button 
                    onClick={load}
                    style={{ padding: "8px 16px", fontSize: "1em" }}
                >
                    Refresh Reports
                </button>
            </div>
        </div>
    );
}
