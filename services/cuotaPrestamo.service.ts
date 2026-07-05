import type { CuotaPrestamo } from "@/interfaces";
import api from "@/lib/axios";

export const cuotaPrestamoService = {
  getByPrestamoId: async (idPrestamo: number): Promise<CuotaPrestamo[]> => {
    const { data } = await api.get<CuotaPrestamo[]>(`/cuotas-prestamo/prestamo/${idPrestamo}`);
    return data;
  },
};
