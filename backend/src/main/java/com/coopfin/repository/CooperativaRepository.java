package com.coopfin.repository;

import com.coopfin.model.Cooperativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CooperativaRepository extends JpaRepository<Cooperativa, Long> {
    Optional<Cooperativa> findByRuc(String ruc);
}
