"use client";

interface HeaderProps {
  title: string;
  subtitle: string;
  brandName: string;
  colorPrincipal: string;
  colorSecundario: string;
}

export function Header({ title, subtitle, brandName, colorPrincipal, colorSecundario }: HeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: colorPrincipal }}>
            {brandName}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="h-10 w-10 rounded-full" style={{ background: `linear-gradient(135deg, ${colorPrincipal}, ${colorSecundario})` }} />
          <div>
            <p className="text-sm font-semibold text-slate-800">Espacio personalizable</p>
            <p className="text-xs text-slate-500">Identidad visual activa</p>
          </div>
        </div>
      </div>
    </header>
  );
}
