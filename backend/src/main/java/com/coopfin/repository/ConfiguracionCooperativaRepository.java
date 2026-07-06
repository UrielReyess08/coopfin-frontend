package com.coopfin.repository;

import com.coopfin.model.ConfiguracionCooperativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionCooperativaRepository extends JpaRepository<ConfiguracionCooperativa, Long> {
}
