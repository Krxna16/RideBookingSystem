package com.ridebooking.backend.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String role;
    private String name;
    private Long userId;
    private Long driverId; // Included if role is ROLE_DRIVER

    // Default constructor
    public AuthResponse() {
    }

    // Parameterized constructor (backward compatibility)
    public AuthResponse(String token, String email, String role, String name, Long userId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.driverId = null;
    }

    // Parameterized constructor with driverId
    public AuthResponse(String token, String email, String role, String name, Long userId, Long driverId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.name = name;
        this.userId = userId;
        this.driverId = driverId;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }
}
