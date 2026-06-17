package com.ridebooking.backend.services;

import com.ridebooking.backend.dto.AuthResponse;
import com.ridebooking.backend.dto.UserLoginRequest;
import com.ridebooking.backend.dto.UserRegisterRequest;
import com.ridebooking.backend.dto.DriverRegisterRequest;
import com.ridebooking.backend.entities.Driver;
import com.ridebooking.backend.entities.User;
import com.ridebooking.backend.repositories.DriverRepository;
import com.ridebooking.backend.repositories.UserRepository;
import com.ridebooking.backend.config.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       DriverRepository driverRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    // Register User (Passenger)
    public String registerUser(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : "ROLE_USER"
        );

        userRepository.save(user);
        return "User registered successfully!";
    }

    // Register Driver
    public String registerDriver(DriverRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // 1. Save User credentials for Security Login
        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                "ROLE_DRIVER"
        );
        User savedUser = userRepository.save(user);

        // 2. Save Driver Specific Details
        Driver driver = new Driver(
                savedUser.getId(),
                request.getName(),
                request.getPhone(),
                request.getVehicleNumber(),
                true // Available by default
        );
        driverRepository.save(driver);

        return "Driver registered successfully!";
    }

    // Login (Common for User and Driver)
    public AuthResponse login(UserLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authentication!"));

        Long driverId = null;
        if ("ROLE_DRIVER".equalsIgnoreCase(user.getRole())) {
            Driver driver = driverRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Driver profile not found for user ID: " + user.getId()));
            driverId = driver.getId();
        }

        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getName(), user.getId(), driverId);
    }
}
