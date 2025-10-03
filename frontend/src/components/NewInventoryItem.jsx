import { useState } from "react";

const API_BASE = "http://localhost:8080";

export default function NewInventoryItem({ onNavigate }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    
    const [form, setForm] = useState({
        sku: "",
        name: "",
        category: "",
        onHand: 0,
        minQty: 0,
        unitPrice: 0,
        description: ""
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ 
            ...f, 
            [name]: name === "sku" || name === "name" || name === "category" || name === "description" 
                ? value 
                : Number(value) 
        }));
    };

    const generateSKU = () => {
        const prefix = form.category ? form.category.substring(0, 3).toUpperCase() : "ITM";
        const suffix = form.name ? form.name.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase() : "0000";
        const sku = `${prefix}-${suffix}`;
        setForm(f => ({ ...f, sku }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            
            if (!res.ok) {
                if (res.status === 400) {
                    setErr("SKU already exists or invalid data");
                } else {
                    throw new Error(`HTTP ${res.status}`);
                }
                return;
            }
            
            onNavigate && onNavigate("inventory");
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1>New Inventory Item</h1>
                <button 
                    onClick={() => onNavigate && onNavigate("inventory")}
                    style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                >
                    Back to Items
                </button>
            </div>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>SKU *</label>
                    <div style={{ display: "flex", gap: 10 }}>
                        <input
                            name="sku"
                            value={form.sku}
                            onChange={onChange}
                            required
                            placeholder="e.g., OIL-ENG1"
                            style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                        <button
                            type="button"
                            onClick={generateSKU}
                            style={{ padding: "8px 12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: 4 }}
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Name *</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        placeholder="e.g., Engine Oil 5W-30"
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Category *</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={onChange}
                        required
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    >
                        <option value="">Select Category</option>
                        <option value="Spare Parts">Spare Parts</option>
                        <option value="Fluids">Fluids</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Tools">Tools</option>
                        <option value="Consumables">Consumables</option>
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>On Hand Quantity</label>
                        <input
                            name="onHand"
                            type="number"
                            value={form.onHand}
                            onChange={onChange}
                            min="0"
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Minimum Quantity</label>
                        <input
                            name="minQty"
                            type="number"
                            value={form.minQty}
                            onChange={onChange}
                            min="0"
                            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Unit Price</label>
                    <input
                        name="unitPrice"
                        type="number"
                        value={form.unitPrice}
                        onChange={onChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        placeholder="Additional details about the item..."
                        rows="3"
                        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                </div>

                {err && (
                    <div style={{ padding: 10, backgroundColor: "#f8d7da", color: "#721c24", borderRadius: 4 }}>
                        Error: {err}
                    </div>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={() => onNavigate && onNavigate("inventory")}
                        style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
                    >
                        {loading ? "Creating..." : "Create Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}
