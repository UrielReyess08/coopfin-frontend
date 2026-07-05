import type { Prestamo } from "@/interfaces";
import api from "@/lib/axios";

export const prestamoService = {
  getBySocioId: async (idSocio: number): Promise<Prestamo[]> => {
    const { data } = await api.get<Prestamo[]>(`/prestamos/socio/${idSocio}`);
    return data;
  },
};
