import type { HistorialFinanciero } from "@/interfaces";
import api from "@/lib/axios";

export const historialFinancieroService = {
  getBySocioId: async (idSocio: number): Promise<HistorialFinanciero> => {
    const { data } = await api.get<HistorialFinanciero>(`/historial-financiero/socio/${idSocio}`);
    return data;
  },
};
