package com.autofuellanka.systemmanager;

import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.model.Location;
import com.autofuellanka.systemmanager.model.ServiceType;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.model.Vehicle;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import com.autofuellanka.systemmanager.repository.LocationRepository;
import com.autofuellanka.systemmanager.repository.ServiceTypeRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@org.springframework.test.context.ActiveProfiles("test")
public class ReportControllerIT {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired LocationRepository locations;
    @Autowired ServiceTypeRepository services;
    @Autowired VehicleRepository vehicles;
    @Autowired BookingRepository bookings;

    Long customerId;
    Long locationId;
    Long vehicleId;
    Long serviceTypeId;

    @BeforeEach
    void setup() {
        // Create test data
        User u = new User();
        u.setFirstName("Test");
        u.setLastName("Customer");
        u.setEmail("test@example.com");
        u.setPassword("pw");
        u.setPhone("123");
        u.setRole("CUSTOMER");
        users.save(u);
        customerId = u.getId();

        Location loc = new Location("Test Center", "Test Address", Location.LocationType.SERVICE_CENTER);
        locations.save(loc);
        locationId = loc.getId();

        ServiceType st = new ServiceType();
        st.setCode("TEST");
        st.setName("Test Service");
        st.setBasePrice(100.0);
        services.save(st);
        serviceTypeId = st.getId();

        Vehicle v = new Vehicle();
        v.setCustomerId(customerId);
        v.setPlateNumber("TEST-123");
        v.setModel("Test Car");
        vehicles.save(v);
        vehicleId = v.getId();

        // Create test bookings
        Booking b1 = new Booking();
        b1.setCustomerId(customerId);
        b1.setLocationId(locationId);
        b1.setVehicleId(vehicleId);
        b1.setServiceTypeId(serviceTypeId);
        b1.setStartTime("2025-01-01T09:00:00");
        b1.setEndTime("2025-01-01T10:00:00");
        b1.setType("SERVICE");
        b1.setStatus("COMPLETED");
        bookings.save(b1);

        Booking b2 = new Booking();
        b2.setCustomerId(customerId);
        b2.setLocationId(locationId);
        b2.setVehicleId(vehicleId);
        b2.setServiceTypeId(serviceTypeId);
        b2.setStartTime("2025-01-01T14:00:00");
        b2.setEndTime("2025-01-01T15:00:00");
        b2.setType("SERVICE");
        b2.setStatus("COMPLETED");
        bookings.save(b2);
    }

    @Test
    void getBookingsByDay() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-day"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].label").exists())
                .andExpect(jsonPath("$[0].count").value(2));
    }

    @Test
    void getBookingsByLocation() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-location"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].label").value("Test Center"))
                .andExpect(jsonPath("$[0].count").value(2));
    }

    @Test
    void getBookingsByServiceType() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-service"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].label").value("Test Service"))
                .andExpect(jsonPath("$[0].count").value(2))
                .andExpect(jsonPath("$[0].revenue").value(200.0));
    }

    @Test
    void getRevenueSummary() throws Exception {
        mvc.perform(get("/api/reports/revenue-summary"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalRevenue").value(200.0))
                .andExpect(jsonPath("$.totalBookings").value(2))
                .andExpect(jsonPath("$.averageRevenuePerBooking").value(100.0))
                .andExpect(jsonPath("$.generatedAt").exists());
    }

    @Test
    void getBookingsByDayCsv() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-day/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=bookings-by-day.csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Date,Count")));
    }

    @Test
    void getBookingsByLocationCsv() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-location/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=bookings-by-location.csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Location,Count")));
    }

    @Test
    void getBookingsByServiceCsv() throws Exception {
        mvc.perform(get("/api/reports/bookings-by-service/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=bookings-by-service.csv"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Service,Count,Revenue")));
    }
}
