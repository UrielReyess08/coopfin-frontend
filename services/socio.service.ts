import type { Socio } from "@/interfaces";
import api from "@/lib/axios";

export const socioService = {
  getAll: async (): Promise<Socio[]> => {
    const { data } = await api.get<Socio[]>("/socios");
    return data;
  },
};
