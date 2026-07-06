import api from "@/lib/axios";

export const onboardingService = {
  createCooperativa: async (payload: any) => {
    const { data } = await api.post("/onboarding/cooperativa", payload);
    return data;
  },
};

export default onboardingService;
