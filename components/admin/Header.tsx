"use client";

interface HeaderProps {
  title: string;
  subtitle: string;
  brandName: string;
  colorPrincipal: string;
}

export function Header({ title, subtitle, brandName, colorPrincipal }: HeaderProps) {
  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <div>
          <p className="text-sm font-semibold" style={{ color: colorPrincipal }}>
            {brandName}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
