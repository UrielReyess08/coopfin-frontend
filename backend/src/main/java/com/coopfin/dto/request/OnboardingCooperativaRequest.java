package com.coopfin.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OnboardingCooperativaRequest {

    @Valid
    @NotNull(message = "El bloque cooperativa es obligatorio")
    private CooperativaRequest cooperativa;

    @Valid
    @NotNull(message = "El bloque configuracion es obligatorio")
    private ConfiguracionRequest configuracion;

    @Valid
    @NotNull(message = "El bloque admin es obligatorio")
    private AdminRequest admin;

    public CooperativaRequest getCooperativa() {
        return cooperativa;
    }

    public void setCooperativa(CooperativaRequest cooperativa) {
        this.cooperativa = cooperativa;
    }

    public ConfiguracionRequest getConfiguracion() {
        return configuracion;
    }

    public void setConfiguracion(ConfiguracionRequest configuracion) {
        this.configuracion = configuracion;
    }

    public AdminRequest getAdmin() {
        return admin;
    }

    public void setAdmin(AdminRequest admin) {
        this.admin = admin;
    }

    public static class CooperativaRequest {
        @NotBlank(message = "El nombre es obligatorio")
        private String nombre;

        @NotBlank(message = "El RUC es obligatorio")
        private String ruc;

        private String direccion;
        private String telefono;

        @Email(message = "El email debe ser válido")
        private String email;

        private String logoUrl;
        private String colorPrincipal;
        private String colorSecundario;

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getRuc() {
            return ruc;
        }

        public void setRuc(String ruc) {
            this.ruc = ruc;
        }

        public String getDireccion() {
            return direccion;
        }

        public void setDireccion(String direccion) {
            this.direccion = direccion;
        }

        public String getTelefono() {
            return telefono;
        }

        public void setTelefono(String telefono) {
            this.telefono = telefono;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getLogoUrl() {
            return logoUrl;
        }

        public void setLogoUrl(String logoUrl) {
            this.logoUrl = logoUrl;
        }

        public String getColorPrincipal() {
            return colorPrincipal;
        }

        public void setColorPrincipal(String colorPrincipal) {
            this.colorPrincipal = colorPrincipal;
        }

        public String getColorSecundario() {
            return colorSecundario;
        }

        public void setColorSecundario(String colorSecundario) {
            this.colorSecundario = colorSecundario;
        }
    }

    public static class ConfiguracionRequest {
        @NotNull(message = "La tasa de interés es obligatoria")
        private java.math.BigDecimal tasaInteresDefault;

        @NotBlank(message = "La moneda es obligatoria")
        private String moneda;

        @NotNull(message = "El monto máximo de préstamo es obligatorio")
        private java.math.BigDecimal montoMaximoPrestamo;

        @NotNull(message = "El número máximo de cuotas es obligatorio")
        private Integer numeroMaximoCuotas;

        @NotNull(message = "Los días de gracia son obligatorios")
        private Integer diasGracia;

        @NotNull(message = "El monto mínimo de aportación es obligatorio")
        private java.math.BigDecimal montoMinimoAportacion;

        @NotNull(message = "El monto máximo de aportación es obligatorio")
        private java.math.BigDecimal montoMaximoAportacion;

        @NotNull(message = "El día de pago es obligatorio")
        private Integer diaPagoAportacion;

        public java.math.BigDecimal getTasaInteresDefault() {
            return tasaInteresDefault;
        }

        public void setTasaInteresDefault(java.math.BigDecimal tasaInteresDefault) {
            this.tasaInteresDefault = tasaInteresDefault;
        }

        public String getMoneda() {
            return moneda;
        }

        public void setMoneda(String moneda) {
            this.moneda = moneda;
        }

        public java.math.BigDecimal getMontoMaximoPrestamo() {
            return montoMaximoPrestamo;
        }

        public void setMontoMaximoPrestamo(java.math.BigDecimal montoMaximoPrestamo) {
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

        public java.math.BigDecimal getMontoMinimoAportacion() {
            return montoMinimoAportacion;
        }

        public void setMontoMinimoAportacion(java.math.BigDecimal montoMinimoAportacion) {
            this.montoMinimoAportacion = montoMinimoAportacion;
        }

        public java.math.BigDecimal getMontoMaximoAportacion() {
            return montoMaximoAportacion;
        }

        public void setMontoMaximoAportacion(java.math.BigDecimal montoMaximoAportacion) {
            this.montoMaximoAportacion = montoMaximoAportacion;
        }

        public Integer getDiaPagoAportacion() {
            return diaPagoAportacion;
        }

        public void setDiaPagoAportacion(Integer diaPagoAportacion) {
            this.diaPagoAportacion = diaPagoAportacion;
        }
    }

    public static class AdminRequest {
        @NotBlank(message = "El username es obligatorio")
        private String username;

        @NotBlank(message = "La contraseña es obligatoria")
        private String password;

        @Email(message = "El email debe ser válido")
        @NotBlank(message = "El email es obligatorio")
        private String email;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
