package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email, String password);

    List<User> findByRoleIgnoreCase(String role);
}
