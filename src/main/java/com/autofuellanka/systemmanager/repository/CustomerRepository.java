package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    List<Customer> findByEnabled(Boolean enabled);
    List<Customer> findByEmailContainingIgnoreCase(String emailPart);
    List<Customer> findByPhoneContainingIgnoreCase(String phonePart);
}
