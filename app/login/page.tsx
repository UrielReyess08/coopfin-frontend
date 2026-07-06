"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(username, password);

      if (response.rol === "ADMINISTRADOR" || response.rol === "OPERADOR") {
        router.replace("/admin");
      } else {
        router.replace("/socio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[#0F1E3A] p-8 text-white lg:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-300">COOPFIN</p>
            <h1 className="mt-4 text-3xl font-semibold">Accede al espacio de tu cooperativa</h1>
            <p className="mt-4 text-sm text-slate-300">
              Ingresa con tus credenciales para gestionar socios, aportaciones, préstamos y configuraciones desde una experiencia unificada.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
              <p className="font-medium">¿Tu cooperativa aún no está registrada?</p>
              <Link href="/register-cooperativa" className="mt-2 inline-flex text-sm font-semibold text-white underline decoration-white/40 underline-offset-4">
                Registrar cooperativa
              </Link>
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-600">Ingresa tu usuario y contraseña para continuar.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-[#0F1E3A]"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-[#0F1E3A]"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#0F1E3A] px-4 py-2.5 text-white transition hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-500">
              <Link href="/" className="font-medium text-[#0F1E3A] hover:underline">
                Volver a COOPFIN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
