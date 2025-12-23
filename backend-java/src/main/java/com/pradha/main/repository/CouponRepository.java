package com.pradha.main.repository;

import com.pradha.main.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCodeAndIsActiveTrue(String code);
    
    @Query("SELECT c FROM Coupon c WHERE c.code = :code AND c.isActive = true " +
           "AND (c.validFrom IS NULL OR c.validFrom <= :now) " +
           "AND (c.validUntil IS NULL OR c.validUntil >= :now)")
    Optional<Coupon> findValidCouponByCode(@Param("code") String code, @Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND (c.validFrom IS NULL OR c.validFrom <= :now) " +
           "AND (c.validUntil IS NULL OR c.validUntil >= :now) " +
           "AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    java.util.List<Coupon> findValidCouponsForOffers(@Param("now") LocalDateTime now);
    
    boolean existsByCode(String code);
}