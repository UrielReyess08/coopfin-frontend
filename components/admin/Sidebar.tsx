"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Banknote,
  Bell,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Settings,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href?: string;
  section?: string;
  disabled?: boolean;
  icon: LucideIcon;
};

interface SidebarProps {
  brandName: string;
  logoUrl?: string;
  colorPrincipal: string;
  colorSecundario: string;
  onLogout: () => void;
}

const items: SidebarItem[] = [
  { label: "Inicio", href: "/admin?view=socios", section: "socios", icon: Home },
  { label: "Socios", href: "/admin?view=socios", section: "socios", icon: Users },
  { label: "Usuarios", href: "/admin?view=usuarios", section: "usuarios", icon: UserPlus },
  { label: "Préstamos", href: "/admin?view=prestamos", section: "prestamos", icon: Banknote },
  { label: "Aportaciones", href: "/admin?view=aportaciones", section: "aportaciones", icon: Wallet },
  { label: "Pagos de cuotas", href: "/admin?view=pagos", section: "pagos", icon: CreditCard },
  { label: "Historial financiero", href: "/admin?view=historial", section: "historial", icon: FileText },
  { label: "Configuración", href: "/admin?view=configuracion", section: "configuracion", icon: Settings },
  { label: "Reportes", disabled: true, icon: FileText },
  { label: "Notificaciones", disabled: true, icon: Bell },
];

function getInitials(name: string) {
  const compact = name.trim();
  if (!compact) {
    return "CF";
  }

  const parts = compact.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function Sidebar({ brandName, logoUrl, colorPrincipal, colorSecundario, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("view") ?? "socios";
  const { nombreCooperativa } = useAuth();
  const brandLabel = nombreCooperativa || brandName;
  const initials = getInitials(brandLabel);

  return (
    <aside
      className="mb-4 flex w-full flex-col justify-between rounded-3xl border border-slate-900/10 p-5 text-slate-100 shadow-xl lg:fixed lg:bottom-6 lg:left-6 lg:top-6 lg:mb-0 lg:w-80"
      style={{ background: `linear-gradient(180deg, ${colorPrincipal}, ${colorSecundario})` }}
    >
      <div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/15">
            {logoUrl ? (
              <img src={logoUrl} alt={brandLabel} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold tracking-wide">{initials}</span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">COOPFIN</p>
            <h2 className="text-base font-semibold leading-tight">{brandLabel}</h2>
            <p className="mt-1 text-xs text-white/80">Cooperativa de Ahorro</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = !item.disabled && currentSection === item.section && pathname === "/admin";
            const buttonClass = `flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
              item.disabled
                ? "cursor-not-allowed text-white/50"
                : isActive
                  ? "bg-white/20 text-white"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
            }`;

            if (item.disabled) {
              return (
                <div key={item.label} className={buttonClass}>
                  <span className="flex items-center gap-2">
                    <Icon size={17} />
                    {item.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Próx</span>
                </div>
              );
            }

            return (
              <Link key={item.label} href={item.href ?? "/admin"} className={buttonClass}>
                <span className="flex items-center gap-2">
                  <Icon size={17} />
                  {item.label}
                </span>
                {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : <span className="h-2.5 w-2.5 rounded-full bg-white/20" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-white/20"
      >
        <LogOut size={17} />
        Cerrar sesión
      </button>
    </aside>
  );
}
