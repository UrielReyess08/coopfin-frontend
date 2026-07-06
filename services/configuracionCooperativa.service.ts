import type { ConfiguracionCooperativa } from "@/interfaces";
import api from "@/lib/axios";

export const configuracionCooperativaService = {
  getById: async (id: number): Promise<ConfiguracionCooperativa> => {
    const { data } = await api.get<ConfiguracionCooperativa>(`/configuraciones-cooperativa/${id}`);
    return data;
  },
  getByCooperativa: async (idCooperativa: number): Promise<ConfiguracionCooperativa> => {
    const { data } = await api.get<ConfiguracionCooperativa>(`/configuraciones-cooperativa/cooperativa/${idCooperativa}`);
    return data;
  },
  update: async (id: number, payload: Partial<ConfiguracionCooperativa>): Promise<ConfiguracionCooperativa> => {
    const { data } = await api.put<ConfiguracionCooperativa>(`/configuraciones-cooperativa/${id}`, payload);
    return data;
  },
};
