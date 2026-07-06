import type { Cooperativa } from "@/interfaces";
import api from "@/lib/axios";

export const cooperativaService = {
  create: async (payload: Partial<Cooperativa>): Promise<Cooperativa> => {
    const { data } = await api.post<Cooperativa>("/cooperativas", payload);
    return data;
  },
  getById: async (id: number): Promise<Cooperativa> => {
    const { data } = await api.get<Cooperativa>(`/cooperativas/${id}`);
    return data;
  },
  update: async (id: number, payload: Partial<Cooperativa>): Promise<Cooperativa> => {
    const { data } = await api.put<Cooperativa>(`/cooperativas/${id}`, payload);
    return data;
  },
};
