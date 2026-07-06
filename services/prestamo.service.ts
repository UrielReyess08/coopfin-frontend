import type { Prestamo } from "@/interfaces";
import api from "@/lib/axios";

export const prestamoService = {
  getAll: async (): Promise<Prestamo[]> => {
    const { data } = await api.get<Prestamo[]>("/prestamos");
    return data;
  },
  getByEstado: async (estado: string): Promise<Prestamo[]> => {
    const { data } = await api.get<Prestamo[]>(`/prestamos/estado/${estado}`);
    return data;
  },
  // Preferir endpoint por cooperativa
  getByCooperativa: async (idCooperativa: number): Promise<Prestamo[]> => {
    // TODO: backend debe exponer GET /prestamos/cooperativa/{idCooperativa}
    const { data } = await api.get<Prestamo[]>(`/prestamos/cooperativa/${idCooperativa}`);
    return data;
  },
  getBySocioId: async (idSocio: number): Promise<Prestamo[]> => {
    const { data } = await api.get<Prestamo[]>(`/prestamos/socio/${idSocio}`);
    return data;
  },
  solicitar: async (payload: Partial<Prestamo> & { idSocio: number }): Promise<Prestamo> => {
    const { data } = await api.post<Prestamo>("/prestamos/solicitar", payload);
    return data;
  },
  aprobar: async (idPrestamo: number): Promise<Prestamo> => {
    const { data } = await api.put<Prestamo>(`/prestamos/${idPrestamo}/aprobar`);
    return data;
  },
};
