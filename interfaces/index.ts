export interface Cooperativa {
  idCooperativa?: number;
  nombre?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logoUrl?: string;
  colorPrincipal?: string;
  colorSecundario?: string;
  estado?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  type?: string;
  idUsuario?: number;
  username?: string;
  rol?: string;
  idCooperativa?: number;
  idSocio?: number;
  nombreCooperativa?: string | null;
  message?: string;
}

export interface Socio {
  idSocio?: number;
  codigoSocio?: string;
  dni?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  idUsuario?: number;
  idCooperativa?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  estado?: string;
}

export interface Aportacion {
  idAportacion?: number;
  monto?: number;
  tipo?: string;
  periodo?: string;
  observacion?: string;
  fechaRegistro?: string;
  idSocio?: number;
}

export interface Prestamo {
  idPrestamo?: number;
  monto?: number;
  saldoPendiente?: number;
  estado?: string;
  fechaSolicitud?: string;
  idSocio?: number;
  motivo?: string;
  montoSolicitado?: number;
  numeroCuotas?: number;
}

export interface CuotaPrestamo {
  idCuota?: number;
  numeroCuota?: number;
  montoCuota?: number;
  capitalProgramado?: number;
  interesProgramado?: number;
  capitalPagado?: number;
  interesPagado?: number;
  moraPagada?: number;
  estado?: string;
  fechaVencimiento?: string;
  fechaPago?: string;
}

export interface PagoCuota {
  idPago?: number;
  idCuota?: number;
  capitalPagado?: number;
  interesPagado?: number;
  moraPagada?: number;
  metodoPago?: string;
  observacion?: string;
  fechaPago?: string;
}

export interface HistorialFinanciero {
  totalAportado?: number;
  totalPrestado?: number;
  saldoPendiente?: number;
  aportaciones?: Aportacion[];
  prestamos?: Prestamo[];
  socio?: {
    idSocio?: number;
    codigoSocio?: string;
    nombres?: string;
    apellidos?: string;
  };
}

export interface Usuario {
  idUsuario?: number;
  username?: string;
  password?: string;
  email?: string;
  idRol?: number;
  idCooperativa?: number;
  estado?: string;
}

export interface ConfiguracionCooperativa {
  idConfiguracion?: number;
  tasaInteresDefault?: number;
  moneda?: string;
  montoMaximoPrestamo?: number;
  numeroMaximoCuotas?: number;
  diasGracia?: number;
  montoMinimoAportacion?: number;
  montoMaximoAportacion?: number;
  diaPagoAportacion?: number;
  idCooperativa?: number;
}
