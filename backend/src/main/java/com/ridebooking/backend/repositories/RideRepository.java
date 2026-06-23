package com.ridebooking.backend.repositories;

import com.ridebooking.backend.entities.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByUserId(Long userId);
    List<Ride> findByDriverId(Long driverId);
    List<Ride> findByStatus(String status);
    List<Ride> findByStatusAndDriverIdIsNull(String status);

    @Modifying
    @Transactional
    @Query("UPDATE Ride r SET r.driverId = :driverId, r.status = 'ACCEPTED' WHERE r.id = :rideId AND r.status = 'REQUESTED' AND r.driverId IS NULL")
    int acceptRide(@Param("rideId") Long rideId, @Param("driverId") Long driverId);
}
