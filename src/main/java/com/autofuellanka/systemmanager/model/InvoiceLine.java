package com.autofuellanka.systemmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_lines",
        indexes = {
                @Index(name = "idx_invoice_lines_invoice", columnList = "invoice_id"),
                @Index(name = "idx_invoice_lines_type", columnList = "type")
        })
public class InvoiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private InvoiceLineType type; // SERVICE or PART

    @Column(name = "reference_id")
    private Long referenceId; // ID of service type or inventory item

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice = 0.0;

    @Column(name = "line_total", nullable = false)
    private Double lineTotal = 0.0;

    @PrePersist
    @PreUpdate
    public void calculateLineTotal() {
        lineTotal = quantity * unitPrice;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }

    public InvoiceLineType getType() { return type; }
    public void setType(InvoiceLineType type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getLineTotal() { return lineTotal; }
    public void setLineTotal(Double lineTotal) { this.lineTotal = lineTotal; }
}
