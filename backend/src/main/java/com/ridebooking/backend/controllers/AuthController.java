package com.ridebooking.backend.controllers;

import com.ridebooking.backend.dto.AuthResponse;
import com.ridebooking.backend.dto.UserLoginRequest;
import com.ridebooking.backend.dto.UserRegisterRequest;
import com.ridebooking.backend.dto.DriverRegisterRequest;
import com.ridebooking.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Endpoint for passenger registration
    @PostMapping("/register/user")
    public ResponseEntity<String> registerUser(@RequestBody UserRegisterRequest request) {
        try {
            request.setRole("ROLE_USER");
            String result = authService.registerUser(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint for driver registration
    @PostMapping("/register/driver")
    public ResponseEntity<String> registerDriver(@RequestBody DriverRegisterRequest request) {
        try {
            String result = authService.registerDriver(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint for user and driver login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials or error: " + e.getMessage());
        }
    }
}
