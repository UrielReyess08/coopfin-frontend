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
  const { isAuthenticated, rol, logout, user, nombreCooperativa, idCooperativa } = useAuth();
  const [cooperativaProfile, setCooperativaProfile] = useState(getStoredCooperativaProfile());

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (rol && rol !== "ADMINISTRADOR" && rol !== "OPERADOR") {
      router.replace("/socio");
      return;
    }

    setCooperativaProfile(getStoredCooperativaProfile());
  }, [isAuthenticated, rol, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const brandName = useMemo(() => {
    // usar el nombre de cooperativa proveniente del contexto de autenticación si está disponible
    const storedName = nombreCooperativa || cooperativaProfile?.nombreCooperativa || user?.username || "COOPFIN";
    return storedName;
  }, [nombreCooperativa, cooperativaProfile?.nombreCooperativa, user?.username]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#f1f5f9_40%,_#e2e8f0)] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-start">
        <Sidebar
          brandName={brandName}
          logoUrl={cooperativaProfile.logoUrl}
          colorPrincipal={cooperativaProfile.colorPrincipal}
          colorSecundario={cooperativaProfile.colorSecundario}
          onLogout={handleLogout}
        />

        <section className="flex-1 min-w-0 space-y-4">
          <Header
            title={title}
            subtitle={subtitle}
            brandName={brandName}
            colorPrincipal={cooperativaProfile.colorPrincipal}
            colorSecundario={cooperativaProfile.colorSecundario}
          />
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
