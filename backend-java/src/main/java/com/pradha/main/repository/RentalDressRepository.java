package com.pradha.main.repository;

import com.pradha.main.entity.RentalDress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalDressRepository extends JpaRepository<RentalDress, String> {
    List<RentalDress> findByAvailableTrue();
    
    @Query("SELECT rd FROM RentalDress rd WHERE rd.available = true AND rd.id NOT IN " +
           "(SELECT rb.dress.id FROM RentalBooking rb WHERE " +
           "(rb.startDate <= :endDate AND rb.endDate >= :startDate) AND rb.status = 'CONFIRMED')")
    List<RentalDress> findAvailableDressesForDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}