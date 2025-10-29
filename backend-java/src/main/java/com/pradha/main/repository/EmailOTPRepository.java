package com.pradha.main.repository;

import com.pradha.main.entity.EmailOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailOTPRepository extends JpaRepository<EmailOTP, String> {
    Optional<EmailOTP> findByEmailAndOtpCodeAndVerifiedFalse(String email, String otpCode);
    void deleteByEmail(String email);
}