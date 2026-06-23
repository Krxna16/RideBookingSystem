package com.ridebooking.backend.controllers;

import com.ridebooking.backend.dto.RideRequest;
import com.ridebooking.backend.dto.RideResponse;
import com.ridebooking.backend.services.RideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    // 1. Request/Book a ride
    @PostMapping("/book")
    public ResponseEntity<?> bookRide(@RequestBody RideRequest request) {
        try {
            RideResponse response = rideService.requestRide(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error booking ride: " + e.getMessage());
        }
    }

    // 2. Get ride by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getRideById(@PathVariable Long id) {
        try {
            RideResponse response = rideService.getRideById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. Get passenger ride history
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<RideResponse>> getHistoryForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(rideService.getRideHistoryForUser(userId));
    }

    // 4. Get driver assigned rides
    @GetMapping("/assigned/driver/{driverId}")
    public ResponseEntity<List<RideResponse>> getAssignedRidesForDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(rideService.getAssignedRidesForDriver(driverId));
    }

    // 5. Get all pending "REQUESTED" rides that need a driver
    @GetMapping("/requested")
    public ResponseEntity<List<RideResponse>> getRequestedRides() {
        return ResponseEntity.ok(rideService.getRequestedRides());
    }

    // 6. Update ride status (Accept, Start, Complete, Cancel)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRideStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Long driverId) {
        try {
            RideResponse response = rideService.updateRideStatus(id, status, driverId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating status: " + e.getMessage());
        }
    }

    // 7. Toggle driver availability manually
    @PutMapping("/driver/{driverId}/availability")
    public ResponseEntity<?> toggleDriverAvailability(
            @PathVariable Long driverId,
            @RequestParam boolean available) {
        try {
            rideService.toggleDriverAvailability(driverId, available);
            return ResponseEntity.ok("Driver availability updated successfully to " + available);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating availability: " + e.getMessage());
        }
    }

    // 8. Get driver availability status
    @GetMapping("/driver/{driverId}/availability")
    public ResponseEntity<?> getDriverAvailability(@PathVariable Long driverId) {
        try {
            boolean available = rideService.getDriverAvailability(driverId);
            return ResponseEntity.ok(available);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching availability: " + e.getMessage());
        }
    }

    // 9. Accept ride endpoint (with race-condition safety)
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRide(
            @PathVariable Long id,
            @RequestParam Long driverId) {
        try {
            RideResponse response = rideService.acceptRide(id, driverId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
