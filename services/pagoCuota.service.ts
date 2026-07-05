import type { PagoCuota } from "@/interfaces";
import api from "@/lib/axios";

export const pagoCuotaService = {
  create: async (payload: Partial<PagoCuota>): Promise<PagoCuota> => {
    const { data } = await api.post<PagoCuota>("/pagos-cuota", payload);
    return data;
  },
};

