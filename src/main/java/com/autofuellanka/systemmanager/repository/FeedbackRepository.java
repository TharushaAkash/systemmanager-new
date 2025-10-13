package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Find feedback by customer ID
    List<Feedback> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    
    // Find feedback by booking ID
    Optional<Feedback> findByBookingId(Long bookingId);
    
    // Find all feedback ordered by creation date (for homepage display)
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllOrderByCreatedAtDesc();
    
    // Find recent feedback for homepage (limit to 10 most recent)
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findTop10ByOrderByCreatedAtDesc();
    
    // Find feedback by rating range
    List<Feedback> findByRatingBetweenOrderByCreatedAtDesc(int minRating, int maxRating);
    
    // Find feedback with rating >= 4 (positive feedback)
    @Query("SELECT f FROM Feedback f WHERE f.rating >= 4 ORDER BY f.createdAt DESC")
    List<Feedback> findPositiveFeedback();
    
    // Check if feedback exists for a booking
    boolean existsByBookingId(Long bookingId);
    
    // Count feedback by rating
    long countByRating(int rating);
    
    // Get average rating
    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();
}
