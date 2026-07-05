import type { AuthRequest, AuthResponse } from "@/interfaces";
import api from "@/lib/axios";

export const authService = {
  login: async (payload: AuthRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
};
