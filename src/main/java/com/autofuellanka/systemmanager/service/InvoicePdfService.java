package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.model.Invoice;
import com.itextpdf.html2pdf.HtmlConverter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    public byte[] generateInvoicePdf(Invoice invoice) throws IOException {
        String html = generateInvoiceHtml(invoice);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(html, outputStream);
        
        return outputStream.toByteArray();
    }

    private String generateInvoiceHtml(Invoice invoice) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String createdDate = invoice.getCreatedAt().format(formatter);
        String dueDate = invoice.getDueDate() != null ? invoice.getDueDate().format(formatter) : "N/A";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice %s</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #1a202c;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        padding: 20px;
                        min-height: 100vh;
                    }
                    
                    .invoice-wrapper {
                        max-width: 850px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        overflow: hidden;
                        position: relative;
                    }
                    
                    .invoice-wrapper::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #667eea 0%%, #764ba2 50%%, #f093fb 100%%);
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #1e3a8a 0%%, #3b82f6 50%%, #06b6d4 100%%);
                        color: white;
                        padding: 40px;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .header::before {
                        content: '';
                        position: absolute;
                        top: -50%%;
                        right: -50%%;
                        width: 200%%;
                        height: 200%%;
                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%%, transparent 70%%);
                        animation: float 6s ease-in-out infinite;
                    }
                    
                    @keyframes float {
                        0%%, 100%% { transform: translateY(0px) rotate(0deg); }
                        50%% { transform: translateY(-20px) rotate(180deg); }
                    }
                    
                    .header-content {
                        position: relative;
                        z-index: 2;
                    }
                    
                    .company-logo {
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    
                    .logo-icon {
                        width: 50px;
                        height: 50px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        font-size: 24px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .company-info h1 {
                        font-size: 2.2rem;
                        font-weight: 800;
                        margin: 0;
                        letter-spacing: -0.02em;
                    }
                    
                    .company-info p {
                        font-size: 1rem;
                        opacity: 0.9;
                        margin: 5px 0 0 0;
                        font-weight: 400;
                    }
                    
                    .invoice-title {
                        text-align: center;
                        margin-top: 30px;
                    }
                    
                    .invoice-title h2 {
                        font-size: 3rem;
                        font-weight: 900;
                        margin: 0;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        letter-spacing: -0.03em;
                    }
                    
                    .invoice-title .subtitle {
                        font-size: 1.1rem;
                        opacity: 0.8;
                        margin-top: 8px;
                        font-weight: 500;
                    }
                    
                    .content {
                        padding: 40px;
                    }
                    
                    .invoice-meta {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 30px;
                        margin-bottom: 40px;
                        padding: 30px;
                        background: linear-gradient(135deg, #f8fafc 0%%, #e2e8f0 100%%);
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .meta-item {
                        text-align: center;
                    }
                    
                    .meta-label {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        margin-bottom: 8px;
                        display: block;
                    }
                    
                    .meta-value {
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #1e293b;
                        word-break: break-all;
                    }
                    
                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 8px 16px;
                        border-radius: 50px;
                        font-size: 0.8rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .status-badge::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%%;
                        width: 100%%;
                        height: 100%%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                        transition: left 0.5s;
                    }
                    
                    .status-badge:hover::before {
                        left: 100%%;
                    }
                    
                    .status-paid {
                        background: linear-gradient(135deg, #10b981 0%%, #059669 100%%);
                        color: white;
                        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
                    }
                    
                    .status-partial {
                        background: linear-gradient(135deg, #f59e0b 0%%, #d97706 100%%);
                        color: white;
                        box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.4);
                    }
                    
                    .status-unpaid {
                        background: linear-gradient(135deg, #ef4444 0%%, #dc2626 100%%);
                        color: white;
                        box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.4);
                    }
                    
                    .amounts-card {
                        background: white;
                        border-radius: 16px;
                        padding: 30px;
                        margin: 30px 0;
                        border: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .amounts-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
                    }
                    
                    .amounts-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                    }
                    
                    .amounts-title::before {
                        content: '💰';
                        margin-right: 10px;
                        font-size: 1.5rem;
                    }
                    
                    .amount-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #f1f5f9;
                        transition: all 0.2s ease;
                    }
                    
                    .amount-row:hover {
                        background: #f8fafc;
                        margin: 0 -15px;
                        padding: 12px 15px;
                        border-radius: 8px;
                    }
                    
                    .amount-row:last-child {
                        border-bottom: none;
                        font-weight: 800;
                        font-size: 1.3rem;
                        color: #1e293b;
                        background: linear-gradient(135deg, #f8fafc 0%%, #e2e8f0 100%%);
                        margin: 10px -15px 0 -15px;
                        padding: 15px;
                        border-radius: 8px;
                        border: 2px solid #3b82f6;
                    }
                    
                    .amount-label {
                        color: #64748b;
                        font-weight: 500;
                        font-size: 0.95rem;
                    }
                    
                    .amount-value {
                        font-weight: 700;
                        color: #1e293b;
                        font-size: 1.05rem;
                    }
                    
                    .notes-section {
                        margin-top: 30px;
                        padding: 20px;
                        background: linear-gradient(135deg, #f0f9ff 0%%, #e0f2fe 100%%);
                        border-radius: 12px;
                        border-left: 4px solid #3b82f6;
                    }
                    
                    .notes-title {
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                    }
                    
                    .notes-title::before {
                        content: '📝';
                        margin-right: 8px;
                    }
                    
                    .notes-content {
                        color: #475569;
                        line-height: 1.6;
                    }
                    
                    .footer {
                        background: linear-gradient(135deg, #1e293b 0%%, #334155 100%%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                    }
                    
                    .footer-content {
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    
                    .company-details h3 {
                        font-size: 1.5rem;
                        font-weight: 800;
                        margin-bottom: 15px;
                        color: #f8fafc;
                    }
                    
                    .company-info {
                        color: #cbd5e1;
                        line-height: 1.8;
                        margin-bottom: 25px;
                    }
                    
                    .contact-info {
                        display: flex;
                        justify-content: center;
                        gap: 30px;
                        margin-bottom: 25px;
                        flex-wrap: wrap;
                    }
                    
                    .contact-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 0.9rem;
                        color: #cbd5e1;
                    }
                    
                    .thank-you {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: #f1f5f9;
                        margin-top: 20px;
                        padding: 15px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .qr-section {
                        margin-top: 30px;
                        padding: 20px;
                        background: white;
                        border-radius: 12px;
                        text-align: center;
                    }
                    
                    .qr-placeholder {
                        width: 120px;
                        height: 120px;
                        background: linear-gradient(135deg, #f1f5f9 0%%, #e2e8f0 100%%);
                        border-radius: 12px;
                        margin: 0 auto 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                        color: #64748b;
                        border: 2px dashed #cbd5e1;
                    }
                    
                    @media print {
                        body { background: white; padding: 0; }
                        .invoice-wrapper { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-wrapper">
                    <div class="header">
                        <div class="header-content">
                            <div class="company-logo">
                                <div class="logo-icon">🚗</div>
                                <div class="company-info">
                                    <h1>AutoFuelLanka</h1>
                                    <p>Premium Vehicle Services & Fuel Management</p>
                                </div>
                            </div>
                            <div class="invoice-title">
                                <h2>INVOICE</h2>
                                <div class="subtitle">Service & Fuel Management</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content">
                        <div class="invoice-meta">
                            <div class="meta-item">
                                <span class="meta-label">Invoice Number</span>
                                <div class="meta-value">%s</div>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Booking Reference</span>
                                <div class="meta-value">#%d</div>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Issue Date</span>
                                <div class="meta-value">%s</div>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Due Date</span>
                                <div class="meta-value">%s</div>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Payment Status</span>
                                <div class="meta-value">
                                    <span class="status-badge status-%s">%s</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="amounts-card">
                            <div class="amounts-title">Payment Summary</div>
                            <div class="amount-row">
                                <span class="amount-label">Service Subtotal</span>
                                <span class="amount-value">LKR %.2f</span>
                            </div>
                            <div class="amount-row">
                                <span class="amount-label">Tax (VAT)</span>
                                <span class="amount-value">LKR %.2f</span>
                            </div>
                            <div class="amount-row">
                                <span class="amount-label">Total Amount</span>
                                <span class="amount-value">LKR %.2f</span>
                            </div>
                            <div class="amount-row">
                                <span class="amount-label">Amount Paid</span>
                                <span class="amount-value">LKR %.2f</span>
                            </div>
                            <div class="amount-row">
                                <span class="amount-label">Balance Due</span>
                                <span class="amount-value">LKR %.2f</span>
                            </div>
                        </div>
                        
                        %s
                        
                        <div class="qr-section">
                            <div class="qr-placeholder">📱</div>
                            <p style="color: #64748b; font-size: 0.9rem; margin: 0;">
                                Scan QR code for quick payment
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-content">
                            <h3>AutoFuelLanka</h3>
                            <div class="company-info">
                                Your trusted partner for comprehensive vehicle services and fuel management solutions.<br>
                                Delivering excellence in automotive care across Sri Lanka.
                            </div>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <span>📧</span>
                                    <span>info@autofuellanka.com</span>
                                </div>
                                <div class="contact-item">
                                    <span>📞</span>
                                    <span>+94 11 234 5678</span>
                                </div>
                                <div class="contact-item">
                                    <span>🌐</span>
                                    <span>www.autofuellanka.com</span>
                                </div>
                            </div>
                            <div class="thank-you">
                                Thank you for choosing AutoFuelLanka! 🚗✨
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, 
            invoice.getInvoiceNumber(),
            invoice.getInvoiceNumber(),
            invoice.getBookingId(),
            createdDate,
            dueDate,
            invoice.getStatus().toString().toLowerCase(),
            invoice.getStatus().toString(),
            invoice.getSubtotal(),
            invoice.getTaxAmount(),
            invoice.getTotalAmount(),
            invoice.getPaidAmount(),
            invoice.getBalance(),
            invoice.getNotes() != null ? 
                String.format("<div class='notes-section'><div class='notes-title'>Additional Notes</div><div class='notes-content'>%s</div></div>", invoice.getNotes()) : ""
        );
    }
}
