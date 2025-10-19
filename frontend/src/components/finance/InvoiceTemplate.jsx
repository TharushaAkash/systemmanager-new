import React from 'react';

const InvoiceTemplate = ({ invoice, customer, companyInfo }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString('en-LK');
        } catch {
            return dateString;
        }
    };

    return (
        <div style={{
            fontFamily: "Arial, sans-serif",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: "12px",
            lineHeight: "1.4"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                paddingBottom: "15px",
                borderBottom: "3px solid #000000"
            }}>
                <div>
                    <h1 style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#000000",
                        margin: "0 0 5px 0"
                    }}>
                        {companyInfo?.name || "AutoFuel Lanka"}
                    </h1>
                    <div style={{ fontSize: "11px", color: "#333333" }}>
                        <p style={{ margin: "2px 0" }}>{companyInfo?.address || "123 Main Street, Colombo 03"}</p>
                        <p style={{ margin: "2px 0" }}>Tel: {companyInfo?.phone || "+94 11 234 5678"}</p>
                        <p style={{ margin: "2px 0" }}>Email: {companyInfo?.email || "info@autofuellanka.com"}</p>
                    </div>
                </div>
                <div style={{
                    textAlign: "right",
                    backgroundColor: "#f0f0f0",
                    padding: "15px",
                    border: "2px solid #000000"
                }}>
                    <h2 style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#000000",
                        margin: "0 0 10px 0"
                    }}>
                        INVOICE
                    </h2>
                    <div style={{ fontSize: "11px" }}>
                        <p style={{ margin: "3px 0" }}><strong>Invoice #:</strong> {invoice.invoiceNumber || invoice.id}</p>
                        <p style={{ margin: "3px 0" }}><strong>Date:</strong> {formatDate(invoice.invoiceDate || invoice.createdAt)}</p>
                        <p style={{ margin: "3px 0" }}><strong>Status:</strong> {invoice.status || "UNPAID"}</p>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px"
            }}>
                <div style={{
                    backgroundColor: "#f8f8f8",
                    padding: "15px",
                    border: "1px solid #000000",
                    flex: "1",
                    marginRight: "10px"
                }}>
                    <h3 style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#000000",
                        margin: "0 0 8px 0",
                        borderBottom: "1px solid #000000",
                        paddingBottom: "3px"
                    }}>
                        BILL TO:
                    </h3>
                    <div style={{ fontSize: "11px" }}>
                        <p style={{ margin: "2px 0", fontWeight: "bold" }}>
                            {customer?.firstName} {customer?.lastName}
                        </p>
                        <p style={{ margin: "2px 0" }}>{customer?.email}</p>
                        <p style={{ margin: "2px 0" }}>{customer?.phone}</p>
                        {customer?.address && <p style={{ margin: "2px 0" }}>{customer.address}</p>}
                    </div>
                </div>
                <div style={{
                    backgroundColor: "#f0f8ff",
                    padding: "15px",
                    border: "1px solid #000000",
                    flex: "1"
                }}>
                    <h3 style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#000000",
                        margin: "0 0 8px 0",
                        borderBottom: "1px solid #000000",
                        paddingBottom: "3px"
                    }}>
                        SERVICE INFO:
                    </h3>
                    <div style={{ fontSize: "11px" }}>
                        <p style={{ margin: "2px 0" }}><strong>Booking ID:</strong> #{invoice.bookingId || "N/A"}</p>
                        <p style={{ margin: "2px 0" }}><strong>Service:</strong> {invoice.serviceType || "Vehicle Service"}</p>
                        <p style={{ margin: "2px 0" }}><strong>Description:</strong> {invoice.description || "Professional service"}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: "20px" }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "2px solid #000000"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#e0e0e0" }}>
                            <th style={{
                                padding: "8px",
                                textAlign: "left",
                                fontWeight: "bold",
                                fontSize: "11px",
                                border: "1px solid #000000",
                                backgroundColor: "#d0d0d0"
                            }}>
                                Description
                            </th>
                            <th style={{
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "11px",
                                border: "1px solid #000000",
                                backgroundColor: "#d0d0d0"
                            }}>
                                Qty
                            </th>
                            <th style={{
                                padding: "8px",
                                textAlign: "right",
                                fontWeight: "bold",
                                fontSize: "11px",
                                border: "1px solid #000000",
                                backgroundColor: "#d0d0d0"
                            }}>
                                Unit Price
                            </th>
                            <th style={{
                                padding: "8px",
                                textAlign: "right",
                                fontWeight: "bold",
                                fontSize: "11px",
                                border: "1px solid #000000",
                                backgroundColor: "#d0d0d0"
                            }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.invoiceLines && invoice.invoiceLines.length > 0 ? (
                            invoice.invoiceLines.map((line, index) => (
                                <tr key={index} style={{
                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f8f8"
                                }}>
                                    <td style={{
                                        padding: "6px",
                                        fontSize: "11px",
                                        border: "1px solid #000000"
                                    }}>
                                        {line.description}
                                    </td>
                                    <td style={{
                                        padding: "6px",
                                        textAlign: "center",
                                        fontSize: "11px",
                                        border: "1px solid #000000"
                                    }}>
                                        {line.quantity}
                                    </td>
                                    <td style={{
                                        padding: "6px",
                                        textAlign: "right",
                                        fontSize: "11px",
                                        border: "1px solid #000000"
                                    }}>
                                        {formatCurrency(line.unitPrice)}
                                    </td>
                                    <td style={{
                                        padding: "6px",
                                        textAlign: "right",
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        border: "1px solid #000000"
                                    }}>
                                        {formatCurrency(line.lineTotal)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{
                                    padding: "15px",
                                    textAlign: "center",
                                    fontSize: "11px",
                                    border: "1px solid #000000"
                                }}>
                                    No items found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "20px"
            }}>
                <div style={{
                    width: "250px",
                    backgroundColor: "#f0f0f0",
                    padding: "15px",
                    border: "2px solid #000000"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{
                                    padding: "4px 0",
                                    fontSize: "11px",
                                    borderBottom: "1px solid #000000"
                                }}>
                                    Subtotal:
                                </td>
                                <td style={{
                                    padding: "4px 0",
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    borderBottom: "1px solid #000000"
                                }}>
                                    {formatCurrency(invoice.subtotal)}
                                </td>
                            </tr>
                            <tr>
                                <td style={{
                                    padding: "4px 0",
                                    fontSize: "11px",
                                    borderBottom: "1px solid #000000"
                                }}>
                                    Tax (15%):
                                </td>
                                <td style={{
                                    padding: "4px 0",
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    borderBottom: "1px solid #000000"
                                }}>
                                    {formatCurrency(invoice.taxAmount)}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: "#e0e0e0" }}>
                                <td style={{
                                    padding: "6px 0",
                                    fontSize: "12px",
                                    fontWeight: "bold"
                                }}>
                                    TOTAL:
                                </td>
                                <td style={{
                                    padding: "6px 0",
                                    textAlign: "right",
                                    fontSize: "14px",
                                    fontWeight: "bold"
                                }}>
                                    {formatCurrency(invoice.totalAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Info */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px"
            }}>
                <div style={{
                    backgroundColor: "#f8f8f8",
                    padding: "12px",
                    border: "1px solid #000000",
                    flex: "1",
                    marginRight: "10px"
                }}>
                    <h4 style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        margin: "0 0 5px 0",
                        color: "#000000"
                    }}>
                        PAYMENT INFO:
                    </h4>
                    <div style={{ fontSize: "10px" }}>
                        <p style={{ margin: "2px 0" }}>Paid: {formatCurrency(invoice.paidAmount || 0)}</p>
                        <p style={{ margin: "2px 0" }}>Balance: {formatCurrency(invoice.balance || invoice.totalAmount)}</p>
                        <p style={{ margin: "2px 0" }}>Methods: Cash, Card, Transfer</p>
                    </div>
                </div>
                <div style={{
                    backgroundColor: "#fff8dc",
                    padding: "12px",
                    border: "1px solid #000000",
                    flex: "1"
                }}>
                    <h4 style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        margin: "0 0 5px 0",
                        color: "#000000"
                    }}>
                        TERMS:
                    </h4>
                    <div style={{ fontSize: "10px" }}>
                        <p style={{ margin: "1px 0" }}>• Payment due in 30 days</p>
                        <p style={{ margin: "1px 0" }}>• 6-month warranty included</p>
                        <p style={{ margin: "1px 0" }}>• Thank you for your business!</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: "center",
                paddingTop: "10px",
                borderTop: "2px solid #000000",
                fontSize: "10px",
                color: "#333333"
            }}>
                <p style={{ margin: "3px 0" }}>
                    This is a computer-generated invoice. No signature required.
                </p>
                <p style={{ margin: "3px 0" }}>
                    For queries: {companyInfo?.email || "info@autofuellanka.com"}
                </p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
