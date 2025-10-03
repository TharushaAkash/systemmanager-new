package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Fetch bookings for a customer
    List<Booking> findByCustomerId(Long customerId);

    // Fetch single booking by id and customer
    Optional<Booking> findByIdAndCustomerId(Long id, Long customerId);

    // Fetch bookings with service type eagerly
    @Query("select b from Booking b left join fetch b.serviceType where b.customerId = :customerId")
    List<Booking> findByCustomerIdWithServiceType(@Param("customerId") Long customerId);

    @Query("select b from Booking b left join fetch b.serviceType")
    List<Booking> findAllWithServiceType();

    @Query("select b from Booking b left join fetch b.serviceType where b.id = :id")
    Optional<Booking> findByIdWithServiceType(@Param("id") Long id);

    // Reporting queries
    @Query("SELECT DATE(b.startTime) as bookingDate, COUNT(b) as count FROM Booking b WHERE b.status != 'CANCELLED' GROUP BY DATE(b.startTime) ORDER BY bookingDate DESC")
    List<Object[]> getBookingsByDay();

    @Query("SELECT l.name as locationName, COUNT(b) as count FROM Booking b JOIN Location l ON b.locationId = l.id WHERE b.status != 'CANCELLED' GROUP BY l.id, l.name ORDER BY count DESC")
    List<Object[]> getBookingsByLocation();

    @Query("SELECT st.name as serviceName, COUNT(b) as count, SUM(st.basePrice) as revenue FROM Booking b JOIN ServiceType st ON b.serviceTypeId = st.id WHERE b.status != 'CANCELLED' AND b.type = 'SERVICE' GROUP BY st.id, st.name ORDER BY count DESC")
    List<Object[]> getBookingsByServiceType();
}
