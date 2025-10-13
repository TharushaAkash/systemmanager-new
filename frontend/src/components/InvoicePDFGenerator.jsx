import React, { useRef } from 'react';
import InvoiceTemplate from './InvoiceTemplate';

const InvoicePDFGenerator = ({ invoice, customer, companyInfo, onClose }) => {
    const componentRef = useRef();

    // Frontend PDF generation (print method)
    const handlePrintPDF = () => {
        const printWindow = window.open('', '_blank');
        const printContent = componentRef.current.innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice-${invoice.invoiceNumber || invoice.id}</title>
                <style>
                    @media print {
                        @page {
                            size: A4;
                            margin: 0.5in;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '10px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '95vw',
                maxHeight: '95vh',
                overflow: 'auto',
                position: 'relative',
                border: '3px solid #000000'
            }}>
                {/* Header with controls */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#f0f0f0',
                    padding: '15px',
                    borderBottom: '2px solid #000000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <h3 style={{
                        margin: 0,
                        color: '#000000',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}>
                        Invoice Preview - #{invoice.invoiceNumber || invoice.id}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handlePrintPDF}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#000000',
                                color: 'white',
                                border: '2px solid #000000',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            🖨️ Print PDF
                        </button>
                        
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#666666',
                                color: 'white',
                                border: '2px solid #666666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Invoice Template */}
                <div ref={componentRef} style={{ backgroundColor: 'white' }}>
                    <InvoiceTemplate 
                        invoice={invoice} 
                        customer={customer} 
                        companyInfo={companyInfo} 
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoicePDFGenerator;
