package com.ridebooking.backend.dto;

public class DriverRegisterRequest {

    private String name;
    private String email;
    private String password;
    private String phone;
    private String vehicleNumber;

    // Default constructor
    public DriverRegisterRequest() {
    }

    // Parameterized constructor
    public DriverRegisterRequest(String name, String email, String password, String phone, String vehicleNumber) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
