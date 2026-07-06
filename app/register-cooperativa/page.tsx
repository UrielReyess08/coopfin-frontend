"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { onboardingService } from "@/services/onboarding.service";

const initialForm = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  email: "",
  logoUrl: "",
  colorPrincipal: "#0F1E3A",
  colorSecundario: "#1E3A8A",
  tasaInteresDefault: "",
  moneda: "PEN",
  montoMaximoPrestamo: "",
  numeroMaximoCuotas: "",
  diasGracia: "",
  montoMinimoAportacion: "",
  montoMaximoAportacion: "",
  diaPagoAportacion: "",
  username: "",
  password: "",
  adminEmail: "",
};

export default function RegisterCooperativaPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      // construir payload conforme al backend
      const payload = {
        cooperativa: {
          nombre: form.nombre,
          ruc: form.ruc,
          direccion: form.direccion,
          telefono: form.telefono,
          email: form.email,
          logoUrl: form.logoUrl,
          colorPrincipal: form.colorPrincipal,
          colorSecundario: form.colorSecundario,
        },
        configuracion: {
          tasaInteresDefault: form.tasaInteresDefault ? Number(form.tasaInteresDefault) : undefined,
          moneda: form.moneda,
          montoMaximoPrestamo: form.montoMaximoPrestamo ? Number(form.montoMaximoPrestamo) : undefined,
          numeroMaximoCuotas: form.numeroMaximoCuotas ? Number(form.numeroMaximoCuotas) : undefined,
          diasGracia: form.diasGracia ? Number(form.diasGracia) : undefined,
          montoMinimoAportacion: form.montoMinimoAportacion ? Number(form.montoMinimoAportacion) : undefined,
          montoMaximoAportacion: form.montoMaximoAportacion ? Number(form.montoMaximoAportacion) : undefined,
          diaPagoAportacion: form.diaPagoAportacion ? Number(form.diaPagoAportacion) : undefined,
        },
        admin: {
          username: form.username,
          password: form.password,
          email: form.adminEmail,
        },
      };

      await onboardingService.createCooperativa(payload);
      // No guardar la cooperativa en localStorage como activa — solo mostrar éxito
      setSubmitted(true);
    } catch (err) {
      // TODO: mostrar errores al usuario de forma más fina
      // Por ahora, loguear en consola y mostrar mensaje de fallo simple
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Error al crear la cooperativa. Revise la consola.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0F1E3A]">COOPFIN</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Registrar mi cooperativa</h1>
            <p className="mt-2 text-sm text-slate-600">Configura la identidad, la parametrización financiera y el usuario administrador inicial.</p>
          </div>
          <Link href="/login" className="text-sm font-medium text-[#0F1E3A] hover:underline">Volver al login</Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`rounded-full px-3 py-1 text-sm ${step === item ? "bg-[#0F1E3A] text-white" : "bg-slate-100 text-slate-600"}`}>
              Paso {item}
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
            <h2 className="text-xl font-semibold">Solicitud recibida</h2>
            <p className="mt-2 text-sm">
              La cooperativa quedó preparada en la interfaz para su personalización visual. Falta integrar el onboarding real con los endpoints del backend:
              POST /cooperativas, POST /configuraciones-cooperativa y POST /usuarios.
            </p>
            <p className="mt-3 text-sm font-medium">TODO: integrar onboarding real con servicios del backend.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {step === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nombre de la cooperativa</label>
                  <input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">RUC</label>
                  <input value={form.ruc} onChange={(event) => updateField("ruc", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                  <input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                  <input value={form.telefono} onChange={(event) => updateField("telefono", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Logo URL</label>
                  <input value={form.logoUrl} onChange={(event) => updateField("logoUrl", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Color principal</label>
                  <input type="color" value={form.colorPrincipal} onChange={(event) => updateField("colorPrincipal", event.target.value)} className="h-11 w-full rounded-2xl border border-slate-300" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Color secundario</label>
                  <input type="color" value={form.colorSecundario} onChange={(event) => updateField("colorSecundario", event.target.value)} className="h-11 w-full rounded-2xl border border-slate-300" />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tasa de interés default</label>
                  <input type="number" value={form.tasaInteresDefault} onChange={(event) => updateField("tasaInteresDefault", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Moneda</label>
                  <input value={form.moneda} onChange={(event) => updateField("moneda", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Monto máximo préstamo</label>
                  <input type="number" value={form.montoMaximoPrestamo} onChange={(event) => updateField("montoMaximoPrestamo", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Número máximo cuotas</label>
                  <input type="number" value={form.numeroMaximoCuotas} onChange={(event) => updateField("numeroMaximoCuotas", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Días de gracia</label>
                  <input type="number" value={form.diasGracia} onChange={(event) => updateField("diasGracia", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Monto mínimo aportación</label>
                  <input type="number" value={form.montoMinimoAportacion} onChange={(event) => updateField("montoMinimoAportacion", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Monto máximo aportación</label>
                  <input type="number" value={form.montoMaximoAportacion} onChange={(event) => updateField("montoMaximoAportacion", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Día de pago de aportación</label>
                  <input type="number" value={form.diaPagoAportacion} onChange={(event) => updateField("diaPagoAportacion", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Usuario administrador</label>
                  <input value={form.username} onChange={(event) => updateField("username", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
                  <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email del administrador</label>
                  <input type="email" value={form.adminEmail} onChange={(event) => updateField("adminEmail", event.target.value)} className="w-full rounded-2xl border border-slate-300 px-3 py-2.5" required />
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4">
              <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" disabled={step === 1}>
                Anterior
              </button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep((current) => Math.min(3, current + 1))} className="rounded-2xl bg-[#0F1E3A] px-4 py-2 text-sm font-medium text-white">
                  Siguiente
                </button>
              ) : (
                <button type="submit" className="rounded-2xl bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white">
                  Guardar registro
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
