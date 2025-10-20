import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function InventoryItems({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        sku: '',
        category: '',
        onHand: '',
        minQty: '',
        unitPrice: ''
    });

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/inventory/categories`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error("Error loading categories:", e);
        }
    };

    const onDelete = async (id) => {
        if (!confirm(`Deactivate item #${id}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) {
            setErr(String(e.message));
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditFormData({
            name: item.name || '',
            sku: item.sku || '',
            category: item.category || '',
            onHand: item.onHand || '',
            minQty: item.minQty || '',
            unitPrice: item.unitPrice || ''
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/${editingItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
            setShowEditModal(false);
            setEditingItem(null);
        } catch (e) {
            setErr(String(e.message));
        }
    };

    const handleEditCancel = () => {
        setShowEditModal(false);
        setEditingItem(null);
        setEditFormData({
            name: '',
            sku: '',
            category: '',
            onHand: '',
            minQty: '',
            unitPrice: ''
        });
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/search?q=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = async (category) => {
        setSelectedCategory(category);
        if (!category) {
            await load();
            return;
        }
        
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/inventory/items/category/${encodeURIComponent(category)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data);
        } catch (e) {
            setErr(String(e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    };

    const exportCSV = () => {
        const csvContent = [
            ["SKU", "Name", "Category", "On Hand", "Min Qty", "Unit Price", "Reorder Status"],
            ...items.map(item => [
                item.sku,
                item.name,
                item.category,
                item.onHand,
                item.minQty,
                item.unitPrice || 0,
                item.onHand <= item.minQty ? "Low Stock" : "OK"
            ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "inventory-items.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        load();
        loadCategories();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ 
            padding: "24px", 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
            maxWidth: 1400, 
            margin: "0 auto",
            backgroundColor: "#f8fafc",
            minHeight: "100vh"
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            {/* Header Section */}
            <div style={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                color: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: "2.5rem", 
                            fontWeight: "700",
                            background: "linear-gradient(45deg, #fff, #e0e7ff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            📦 Inventory Management
                        </h1>
                        <p style={{ margin: "8px 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
                            Manage your inventory items and track inventory levels
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button 
                            onClick={() => onNavigate && onNavigate("inventory-new")} 
                            style={{ 
                                padding: "12px 24px", 
                                background: "rgba(255,255,255,0.2)", 
                                color: "white", 
                                border: "2px solid rgba(255,255,255,0.3)", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                backdropFilter: "blur(10px)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.3)";
                                e.target.style.transform = "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = "rgba(255,255,255,0.2)";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            ➕ New Item
                    </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "1.25rem", fontWeight: "600" }}>
                    🔍 Search & Filter
                </h3>
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                    gap: "16px",
                    alignItems: "end"
                }}>
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Search Items
                        </label>
                        <div style={{ position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                style={{ 
                                    width: "100%",
                                    padding: "12px 16px 12px 40px", 
                                    border: "2px solid #e2e8f0", 
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease",
                                    outline: "none"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                            <span style={{ 
                                position: "absolute", 
                                left: "12px", 
                                top: "50%", 
                                transform: "translateY(-50%)",
                                color: "#9ca3af"
                            }}>
                                🔍
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ 
                            display: "block", 
                            marginBottom: "8px", 
                            fontWeight: "500", 
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Category
                        </label>
                <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                            style={{ 
                                width: "100%",
                                padding: "12px 16px", 
                                border: "2px solid #e2e8f0", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                backgroundColor: "white",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                outline: "none"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#667eea"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                    </div>

                    <div>
                        <button 
                            onClick={handleSearch} 
                            style={{ 
                                width: "100%",
                                padding: "12px 24px", 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                                color: "white", 
                                border: "none", 
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 12px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 6px rgba(102, 126, 234, 0.3)";
                            }}
                        >
                            🔍 Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
                <div style={{ 
                    marginBottom: "24px", 
                    padding: "20px", 
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    borderRadius: "12px",
                    border: "1px solid #f59e0b",
                    boxShadow: "0 4px 6px rgba(245, 158, 11, 0.1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ 
                                fontSize: "1.1rem", 
                                fontWeight: "600", 
                                color: "#92400e"
                            }}>
                                ✅ {selectedItems.size} item(s) selected
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                        onClick={() => setSelectedItems(new Set())}
                                style={{ 
                                    padding: "10px 20px", 
                                    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
                                    color: "white", 
                                    border: "none", 
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                }}
                            >
                                ❌ Clear Selection
                    </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Button */}
            <div style={{ marginBottom: "24px" }}>
                <button 
                    onClick={exportCSV} 
                    style={{ 
                        padding: "12px 24px", 
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)"
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 6px 12px rgba(16, 185, 129, 0.4)";
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 6px rgba(16, 185, 129, 0.3)";
                    }}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Content Area */}
            <div style={{ 
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
            }}>
            {loading ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            width: "50px", 
                            height: "50px", 
                            border: "4px solid #e2e8f0", 
                            borderTop: "4px solid #667eea", 
                            borderRadius: "50%", 
                            animation: "spin 1s linear infinite",
                            marginBottom: "20px"
                        }}></div>
                        <p style={{ 
                            fontSize: "1.1rem", 
                            color: "#6b7280", 
                            margin: 0,
                            fontWeight: "500"
                        }}>
                            Loading inventory items...
                        </p>
                    </div>
            ) : err ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "3rem", 
                            marginBottom: "16px"
                        }}>⚠️</div>
                        <p style={{ 
                            color: "#dc2626", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            Error: {err}
                        </p>
                    </div>
            ) : filteredItems.length === 0 ? (
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "60px 20px",
                        textAlign: "center"
                    }}>
                        <div style={{ 
                            fontSize: "3rem", 
                            marginBottom: "16px"
                        }}>📦</div>
                        <p style={{ 
                            color: "#6b7280", 
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            margin: 0
                        }}>
                            No items found matching your criteria.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ 
                            width: "100%", 
                            borderCollapse: "separate", 
                            borderSpacing: "0",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                    <thead>
                                <tr style={{ 
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white"
                                }}>
                                    <th style={{ 
                                        padding: "16px", 
                                        textAlign: "left", 
                                        fontWeight: "600",
                                        fontSize: "0.875rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={handleSelectAll}
                                            style={{ 
                                                transform: "scale(1.2)",
                                                cursor: "pointer"
                                            }}
                            />
                        </th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>SKU</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>On Hand</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Qty</th>
                                    <th style={{ padding: "16px", textAlign: "right", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Unit Price</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                    <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                                {filteredItems.map((item, index) => (
                        <tr 
                            key={item.id}
                            style={{ 
                                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                                            borderBottom: "1px solid #e2e8f0",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease"
                            }}
                            onClick={() => handleSelectItem(item.id)}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = item.onHand <= item.minQty ? "#fef3c7" : "#f1f5f9";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8fafc";
                                        }}
                                    >
                                        <td style={{ padding: "16px" }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    onClick={(e) => e.stopPropagation()}
                                                style={{ 
                                                    transform: "scale(1.2)",
                                                    cursor: "pointer"
                                                }}
                                />
                            </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "600", 
                                            color: "#1e293b",
                                            fontFamily: "monospace"
                                        }}>
                                            {item.sku}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            fontWeight: "500", 
                                            color: "#374151"
                                        }}>
                                            {item.name}
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <span style={{ 
                                                background: "#e0e7ff", 
                                                color: "#3730a3", 
                                                padding: "4px 12px", 
                                                borderRadius: "20px", 
                                                fontSize: "0.75rem",
                                                fontWeight: "500"
                                            }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "center",
                                            fontWeight: item.onHand <= item.minQty ? "700" : "500",
                                            color: item.onHand <= item.minQty ? "#dc2626" : "#374151",
                                            fontSize: "1.1rem"
                                        }}>
                                {item.onHand}
                            </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "center",
                                            color: "#6b7280"
                                        }}>
                                            {item.minQty}
                                        </td>
                                        <td style={{ 
                                            padding: "16px", 
                                            textAlign: "right",
                                            fontWeight: "600",
                                            color: "#059669"
                                        }}>
                                            ${item.unitPrice || 0}
                                        </td>
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                <span style={{ 
                                                color: item.onHand <= item.minQty ? "#dc2626" : "#059669",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                background: item.onHand <= item.minQty ? "#fef2f2" : "#f0fdf4",
                                                border: `1px solid ${item.onHand <= item.minQty ? "#fecaca" : "#bbf7d0"}`
                                            }}>
                                                {item.onHand <= item.minQty ? "⚠️ Low Stock" : "✅ OK"}
                                </span>
                            </td>
                                        <td style={{ padding: "16px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                                                        color: "white", 
                                                        border: "none", 
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                                                >
                                                    ✏️ Edit
                                                </button>
                                <button 
                                    onClick={() => onDelete(item.id)}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                                                        color: "white", 
                                                        border: "none", 
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "500",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"}
                                                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                                                >
                                                    🗑️ Delete
                                </button>
                                            </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                    </div>
            )}
            </div>


            {/* Edit Modal */}
            {showEditModal && (
                <EditModal 
                    item={editingItem}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    categories={categories}
                    onSubmit={handleEditSubmit}
                    onCancel={handleEditCancel}
                />
            )}
        </div>
    );
}


// Edit Modal Component
function EditModal({ item, formData, setFormData, categories, onSubmit, onCancel }) {
    if (!item) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "16px",
                minWidth: "500px",
                maxWidth: "90vw",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}>
                    <h2 style={{
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: "1.8rem",
                        fontWeight: "700",
                        margin: "0"
                    }}>
                        ✏️ Edit Item: {item.name}
                    </h2>
                    <button
                        onClick={onCancel}
                        style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={onSubmit} style={{ display: "grid", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Item Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter item name"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                SKU *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                placeholder="Enter SKU"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    background: "white",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Unit Price *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                                placeholder="0.00"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                On Hand Quantity *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.onHand}
                                onChange={(e) => setFormData({...formData, onHand: e.target.value})}
                                placeholder="0"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Minimum Quantity *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.minQty}
                                onChange={(e) => setFormData({...formData, minQty: e.target.value})}
                                placeholder="0"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "flex-end",
                        marginTop: "20px"
                    }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                background: "#6b7280",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                        >
                            Update Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
