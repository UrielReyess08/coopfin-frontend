package com.coopfin.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "configuraciones_cooperativa")
public class ConfiguracionCooperativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idConfiguracion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cooperativa", nullable = false, unique = true)
    private Cooperativa cooperativa;

    @Column(nullable = false)
    private BigDecimal tasaInteresDefault;

    @Column(nullable = false)
    private String moneda;

    @Column(nullable = false)
    private BigDecimal montoMaximoPrestamo;

    @Column(nullable = false)
    private Integer numeroMaximoCuotas;

    @Column(nullable = false)
    private Integer diasGracia;

    @Column(nullable = false)
    private BigDecimal montoMinimoAportacion;

    @Column(nullable = false)
    private BigDecimal montoMaximoAportacion;

    @Column(nullable = false)
    private Integer diaPagoAportacion;

    public Long getIdConfiguracion() {
        return idConfiguracion;
    }

    public void setIdConfiguracion(Long idConfiguracion) {
        this.idConfiguracion = idConfiguracion;
    }

    public Cooperativa getCooperativa() {
        return cooperativa;
    }

    public void setCooperativa(Cooperativa cooperativa) {
        this.cooperativa = cooperativa;
    }

    public BigDecimal getTasaInteresDefault() {
        return tasaInteresDefault;
    }

    public void setTasaInteresDefault(BigDecimal tasaInteresDefault) {
        this.tasaInteresDefault = tasaInteresDefault;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public BigDecimal getMontoMaximoPrestamo() {
        return montoMaximoPrestamo;
    }

    public void setMontoMaximoPrestamo(BigDecimal montoMaximoPrestamo) {
        this.montoMaximoPrestamo = montoMaximoPrestamo;
    }

    public Integer getNumeroMaximoCuotas() {
        return numeroMaximoCuotas;
    }

    public void setNumeroMaximoCuotas(Integer numeroMaximoCuotas) {
        this.numeroMaximoCuotas = numeroMaximoCuotas;
    }

    public Integer getDiasGracia() {
        return diasGracia;
    }

    public void setDiasGracia(Integer diasGracia) {
        this.diasGracia = diasGracia;
    }

    public BigDecimal getMontoMinimoAportacion() {
        return montoMinimoAportacion;
    }

    public void setMontoMinimoAportacion(BigDecimal montoMinimoAportacion) {
        this.montoMinimoAportacion = montoMinimoAportacion;
    }

    public BigDecimal getMontoMaximoAportacion() {
        return montoMaximoAportacion;
    }

    public void setMontoMaximoAportacion(BigDecimal montoMaximoAportacion) {
        this.montoMaximoAportacion = montoMaximoAportacion;
    }

    public Integer getDiaPagoAportacion() {
        return diaPagoAportacion;
    }

    public void setDiaPagoAportacion(Integer diaPagoAportacion) {
        this.diaPagoAportacion = diaPagoAportacion;
    }
}
