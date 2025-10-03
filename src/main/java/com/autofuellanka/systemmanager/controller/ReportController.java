package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.ReportDTO;
import com.autofuellanka.systemmanager.repository.BookingRepository;
// Swagger annotations will be added once dependencies are resolved
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final BookingRepository bookingRepo;

    public ReportController(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    @GetMapping("/bookings-by-day")
    public List<ReportDTO> getBookingsByDay() {
        return bookingRepo.getBookingsByDay().stream()
                .map(row -> {
                    String date = row[0].toString();
                    Long count = ((Number) row[1]).longValue();
                    return new ReportDTO(date, count);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/bookings-by-location")
    public List<ReportDTO> getBookingsByLocation() {
        return bookingRepo.getBookingsByLocation().stream()
                .map(row -> {
                    String location = (String) row[0];
                    Long count = ((Number) row[1]).longValue();
                    return new ReportDTO(location, count);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/bookings-by-service")
    public List<ReportDTO> getBookingsByServiceType() {
        return bookingRepo.getBookingsByServiceType().stream()
                .map(row -> {
                    String service = (String) row[0];
                    Long count = ((Number) row[1]).longValue();
                    Double revenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
                    return new ReportDTO(service, count, revenue);
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<?> getRevenueSummary() {
        List<ReportDTO> serviceReports = getBookingsByServiceType();
        Double totalRevenue = serviceReports.stream()
                .mapToDouble(r -> r.getRevenue() != null ? r.getRevenue() : 0.0)
                .sum();
        Long totalBookings = serviceReports.stream()
                .mapToLong(r -> r.getCount())
                .sum();

        Map<String, Object> summary = Map.of(
                "totalRevenue", totalRevenue,
                "totalBookings", totalBookings,
                "averageRevenuePerBooking", totalBookings > 0 ? totalRevenue / totalBookings : 0.0,
                "generatedAt", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping(value = "/bookings-by-day/csv", produces = "text/csv")
    public ResponseEntity<String> getBookingsByDayCsv() {
        List<ReportDTO> reports = getBookingsByDay();
        String csv = "Date,Count\n" + 
                reports.stream()
                        .map(r -> r.getLabel() + "," + r.getCount())
                        .collect(Collectors.joining("\n"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-by-day.csv")
                .contentType(MediaType.valueOf("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/bookings-by-location/csv", produces = "text/csv")
    public ResponseEntity<String> getBookingsByLocationCsv() {
        List<ReportDTO> reports = getBookingsByLocation();
        String csv = "Location,Count\n" + 
                reports.stream()
                        .map(r -> r.getLabel() + "," + r.getCount())
                        .collect(Collectors.joining("\n"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-by-location.csv")
                .contentType(MediaType.valueOf("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/bookings-by-service/csv", produces = "text/csv")
    public ResponseEntity<String> getBookingsByServiceCsv() {
        List<ReportDTO> reports = getBookingsByServiceType();
        String csv = "Service,Count,Revenue\n" + 
                reports.stream()
                        .map(r -> r.getLabel() + "," + r.getCount() + "," + (r.getRevenue() != null ? r.getRevenue() : 0))
                        .collect(Collectors.joining("\n"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-by-service.csv")
                .contentType(MediaType.valueOf("text/csv"))
                .body(csv);
    }
}
