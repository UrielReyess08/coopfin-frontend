import type { Usuario } from "@/interfaces";
import api from "@/lib/axios";

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>("/usuarios");
    return data;
  },
  getByCooperativa: async (idCooperativa: number): Promise<Usuario[]> => {
    const { data } = await api.get<Usuario[]>(`/usuarios/cooperativa/${idCooperativa}`);
    return data;
  },
  create: async (payload: Partial<Usuario>): Promise<Usuario> => {
    const { data } = await api.post<Usuario>("/usuarios", payload);
    return data;
  },
};
