package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.dto.FeedbackDTO;
import com.autofuellanka.systemmanager.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {
    
    @Autowired
    private FeedbackService feedbackService;
    
    // Create new feedback
    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        try {
            FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get all feedback
    @GetMapping
    public ResponseEntity<List<FeedbackDTO>> getAllFeedback() {
        List<FeedbackDTO> feedback = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long id) {
        Optional<FeedbackDTO> feedback = feedbackService.getFeedbackById(id);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(feedback.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get feedback by customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByCustomerId(@PathVariable Long customerId) {
        List<FeedbackDTO> feedback = feedbackService.getFeedbackByCustomerId(customerId);
        return ResponseEntity.ok(feedback);
    }
    
    // Get feedback by booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getFeedbackByBookingId(@PathVariable Long bookingId) {
        Optional<FeedbackDTO> feedback = feedbackService.getFeedbackByBookingId(bookingId);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(feedback.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get recent feedback for homepage
    @GetMapping("/recent")
    public ResponseEntity<List<FeedbackDTO>> getRecentFeedback() {
        List<FeedbackDTO> feedback = feedbackService.getRecentFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Get positive feedback
    @GetMapping("/positive")
    public ResponseEntity<List<FeedbackDTO>> getPositiveFeedback() {
        List<FeedbackDTO> feedback = feedbackService.getPositiveFeedback();
        return ResponseEntity.ok(feedback);
    }
    
    // Check if feedback exists for booking
    @GetMapping("/booking/{bookingId}/exists")
    public ResponseEntity<Boolean> checkFeedbackExists(@PathVariable Long bookingId) {
        boolean exists = feedbackService.feedbackExistsForBooking(bookingId);
        return ResponseEntity.ok(exists);
    }
    
    // Update feedback
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeedback(@PathVariable Long id, @RequestBody FeedbackDTO feedbackDTO) {
        try {
            FeedbackDTO updatedFeedback = feedbackService.updateFeedback(id, feedbackDTO);
            return ResponseEntity.ok(updatedFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Delete feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok().body("Feedback deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get feedback statistics
    @GetMapping("/stats")
    public ResponseEntity<FeedbackService.FeedbackStats> getFeedbackStats() {
        FeedbackService.FeedbackStats stats = feedbackService.getFeedbackStats();
        return ResponseEntity.ok(stats);
    }
}
