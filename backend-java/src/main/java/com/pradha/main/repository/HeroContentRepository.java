package com.pradha.main.repository;

import com.pradha.main.entity.HeroContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HeroContentRepository extends JpaRepository<HeroContent, Long> {
    List<HeroContent> findByIsActiveTrueOrderByDisplayOrderAsc();
}