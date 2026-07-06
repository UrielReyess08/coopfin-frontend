import type { Socio } from "@/interfaces";
import api from "@/lib/axios";

export const socioService = {
  getAll: async (): Promise<Socio[]> => {
    const { data } = await api.get<Socio[]>("/socios");
    return data;
  },
  getByCooperativa: async (idCooperativa: number): Promise<Socio[]> => {
    const { data } = await api.get<Socio[]>(`/socios/cooperativa/${idCooperativa}`);
    return data;
  },
  getMe: async (): Promise<Socio> => {
    const { data } = await api.get<Socio>("/socios/me");
    return data;
  },
  getByUsuario: async (idUsuario: number): Promise<Socio> => {
    const { data } = await api.get<Socio>(`/socios/usuario/${idUsuario}`);
    return data;
  },
  create: async (payload: Partial<Socio>): Promise<Socio> => {
    const { data } = await api.post<Socio>("/socios", payload);
    return data;
  },
};
