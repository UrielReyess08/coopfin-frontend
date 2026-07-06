import Link from "next/link";

const benefits = [
  "Gestión de socios",
  "Gestión de aportaciones",
  "Gestión de préstamos",
  "Historial financiero",
  "Seguridad con roles",
  "Configuración por cooperativa",
];

const plans = [
  { name: "Inicio", description: "Para cooperativas que quieren operar con orden y trazabilidad desde el primer día." },
  { name: "Escala", description: "Para crecer con procesos finanzas, usuarios y configuración multi-cooperativa." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <p className="text-lg font-semibold text-slate-900">COOPFIN</p>
            <p className="text-sm text-slate-500">Plataforma SaaS para cooperativas de ahorro y crédito</p>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
              Iniciar sesión
            </Link>
            <Link href="/register-cooperativa" className="rounded-full bg-[#0F1E3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E3A8A]">
              Registrar mi cooperativa
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex rounded-full bg-[#0F1E3A]/10 px-3 py-1 text-sm font-medium text-[#0F1E3A]">Software financiero modular</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Una plataforma digital para administrar cada cooperativa con claridad y control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            COOPFIN convierte la gestión de socios, aportaciones, préstamos y configuración en un entorno moderno, seguro y preparado para crecer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-[#0F1E3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1E3A8A]">
              Iniciar sesión
            </Link>
            <Link href="/register-cooperativa" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
              Registrar mi cooperativa
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Vista de operación</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Socios activos</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">+1.200</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Préstamos en proceso</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">84</p>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">COOPFIN para cada cooperativa</p>
            <p className="mt-2 text-lg font-semibold">Marca propia, procesos unificados y control financiero centralizado.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">¿Qué es COOPFIN?</h2>
          <p className="mt-4 max-w-3xl text-slate-600">
            COOPFIN es una plataforma SaaS pensada para cooperativas de ahorro y crédito que necesitan administrar operaciones financieras con seguridad, organización y una identidad propia.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Para cooperativas de ahorro y crédito</h3>
            <p className="mt-4 text-slate-600">
              Cada cooperativa puede operar en su propio espacio, con reglas financieras configurables, usuarios con roles específicos y una identidad visual adaptada a su marca.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#0F1E3A] p-8 text-white shadow-sm">
            <h3 className="text-xl font-semibold">Modelo multi-cooperativa</h3>
            <p className="mt-4 text-slate-300">
              COOPFIN actúa como la capa de operación para múltiples cooperativas registradas, sin perder la personalización del entorno interno.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Beneficios clave</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Plan {plan.name}</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-4 text-slate-600">{plan.description}</p>
              <div className="mt-6">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">Visual • Próximamente</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
