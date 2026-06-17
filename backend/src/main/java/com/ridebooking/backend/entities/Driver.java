package com.ridebooking.backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Link to the user account
    private String name;
    private String phone;
    private String vehicleNumber;
    private boolean available = true;

    // Default constructor
    public Driver() {
    }

    // Parameterized constructor with userId
    public Driver(Long userId, String name, String phone, String vehicleNumber, boolean available) {
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.available = available;
    }

    // Parameterized constructor without userId (for backward compatibility if needed)
    public Driver(String name, String phone, String vehicleNumber, boolean available) {
        this.name = name;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.available = available;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
