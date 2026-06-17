package com.ridebooking.backend.repositories;

import com.ridebooking.backend.entities.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByAvailable(boolean available);
    Optional<Driver> findByUserId(Long userId);
}
