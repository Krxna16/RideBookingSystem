package com.ridebooking.backend.services;

import com.ridebooking.backend.dto.RideRequest;
import com.ridebooking.backend.dto.RideResponse;
import com.ridebooking.backend.entities.Driver;
import com.ridebooking.backend.entities.Ride;
import com.ridebooking.backend.repositories.DriverRepository;
import com.ridebooking.backend.repositories.RideRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;

    public RideService(RideRepository rideRepository, DriverRepository driverRepository) {
        this.rideRepository = rideRepository;
        this.driverRepository = driverRepository;
    }

    // 1. User Ride Booking & Fare Calculation & Driver Allocation
    public RideResponse requestRide(RideRequest request) {
        // Fare Calculation Logic: Base fare of 50.0 + 15.0 per km/mile
        double fare = 50.0 + (request.getDistance() * 15.0);

        Ride ride = new Ride(
                request.getUserId(),
                null, // No driver initially
                request.getPickupLocation(),
                request.getDropLocation(),
                request.getDistance(),
                fare,
                "REQUESTED"
        );

        // Driver Allocation Logic: Find first active and available driver
        List<Driver> availableDrivers = driverRepository.findByAvailable(true);
        if (!availableDrivers.isEmpty()) {
            Driver driver = availableDrivers.get(0);
            ride.setDriverId(driver.getId());
            ride.setStatus("ACCEPTED");
            
            // Update driver availability to occupied
            driver.setAvailable(false);
            driverRepository.save(driver);
        }

        Ride savedRide = rideRepository.save(ride);
        return mapToResponse(savedRide);
    }

    // 2. Fetch ride by ID
    public RideResponse getRideById(Long id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + id));
        return mapToResponse(ride);
    }

    // 3. View user (passenger) ride history
    public List<RideResponse> getRideHistoryForUser(Long userId) {
        return rideRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 4. View assigned rides for a driver
    public List<RideResponse> getAssignedRidesForDriver(Long driverId) {
        return rideRepository.findByDriverId(driverId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 5. Get all pending "REQUESTED" rides that need a driver
    public List<RideResponse> getRequestedRides() {
        return rideRepository.findByStatus("REQUESTED").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 6. Ride Status Tracking API with detailed lifecycle state transitions
    public RideResponse updateRideStatus(Long rideId, String status, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with ID: " + rideId));

        String targetStatus = status.toUpperCase();

        switch (targetStatus) {
            case "ACCEPTED":
                if (driverId == null) {
                    throw new RuntimeException("Driver ID is required to accept a ride!");
                }
                Driver driver = driverRepository.findById(driverId)
                        .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + driverId));
                if (!driver.isAvailable()) {
                    throw new RuntimeException("Driver is not available to accept new rides!");
                }
                ride.setDriverId(driver.getId());
                ride.setStatus("ACCEPTED");
                
                // Set driver as occupied
                driver.setAvailable(false);
                driverRepository.save(driver);
                break;

            case "IN_PROGRESS":
                if (!"ACCEPTED".equalsIgnoreCase(ride.getStatus())) {
                    throw new RuntimeException("Ride must be accepted before starting the trip!");
                }
                ride.setStatus("IN_PROGRESS");
                break;

            case "COMPLETED":
                if (!"IN_PROGRESS".equalsIgnoreCase(ride.getStatus())) {
                    throw new RuntimeException("Ride must be in progress before completing the trip!");
                }
                ride.setStatus("COMPLETED");
                // Release driver
                if (ride.getDriverId() != null) {
                    Driver currentDriver = driverRepository.findById(ride.getDriverId())
                            .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + ride.getDriverId()));
                    currentDriver.setAvailable(true);
                    driverRepository.save(currentDriver);
                }
                break;

            case "CANCELLED":
                if ("COMPLETED".equalsIgnoreCase(ride.getStatus())) {
                    throw new RuntimeException("Cannot cancel a completed ride!");
                }
                ride.setStatus("CANCELLED");
                // Release driver if allocated
                if (ride.getDriverId() != null) {
                    Driver currentDriver = driverRepository.findById(ride.getDriverId())
                            .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + ride.getDriverId()));
                    currentDriver.setAvailable(true);
                    driverRepository.save(currentDriver);
                }
                break;

            default:
                throw new RuntimeException("Invalid status lifecycle transition: " + status);
        }

        Ride updatedRide = rideRepository.save(ride);
        return mapToResponse(updatedRide);
    }

    // 7. Toggle Driver Availability status manually
    public void toggleDriverAvailability(Long driverId, boolean available) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + driverId));
        driver.setAvailable(available);
        driverRepository.save(driver);
    }

    // Helper mapper method
    private RideResponse mapToResponse(Ride ride) {
        return new RideResponse(
                ride.getId(),
                ride.getUserId(),
                ride.getDriverId(),
                ride.getPickupLocation(),
                ride.getDropLocation(),
                ride.getDistance(),
                ride.getFare(),
                ride.getStatus(),
                ride.getRequestTime()
        );
    }
}
