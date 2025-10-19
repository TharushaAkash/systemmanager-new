import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Invoices = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        customerId: '',
        amount: '',
        dueDate: '',
        status: 'PENDING',
        description: '',
        serviceType: '',
        paymentMethod: 'CASH'
    });

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: '#f59e0b', emoji: '⏳' },
        { value: 'PAID', label: 'Paid', color: '#22c55e', emoji: '✅' },
        { value: 'OVERDUE', label: 'Overdue', color: '#ef4444', emoji: '⚠️' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#6b7280', emoji: '❌' }
    ];

    const paymentMethods = [
        { value: 'CASH', label: 'Cash', emoji: '💵' },
        { value: 'CARD', label: 'Card', emoji: '💳' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer', emoji: '🏦' },
        { value: 'CHEQUE', label: 'Cheque', emoji: '📝' }
    ];

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/invoices', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch invoices');
            }

            const data = await response.json();
            setInvoices(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingInvoice 
                ? `http://localhost:8080/api/invoices/${editingInvoice.id}`
                : 'http://localhost:8080/api/invoices';
            
            const method = editingInvoice ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save invoice');
            }

            await fetchInvoices();
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/invoices/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete invoice');
            }

            await fetchInvoices();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setFormData({
            invoiceNumber: invoice.invoiceNumber || '',
            customerId: invoice.customerId || '',
            amount: invoice.amount || '',
            dueDate: invoice.dueDate || '',
            status: invoice.status || 'PENDING',
            description: invoice.description || '',
            serviceType: invoice.serviceType || '',
            paymentMethod: invoice.paymentMethod || 'CASH'
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            invoiceNumber: '',
            customerId: '',
            amount: '',
            dueDate: '',
            status: 'PENDING',
            description: '',
            serviceType: '',
            paymentMethod: 'CASH'
        });
        setEditingInvoice(null);
        setShowForm(false);
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            invoice.customerId?.toString().includes(searchTerm) ||
                            invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadge = (status) => {
        const statusConfig = statusOptions.find(option => option.value === status);
        return (
            <span style={{
                background: `${statusConfig?.color}20`,
                color: statusConfig?.color,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: `1px solid ${statusConfig?.color}40`
            }}>
                {statusConfig?.emoji} {statusConfig?.label}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const methodConfig = paymentMethods.find(option => option.value === method);
        return (
            <span style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
            }}>
                {methodConfig?.emoji} {methodConfig?.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '20px',
                margin: '20px'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <h3 style={{ margin: '0', fontSize: '1.2rem' }}>Loading Invoices...</h3>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                `}
            </style>

            {/* Header Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '30px',
                marginBottom: '30px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                animation: 'fadeInUp 0.6s ease-out'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h1 style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            margin: '0 0 10px 0'
                        }}>
                            💰 Invoice Management
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '1.1rem',
                            margin: '0'
                        }}>
                            Manage invoices, payments, and financial records
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                            transition: 'all 0.3s ease',
                            animation: 'pulse 2s infinite'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                        }}
                    >
                        ➕ Create New Invoice
                    </button>
                </div>

                {/* Statistics Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {[
                        { title: 'Total Invoices', value: invoices.length, color: '#3b82f6', icon: '📄' },
                        { title: 'Pending', value: invoices.filter(i => i.status === 'PENDING').length, color: '#f59e0b', icon: '⏳' },
                        { title: 'Paid', value: invoices.filter(i => i.status === 'PAID').length, color: '#22c55e', icon: '✅' },
                        { title: 'Overdue', value: invoices.filter(i => i.status === 'OVERDUE').length, color: '#ef4444', icon: '⚠️' }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            style={{
                                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                                border: `2px solid ${stat.color}30`,
                                borderRadius: '15px',
                                padding: '20px',
                                textAlign: 'center',
                                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{stat.icon}</div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: stat.color,
                                marginBottom: '5px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                color: '#6b7280',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {stat.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search and Filter Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '25px',
                marginBottom: '30px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                animation: 'fadeInUp 0.8s ease-out 0.2s both'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '20px',
                    alignItems: 'end'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            🔍 Search Invoices
                        </label>
                        <input
                            type="text"
                            placeholder="Search by invoice number, customer, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                background: 'white'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#f59e0b';
                                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#374151'
                        }}>
                            📊 Status Filter
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                background: 'white',
                                cursor: 'pointer',
                                minWidth: '150px'
                            }}
                        >
                            <option value="ALL">All Status</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.emoji} {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setCurrentPage(1);
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    animation: 'fadeInUp 0.3s ease-out'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        animation: 'fadeInUp 0.4s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '25px'
                        }}>
                            <h2 style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '1.8rem',
                                fontWeight: '700',
                                margin: '0'
                            }}>
                                {editingInvoice ? '✏️ Edit Invoice' : '➕ Create New Invoice'}
                            </h2>
                            <button
                                onClick={resetForm}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Invoice Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                                        placeholder="INV-001"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#f59e0b';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Customer ID *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                                        placeholder="123"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#f59e0b';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#f59e0b';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#f59e0b';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Status *
                                    </label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            background: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.emoji} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151'
                                    }}>
                                        Payment Method *
                                    </label>
                                    <select
                                        required
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            background: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.emoji} {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Service Type
                                </label>
                                <input
                                    type="text"
                                    value={formData.serviceType}
                                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                                    placeholder="Fuel Service, Maintenance, etc."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#f59e0b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Invoice description or notes..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#f59e0b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'flex-end',
                                marginTop: '20px'
                            }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        background: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    color: '#dc2626',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ fontWeight: '600' }}>Error: {error}</span>
                </div>
            )}

            {/* Invoices Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                animation: 'fadeInUp 1s ease-out 0.4s both'
            }}>
                <h3 style={{
                    color: '#1f2937',
                    margin: '0 0 25px 0',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                }}>
                    📋 Invoice Records ({filteredInvoices.length} invoices)
                </h3>

                {filteredInvoices.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#6b7280'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>No invoices found</h3>
                        <p style={{ margin: '0', fontSize: '1rem' }}>
                            {searchTerm || statusFilter !== 'ALL' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first invoice to get started'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            overflowX: 'auto',
                            borderRadius: '15px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                background: 'white'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white'
                                    }}>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Invoice #
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Customer
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Amount
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Due Date
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Status
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Payment
                                        </th>
                                        <th style={{
                                            padding: '20px 15px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInvoices.map((invoice, index) => (
                                        <tr
                                            key={invoice.id}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'all 0.3s ease',
                                                background: index % 2 === 0 ? 'white' : '#fafafa'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = '#f8fafc';
                                                e.currentTarget.style.transform = 'scale(1.01)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <td style={{
                                                padding: '20px 15px',
                                                fontWeight: '600',
                                                color: '#1f2937'
                                            }}>
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px',
                                                color: '#6b7280'
                                            }}>
                                                #{invoice.customerId}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px',
                                                fontWeight: '600',
                                                color: '#059669',
                                                fontSize: '1.1rem'
                                            }}>
                                                Rs. {parseFloat(invoice.amount || 0).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px',
                                                color: '#6b7280'
                                            }}>
                                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px'
                                            }}>
                                                {getStatusBadge(invoice.status)}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px'
                                            }}>
                                                {getPaymentMethodBadge(invoice.paymentMethod)}
                                            </td>
                                            <td style={{
                                                padding: '20px 15px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '8px'
                                                }}>
                                                    <button
                                                        onClick={() => handleEdit(invoice)}
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.background = '#2563eb';
                                                            e.target.style.transform = 'translateY(-1px)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.background = '#3b82f6';
                                                            e.target.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(invoice.id)}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.background = '#dc2626';
                                                            e.target.style.transform = 'translateY(-1px)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.background = '#ef4444';
                                                            e.target.style.transform = 'translateY(0)';
                                                        }}
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginTop: '30px'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        background: currentPage === 1 ? '#f3f4f6' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: currentPage === 1 ? '#9ca3af' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    ← Previous
                                </button>
                                
                                <div style={{
                                    display: 'flex',
                                    gap: '5px'
                                }}>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{
                                                background: currentPage === page 
                                                    ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                                    : 'white',
                                                color: currentPage === page ? 'white' : '#374151',
                                                border: currentPage === page ? 'none' : '2px solid #e5e7eb',
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease',
                                                minWidth: '40px'
                                            }}
                                            onMouseOver={(e) => {
                                                if (currentPage !== page) {
                                                    e.target.style.background = '#f8fafc';
                                                    e.target.style.borderColor = '#f59e0b';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (currentPage !== page) {
                                                    e.target.style.background = 'white';
                                                    e.target.style.borderColor = '#e5e7eb';
                                                }
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        background: currentPage === totalPages ? '#f3f4f6' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: currentPage === totalPages ? '#9ca3af' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Invoices;
