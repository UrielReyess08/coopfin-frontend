import api from "@/lib/axios";

interface OnboardingPayload {
  cooperativa: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    logoUrl?: string;
    colorPrincipal: string;
    colorSecundario: string;
  };
  configuracion: {
    tasaInteresDefault?: number;
    moneda: string;
    montoMaximoPrestamo?: number;
    numeroMaximoCuotas?: number;
    diasGracia?: number;
    montoMinimoAportacion?: number;
    montoMaximoAportacion?: number;
    diaPagoAportacion?: number;
  };
  admin: {
    username: string;
    password: string;
    email: string;
  };
}

export const onboardingService = {
  createCooperativa: async (payload: OnboardingPayload) => {
    const { data } = await api.post("/onboarding/cooperativa", payload);
    return data;
  },
};

export default onboardingService;
