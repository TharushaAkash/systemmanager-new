package com.autofuellanka.systemmanager;

import com.autofuellanka.systemmanager.model.Location;
import com.autofuellanka.systemmanager.model.ServiceType;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.model.Vehicle;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@org.springframework.test.context.ActiveProfiles("test")
public class CustomerBookingsIT {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired LocationRepository locations;
    @Autowired ServiceTypeRepository services;
    @Autowired VehicleRepository vehicles;

    Long customerId;
    Long locationId;
    Long vehicleId;
    Long serviceTypeId;

    @BeforeEach
    void setup() {
        User u = new User();
        u.setFirstName("Alice");
        u.setLastName("Smith");
        u.setEmail("alice@example.com");
        u.setPassword("pw");
        u.setPhone("123");
        u.setRole("CUSTOMER");
        users.save(u);
        customerId = u.getId();

        Location loc = new Location("Center A", "Addr", Location.LocationType.SERVICE_CENTER);
        locations.save(loc);
        locationId = loc.getId();

        ServiceType st = new ServiceType();
        st.setCode("OIL");
        st.setName("Oil Change");
        services.save(st);
        serviceTypeId = st.getId();

        Vehicle v = new Vehicle();
        v.setCustomerId(customerId);
        v.setPlateNumber("ABC-1234");
        v.setModel("Car");
        vehicles.save(v);
        vehicleId = v.getId();
    }

    @Test
    void create_service_booking_happy_path() throws Exception {
        String body = "{" +
                "\"startTime\":\"2025-10-02T09:00:00\"," +
                "\"endTime\":\"2025-10-02T10:00:00\"," +
                "\"locationId\":" + locationId + "," +
                "\"serviceTypeId\":" + serviceTypeId + "," +
                "\"vehicleId\":" + vehicleId + "," +
                "\"type\":\"SERVICE\"" +
                "}";

        mvc.perform(post("/api/customers/" + customerId + "/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("SERVICE"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void create_fuel_booking_requires_fuelType_with_liters() throws Exception {
        String body = "{" +
                "\"startTime\":\"2025-10-02T09:00:00\"," +
                "\"endTime\":\"2025-10-02T10:00:00\"," +
                "\"locationId\":" + locationId + "," +
                "\"vehicleId\":" + vehicleId + "," +
                "\"type\":\"FUEL\"," +
                "\"litersRequested\":10" +
                "}";

        mvc.perform(post("/api/customers/" + customerId + "/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void cancel_booking_from_pending() throws Exception {
        String body = "{" +
                "\"startTime\":\"2025-10-02T09:00:00\"," +
                "\"endTime\":\"2025-10-02T10:00:00\"," +
                "\"locationId\":" + locationId + "," +
                "\"serviceTypeId\":" + serviceTypeId + "," +
                "\"vehicleId\":" + vehicleId + "," +
                "\"type\":\"SERVICE\"" +
                "}";

        String resp = mvc.perform(post("/api/customers/" + customerId + "/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.price").value(org.hamcrest.Matchers.notNullValue()))
                .andReturn().getResponse().getContentAsString();

        String id = resp.replaceAll(".*\\\"id\\\":(\\d+).*", "$1");

        mvc.perform(delete("/api/customers/" + customerId + "/bookings/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void status_transitions_enforced() throws Exception {
        String body = "{" +
                "\"startTime\":\"2025-10-02T09:00:00\"," +
                "\"endTime\":\"2025-10-02T10:00:00\"," +
                "\"locationId\":" + locationId + "," +
                "\"serviceTypeId\":" + serviceTypeId + "," +
                "\"vehicleId\":" + vehicleId + "," +
                "\"type\":\"SERVICE\"" +
                "}";

        String created = mvc.perform(post("/api/customers/" + customerId + "/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = created.replaceAll(".*\\\"id\\\":(\\d+).*", "$1");

        mvc.perform(patch("/api/customers/" + customerId + "/bookings/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mvc.perform(patch("/api/customers/" + customerId + "/bookings/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mvc.perform(patch("/api/customers/" + customerId + "/bookings/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mvc.perform(patch("/api/customers/" + customerId + "/bookings/" + id + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELLED\"}"))
                .andExpect(status().isBadRequest());
    }
}


