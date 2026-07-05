"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Panel administrativo</h1>
        <p className="mt-2 text-sm text-slate-600">Aquí se integrarán las vistas de administración del backend.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/socio" className="rounded-md bg-slate-900 px-4 py-2 text-white">
            Ir al panel del socio
          </Link>
        </div>
      </div>
    </main>
  );
}
