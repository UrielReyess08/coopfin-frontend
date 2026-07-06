export interface CooperativaProfile {
  nombreCooperativa: string;
  logoUrl?: string;
  colorPrincipal: string;
  colorSecundario: string;
}

export const defaultCooperativaProfile: CooperativaProfile = {
  nombreCooperativa: "COOPFIN",
  colorPrincipal: "#0F1E3A",
  colorSecundario: "#1E3A8A",
};

export function getStoredCooperativaProfile(): CooperativaProfile {
  if (typeof window === "undefined") {
    return defaultCooperativaProfile;
  }

  const raw = window.localStorage.getItem("coopfin_cooperativa_profile");
  if (!raw) {
    return defaultCooperativaProfile;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CooperativaProfile>;
    return {
      ...defaultCooperativaProfile,
      ...parsed,
    };
  } catch {
    return defaultCooperativaProfile;
  }
}

export function saveCooperativaProfile(profile: Partial<CooperativaProfile>) {
  if (typeof window === "undefined") {
    return;
  }

  const nextProfile = {
    ...defaultCooperativaProfile,
    ...getStoredCooperativaProfile(),
    ...profile,
  };

  window.localStorage.setItem("coopfin_cooperativa_profile", JSON.stringify(nextProfile));
  window.dispatchEvent(new CustomEvent("coopfin-profile-updated", { detail: nextProfile }));
  return nextProfile;
}
