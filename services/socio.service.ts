import type { Socio } from "@/interfaces";
import api from "@/lib/axios";

export const socioService = {
  getAll: async (): Promise<Socio[]> => {
    const { data } = await api.get<Socio[]>("/socios");
    return data;
  },
  // Preferir endpoints filtrados por cooperativa
  getByCooperativa: async (idCooperativa: number): Promise<Socio[]> => {
    // TODO: backend debe exponer GET /socios/cooperativa/{idCooperativa}
    const { data } = await api.get<Socio[]>(`/socios/cooperativa/${idCooperativa}`);
    return data;
  },
  create: async (payload: Partial<Socio>): Promise<Socio> => {
    const { data } = await api.post<Socio>("/socios", payload);
    return data;
  },
};
