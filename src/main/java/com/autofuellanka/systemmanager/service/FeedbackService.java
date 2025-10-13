package com.autofuellanka.systemmanager.service;

import com.autofuellanka.systemmanager.dto.FeedbackDTO;
import com.autofuellanka.systemmanager.model.Feedback;
import com.autofuellanka.systemmanager.model.User;
import com.autofuellanka.systemmanager.model.Booking;
import com.autofuellanka.systemmanager.repository.FeedbackRepository;
import com.autofuellanka.systemmanager.repository.UserRepository;
import com.autofuellanka.systemmanager.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedbackService {
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    // Create new feedback
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        System.out.println("Creating feedback for DTO: " + feedbackDTO);
        
        // Check if feedback already exists for this booking
        if (feedbackRepository.existsByBookingId(feedbackDTO.getBookingId())) {
            throw new RuntimeException("Feedback already exists for this booking");
        }
        
        // Validate booking exists and is completed
        Optional<Booking> bookingOpt = bookingRepository.findById(feedbackDTO.getBookingId());
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found with ID: " + feedbackDTO.getBookingId());
        }
        
        Booking booking = bookingOpt.get();
        System.out.println("Found booking: " + booking.getId() + " with status: " + booking.getStatus());
        
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Feedback can only be submitted for completed bookings. Current status: " + booking.getStatus());
        }
        
        // Validate customer exists
        Optional<User> customerOpt = userRepository.findById(feedbackDTO.getCustomerId());
        if (customerOpt.isEmpty()) {
            throw new RuntimeException("Customer not found with ID: " + feedbackDTO.getCustomerId());
        }
        
        User customer = customerOpt.get();
        System.out.println("Found customer: " + customer.getId() + " - " + customer.getEmail());
        
        // Create feedback entity
        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setBooking(booking);
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());
        feedback.setCreatedAt(LocalDateTime.now());
        
        System.out.println("Saving feedback: " + feedback);
        
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(savedFeedback);
    }
    
    // Get feedback by ID
    public Optional<FeedbackDTO> getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    // Get all feedback
    public List<FeedbackDTO> getAllFeedback() {
        return feedbackRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get feedback by customer ID
    public List<FeedbackDTO> getFeedbackByCustomerId(Long customerId) {
        return feedbackRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get feedback by booking ID
    public Optional<FeedbackDTO> getFeedbackByBookingId(Long bookingId) {
        return feedbackRepository.findByBookingId(bookingId)
                .map(this::convertToDTO);
    }
    
    // Get recent feedback for homepage (top 10)
    public List<FeedbackDTO> getRecentFeedback() {
        return feedbackRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get positive feedback (rating >= 4)
    public List<FeedbackDTO> getPositiveFeedback() {
        return feedbackRepository.findPositiveFeedback()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Update feedback
    public FeedbackDTO updateFeedback(Long id, FeedbackDTO feedbackDTO) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
        if (feedbackOpt.isEmpty()) {
            throw new RuntimeException("Feedback not found");
        }
        
        Feedback feedback = feedbackOpt.get();
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());
        
        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(updatedFeedback);
    }
    
    // Delete feedback
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found");
        }
        feedbackRepository.deleteById(id);
    }
    
    // Check if feedback exists for booking
    public boolean feedbackExistsForBooking(Long bookingId) {
        return feedbackRepository.existsByBookingId(bookingId);
    }
    
    // Get feedback statistics
    public FeedbackStats getFeedbackStats() {
        long totalFeedback = feedbackRepository.count();
        Double averageRating = feedbackRepository.getAverageRating();
        
        return new FeedbackStats(totalFeedback, averageRating != null ? averageRating : 0.0);
    }
    
    // Convert entity to DTO
    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setCustomerId(feedback.getCustomer().getId());
        dto.setBookingId(feedback.getBooking().getId());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        
        // Add additional display information
        String firstName = feedback.getCustomer().getFirstName();
        String lastName = feedback.getCustomer().getLastName();
        String fullName = feedback.getCustomer().getFullName();
        
        if (firstName != null && lastName != null && !firstName.trim().isEmpty() && !lastName.trim().isEmpty()) {
            dto.setCustomerName(firstName + " " + lastName);
        } else if (fullName != null && !fullName.trim().isEmpty()) {
            dto.setCustomerName(fullName);
        } else if (firstName != null && !firstName.trim().isEmpty()) {
            dto.setCustomerName(firstName);
        } else if (lastName != null && !lastName.trim().isEmpty()) {
            dto.setCustomerName(lastName);
        } else {
            dto.setCustomerName("Anonymous Customer");
        }
        dto.setCustomerEmail(feedback.getCustomer().getEmail());
        
        // Get service name from booking
        if (feedback.getBooking().getServiceType() != null) {
            dto.setBookingServiceName(feedback.getBooking().getServiceType().getName());
        }
        
        return dto;
    }
    
    // Inner class for feedback statistics
    public static class FeedbackStats {
        private long totalFeedback;
        private double averageRating;
        
        public FeedbackStats(long totalFeedback, double averageRating) {
            this.totalFeedback = totalFeedback;
            this.averageRating = averageRating;
        }
        
        public long getTotalFeedback() { return totalFeedback; }
        public double getAverageRating() { return averageRating; }
    }
}
