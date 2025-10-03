package com.autofuellanka.systemmanager.dto;

import java.util.Map;

public class ReportDTO {
    private String label;
    private Long count;
    private Double revenue;
    private Map<String, Object> metadata;

    public ReportDTO(String label, Long count) {
        this.label = label;
        this.count = count;
    }

    public ReportDTO(String label, Long count, Double revenue) {
        this.label = label;
        this.count = count;
        this.revenue = revenue;
    }

    public ReportDTO(String label, Long count, Double revenue, Map<String, Object> metadata) {
        this.label = label;
        this.count = count;
        this.revenue = revenue;
        this.metadata = metadata;
    }

    // Getters
    public String getLabel() { return label; }
    public Long getCount() { return count; }
    public Double getRevenue() { return revenue; }
    public Map<String, Object> getMetadata() { return metadata; }
}
