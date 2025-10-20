package com.autofuellanka.systemmanager.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaUpdater implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Update foreign key constraints to allow NULL values
            System.out.println("Updating database schema to allow NULL foreign keys...");
            
            // 1. Update feedback table
            jdbcTemplate.execute("ALTER TABLE feedback MODIFY COLUMN booking_id BIGINT NULL");
            System.out.println("✓ Updated feedback.booking_id to allow NULL");
            
            // 2. Update jobs table
            jdbcTemplate.execute("ALTER TABLE jobs MODIFY COLUMN booking_id BIGINT NULL");
            System.out.println("✓ Updated jobs.booking_id to allow NULL");
            
            // 3. Update invoices table
            jdbcTemplate.execute("ALTER TABLE invoices MODIFY COLUMN booking_id BIGINT NULL");
            System.out.println("✓ Updated invoices.booking_id to allow NULL");
            
            // 4. Update payments table
            jdbcTemplate.execute("ALTER TABLE payments MODIFY COLUMN invoice_id BIGINT NULL");
            System.out.println("✓ Updated payments.invoice_id to allow NULL");
            
            System.out.println("Database schema update completed successfully!");
            
        } catch (Exception e) {
            System.err.println("Error updating database schema: " + e.getMessage());
            // Don't fail the application startup if schema update fails
            // The error might be that the columns are already updated
        }
    }
}
