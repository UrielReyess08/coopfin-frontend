"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type SidebarItem = {
  label: string;
  href?: string;
  section?: string;
  disabled?: boolean;
};

interface SidebarProps {
  brandName: string;
  logoUrl?: string;
  colorPrincipal: string;
  colorSecundario: string;
  onLogout: () => void;
}

const items: SidebarItem[] = [
  { label: "Inicio", href: "/admin?view=socios", section: "socios" },
  { label: "Socios", href: "/admin?view=socios", section: "socios" },
  { label: "Usuarios", href: "/admin?view=usuarios", section: "usuarios" },
  { label: "Préstamos", href: "/admin?view=prestamos", section: "prestamos" },
  { label: "Aportaciones", href: "/admin?view=aportaciones", section: "aportaciones" },
  { label: "Pagos de cuotas", href: "/admin?view=pagos", section: "pagos" },
  { label: "Historial financiero", href: "/admin?view=historial", section: "historial" },
  { label: "Configuración", href: "/admin?view=configuracion", section: "configuracion" },
  { label: "Reportes", disabled: true },
  { label: "Notificaciones", disabled: true },
];

export function Sidebar({ brandName, logoUrl, colorPrincipal, colorSecundario, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("view") ?? "socios";
  const { nombreCooperativa } = useAuth();

  return (
    <aside className="flex w-full flex-col justify-between rounded-3xl border border-slate-200 bg-slate-950 p-5 text-slate-100 shadow-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72 lg:min-w-72 lg:self-start">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {logoUrl ? <img src={logoUrl} alt={brandName} className="h-full w-full object-cover" /> : <span className="text-lg font-semibold">C</span>}
          </div>
          <div>
            <p className="text-sm text-slate-400">COOPFIN</p>
            <h2 className="text-base font-semibold">{nombreCooperativa || brandName}</h2>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {items.map((item) => {
            const isActive = !item.disabled && currentSection === item.section && pathname === "/admin";
            const buttonClass = `flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
              item.disabled
                ? "cursor-not-allowed text-slate-500"
                : isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`;

            if (item.disabled) {
              return (
                <div key={item.label} className={buttonClass}>
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Próx</span>
                </div>
              );
            }

            return (
              <Link key={item.label} href={item.href ?? "/admin"} className={buttonClass}>
                <span>{item.label}</span>
                {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="mt-8 flex items-center justify-center rounded-2xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        style={{ backgroundColor: `${colorPrincipal}20`, color: "#f8fafc" }}
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
