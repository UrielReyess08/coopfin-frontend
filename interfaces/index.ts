export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  type?: string;
  username?: string;
  rol?: string;
  idCooperativa?: number;
  idSocio?: number;
  message?: string;
}

export interface Socio {
  idSocio?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  estado?: string;
  idCooperativa?: number;
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
}

export interface CuotaPrestamo {
  idCuota?: number;
  numeroCuota?: number;
  montoCuota?: number;
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
}
