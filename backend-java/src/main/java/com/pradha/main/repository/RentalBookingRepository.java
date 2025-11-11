package com.pradha.main.repository;

import com.pradha.main.entity.RentalBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalBookingRepository extends JpaRepository<RentalBooking, String> {
    
    List<RentalBooking> findByUserId(String userId);
    
    List<RentalBooking> findByStatus(RentalBooking.BookingStatus status);
    
    @Query("SELECT rb FROM RentalBooking rb WHERE rb.dress.id = :dressId AND rb.status = 'CONFIRMED' AND " +
           "((rb.startDate <= :endDate) AND (rb.endDate >= :startDate))")
    List<RentalBooking> findConflictingBookings(@Param("dressId") String dressId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}