"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredCooperativaProfile } from "@/lib/cooperativa";
import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";

interface AdminLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, rol, logout, user, nombreCooperativa } = useAuth();
  const [cooperativaProfile, setCooperativaProfile] = useState(getStoredCooperativaProfile());

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (rol === "SOCIO") {
      router.replace("/socio");
      return;
    }

    if (rol !== "ADMINISTRADOR" && rol !== "OPERADOR") {
      router.replace("/login");
      return;
    }

    const handleProfileUpdated = () => {
      setCooperativaProfile(getStoredCooperativaProfile());
    };

    window.addEventListener("coopfin-profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("coopfin-profile-updated", handleProfileUpdated);
    };
  }, [isAuthenticated, rol, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const brandName = useMemo(() => {
    const storedName = cooperativaProfile?.nombreCooperativa || nombreCooperativa || user?.username || "COOPFIN";
    return storedName;
  }, [cooperativaProfile?.nombreCooperativa, nombreCooperativa, user?.username]);

  return (
    <main className="min-h-screen bg-[#F5F7FA] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        <Sidebar
          brandName={brandName}
          logoUrl={cooperativaProfile.logoUrl}
          colorPrincipal={cooperativaProfile.colorPrincipal}
          colorSecundario={cooperativaProfile.colorSecundario}
          onLogout={handleLogout}
        />

        <section className="min-w-0 space-y-4 lg:ml-[21rem]">
          <Header
            title={title}
            subtitle={subtitle}
            brandName={brandName}
            colorPrincipal={cooperativaProfile.colorPrincipal}
          />
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
