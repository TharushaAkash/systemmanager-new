package com.autofuellanka.systemmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "users")
@Where(clause = "role = 'CUSTOMER'") // limit this entity view to customers only
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false) // you said no hashing for now
    private String password;

    private String phone;

    private String address;

    // stored in the same "users" table, will be 'CUSTOMER' here
    private String role;

    // MySQL bit(1) -> Boolean
    private Boolean enabled;

    // --- getters & setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
