import type { Aportacion } from "@/interfaces";
import api from "@/lib/axios";

export const aportacionService = {
  getAll: async (): Promise<Aportacion[]> => {
    const { data } = await api.get<Aportacion[]>("/aportaciones");
    return data;
  },
  getBySocioId: async (idSocio: number): Promise<Aportacion[]> => {
    const { data } = await api.get<Aportacion[]>(`/aportaciones/socio/${idSocio}`);
    return data;
  },
  create: async (payload: Partial<Aportacion>): Promise<Aportacion> => {
    const { data } = await api.post<Aportacion>("/aportaciones", payload);
    return data;
  },
};
