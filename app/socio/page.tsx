"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Aportacion, CuotaPrestamo, HistorialFinanciero, Prestamo } from "@/interfaces";
import { aportacionService } from "@/services/aportacion.service";
import { cuotaPrestamoService } from "@/services/cuotaPrestamo.service";
import { historialFinancieroService } from "@/services/historialFinanciero.service";
import { prestamoService } from "@/services/prestamo.service";
import { pagoCuotaService } from "@/services/pagoCuota.service";
import { socioService } from "@/services/socio.service";
import { isPositiveNumber } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400";

export default function SocioPage() {
  const router = useRouter();
  const { isAuthenticated, rol, user } = useAuth();
  const [socioId, setSocioId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<HistorialFinanciero | null>(null);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cuotas, setCuotas] = useState<CuotaPrestamo[]>([]);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAportacion, setSubmittingAportacion] = useState(false);
  const [submittingPrestamo, setSubmittingPrestamo] = useState(false);
  const [submittingPago, setSubmittingPago] = useState(false);
  const [error, setError] = useState("");
  const [monto, setMonto] = useState("");
  const [observacion, setObservacion] = useState("");
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [numeroCuotas, setNumeroCuotas] = useState("");
  const [motivo, setMotivo] = useState("");

  const resolveSocioId = async (): Promise<number> => {
    if (user?.idSocio) {
      return Number(user.idSocio);
    }

    if (user?.idUsuario) {
      try {
        const socio = await socioService.getByUsuario(Number(user.idUsuario));
        if (socio.idSocio) {
          return Number(socio.idSocio);
        }
      } catch {
        // TODO backend: crear GET /api/socios/me o GET /api/socios/usuario/{idUsuario}
      }
    }

    throw new Error("No se encontró un perfil de socio asociado al usuario autenticado");
  };

  const loadResumenData = async () => {
    setLoading(true);
    setError("");

    try {
      const resolvedSocioId = await resolveSocioId();
      setSocioId(resolvedSocioId);

      const [historialData, aportacionData, prestamoData] = await Promise.all([
        historialFinancieroService.getBySocioId(resolvedSocioId),
        aportacionService.getBySocioId(resolvedSocioId),
        prestamoService.getBySocioId(resolvedSocioId),
      ]);

      setHistorial(historialData);
      setAportaciones(aportacionData);
      setPrestamos(prestamoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la información del socio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (rol === "ADMINISTRADOR" || rol === "OPERADOR") {
      router.replace("/admin");
      return;
    }

    if (rol !== "SOCIO") {
      router.replace("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadResumenData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, rol, router]);

  const totalAportado = useMemo(() => {
    return (historial?.totalAportado ?? 0) || aportaciones.reduce((sum, item) => sum + Number(item.monto ?? 0), 0);
  }, [aportaciones, historial?.totalAportado]);

  const totalPrestado = useMemo(() => {
    return (historial?.totalPrestado ?? 0) || prestamos.reduce((sum, item) => sum + Number(item.monto ?? 0), 0);
  }, [prestamos, historial?.totalPrestado]);

  const saldoPendiente = useMemo(() => {
    return (historial?.saldoPendiente ?? 0) || Math.max(totalPrestado - totalAportado, 0);
  }, [historial?.saldoPendiente, totalAportado, totalPrestado]);

  const socioNombre = historial?.socio?.nombres && historial?.socio?.apellidos
    ? `${historial.socio.nombres} ${historial.socio.apellidos}`
    : user?.username || "Socio";

  const socioCodigo = historial?.socio?.codigoSocio || "-";

  const handleRegistrarAportacion = async (event: FormEvent) => {
    event.preventDefault();

    if (!socioId) {
      setError("No se pudo identificar al socio autenticado");
      return;
    }

    if (!isPositiveNumber(monto)) {
      setError("El monto de aportación debe ser mayor a 0");
      return;
    }

    setSubmittingAportacion(true);
    setError("");

    try {
      await aportacionService.create({
        monto: Number(monto),
        tipo: "ORDINARIA",
        periodo: new Date().toISOString().slice(0, 7),
        observacion,
        idSocio: socioId,
      });

      setMonto("");
      setObservacion("");
      await loadResumenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la aportación");
    } finally {
      setSubmittingAportacion(false);
    }
  };

  const handleSolicitarPrestamo = async (event: FormEvent) => {
    event.preventDefault();

    if (!socioId) {
      setError("No se pudo identificar al socio autenticado");
      return;
    }

    if (!isPositiveNumber(montoSolicitado)) {
      setError("El monto solicitado debe ser mayor a 0");
      return;
    }

    if (!isPositiveNumber(numeroCuotas)) {
      setError("El número de cuotas debe ser mayor a 0");
      return;
    }

    setSubmittingPrestamo(true);
    setError("");

    try {
      await prestamoService.solicitar({
        montoSolicitado: Number(montoSolicitado),
        numeroCuotas: Number(numeroCuotas),
        motivo,
        idSocio: socioId,
      });

      setMontoSolicitado("");
      setNumeroCuotas("");
      setMotivo("");
      await loadResumenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo solicitar el préstamo");
    } finally {
      setSubmittingPrestamo(false);
    }
  };

  const handleVerCuotas = async (prestamoId: number) => {
    setSelectedPrestamoId(prestamoId);
    try {
      const cuotasData = await cuotaPrestamoService.getByPrestamoId(prestamoId);
      setCuotas(cuotasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las cuotas");
    }
  };

  const handlePagarCuota = async (cuotaId?: number) => {
    if (!selectedPrestamoId || !cuotaId) {
      return;
    }

    setSubmittingPago(true);
    setError("");

    try {
      await pagoCuotaService.create({
        idCuota: cuotaId,
        capitalPagado: 0,
        interesPagado: 0,
        moraPagada: 0,
        metodoPago: "PLATAFORMA",
        observacion: "Pago realizado desde portal del socio",
      });

      const cuotasData = await cuotaPrestamoService.getByPrestamoId(selectedPrestamoId);
      setCuotas(cuotasData);
      await loadResumenData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el pago");
    } finally {
      setSubmittingPago(false);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando información del socio...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Portal del socio</h1>
          <p className="mt-2 text-sm text-slate-600">Resumen financiero, aportaciones, préstamos y pagos de cuotas.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">Socio: {socioNombre}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Código: {socioCodigo}</span>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total aportado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">S/ {totalAportado.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total prestado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">S/ {totalPrestado.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Saldo pendiente</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">S/ {saldoPendiente.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Registrar aportación</h2>
              <form onSubmit={handleRegistrarAportacion} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Monto</label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(event) => setMonto(event.target.value)}
                    className={inputClass}
                    placeholder="Ingrese el monto"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Observación</label>
                  <input
                    value={observacion}
                    onChange={(event) => setObservacion(event.target.value)}
                    className={inputClass}
                    placeholder="Detalle opcional"
                  />
                </div>
                <button type="submit" disabled={submittingAportacion} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
                  {submittingAportacion ? "Procesando..." : "Guardar aportación"}
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Solicitar préstamo</h2>
              <form onSubmit={handleSolicitarPrestamo} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Monto solicitado</label>
                  <input
                    type="number"
                    value={montoSolicitado}
                    onChange={(event) => setMontoSolicitado(event.target.value)}
                    className={inputClass}
                    placeholder="Ingrese el monto"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Número de cuotas</label>
                  <input
                    type="number"
                    value={numeroCuotas}
                    onChange={(event) => setNumeroCuotas(event.target.value)}
                    className={inputClass}
                    placeholder="Ingrese el número de cuotas"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Motivo</label>
                  <input
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                    className={inputClass}
                    placeholder="Ingrese el motivo"
                    required
                  />
                </div>
                <button type="submit" disabled={submittingPrestamo} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60">
                  {submittingPrestamo ? "Procesando..." : "Solicitar préstamo"}
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Aportaciones</h2>
              {aportaciones.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No hay aportaciones registradas.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {aportaciones.map((item) => (
                    <li key={item.idAportacion ?? item.periodo} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">S/ {Number(item.monto ?? 0).toFixed(2)}</span>
                        <span className="text-sm text-slate-500">{item.periodo ?? "Sin periodo"}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.observacion ?? "Sin observación"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Préstamos</h2>
              {prestamos.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No hay préstamos registrados.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {prestamos.map((prestamo) => (
                    <li key={prestamo.idPrestamo} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">Préstamo #{prestamo.idPrestamo}</span>
                        <span className="text-sm text-slate-500">{prestamo.estado ?? "ACTIVO"}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">Monto: S/ {Number(prestamo.monto ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-slate-700">Saldo pendiente: S/ {Number(prestamo.saldoPendiente ?? 0).toFixed(2)}</p>
                      {prestamo.motivo ? <p className="text-sm text-slate-700">Motivo: {prestamo.motivo}</p> : null}
                      <button onClick={() => handleVerCuotas(Number(prestamo.idPrestamo))} className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800">
                        Ver cuotas
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Cuotas del préstamo</h2>
              <p className="mt-2 text-sm text-slate-600">Seleccione un préstamo para consultar sus cuotas.</p>
              {cuotas.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Aún no hay cuotas cargadas.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {cuotas.map((cuota) => (
                    <li key={cuota.idCuota} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">Cuota #{cuota.numeroCuota ?? cuota.idCuota}</span>
                        <span className="text-sm text-slate-500">{cuota.estado ?? "PENDIENTE"}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">Capital programado: S/ {Number(cuota.capitalProgramado ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-slate-700">Interés programado: S/ {Number(cuota.interesProgramado ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-slate-700">Monto total: S/ {Number(cuota.montoCuota ?? 0).toFixed(2)}</p>
                      <p className="text-sm text-slate-700">Fecha de vencimiento: {cuota.fechaVencimiento ?? "Sin fecha"}</p>
                      <button
                        onClick={() => handlePagarCuota(cuota.idCuota)}
                        disabled={Boolean(submittingPago || (cuota.estado && cuota.estado !== "PENDIENTE"))}
                        className="mt-3 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                      >
                        {submittingPago ? "Procesando..." : "Pagar cuota"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
