"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Aportacion, CuotaPrestamo, HistorialFinanciero, Prestamo } from "@/interfaces";
import { aportacionService } from "@/services/aportacion.service";
import { cuotaPrestamoService } from "@/services/cuotaPrestamo.service";
import { historialFinancieroService } from "@/services/historialFinanciero.service";
import { prestamoService } from "@/services/prestamo.service";
import { pagoCuotaService } from "@/services/pagoCuota.service";

const idSocioTemporal = 1;

export default function SocioPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [historial, setHistorial] = useState<HistorialFinanciero | null>(null);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cuotas, setCuotas] = useState<CuotaPrestamo[]>([]);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAportacion, setSubmittingAportacion] = useState(false);
  const [submittingPago, setSubmittingPago] = useState(false);
  const [error, setError] = useState("");
  const [monto, setMonto] = useState("");
  const [observacion, setObservacion] = useState("");
  const [capitalPagado, setCapitalPagado] = useState("");
  const [interesPagado, setInteresPagado] = useState("");
  const [moraPagada, setMoraPagada] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [pagoObservacion, setPagoObservacion] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [historialData, aportacionData, prestamoData] = await Promise.all([
          historialFinancieroService.getBySocioId(idSocioTemporal),
          aportacionService.getBySocioId(idSocioTemporal),
          prestamoService.getBySocioId(idSocioTemporal),
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

    void loadData();
  }, [isAuthenticated, router]);

  const totalAportado = useMemo(() => {
    return (historial?.totalAportado ?? 0) || aportaciones.reduce((sum, item) => sum + Number(item.monto ?? 0), 0);
  }, [aportaciones, historial?.totalAportado]);

  const totalPrestado = useMemo(() => {
    return (historial?.totalPrestado ?? 0) || prestamos.reduce((sum, item) => sum + Number(item.monto ?? 0), 0);
  }, [prestamos, historial?.totalPrestado]);

  const saldoPendiente = useMemo(() => {
    return (historial?.saldoPendiente ?? 0) || Math.max(totalPrestado - totalAportado, 0);
  }, [historial?.saldoPendiente, totalAportado, totalPrestado]);

  const handleRegistrarAportacion = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittingAportacion(true);
    setError("");

    try {
      await aportacionService.create({
        monto: Number(monto),
        tipo: "ORDINARIA",
        periodo: "2026-06",
        observacion,
        idSocio: idSocioTemporal,
      });

      setMonto("");
      setObservacion("");
      const updatedAportaciones = await aportacionService.getBySocioId(idSocioTemporal);
      setAportaciones(updatedAportaciones);
      const historialData = await historialFinancieroService.getBySocioId(idSocioTemporal);
      setHistorial(historialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la aportación");
    } finally {
      setSubmittingAportacion(false);
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

  const handlePagarCuota = async (event: React.FormEvent, cuotaId?: number) => {
    event.preventDefault();
    if (!selectedPrestamoId || !cuotaId) {
      return;
    }

    setSubmittingPago(true);
    setError("");

    try {
      await pagoCuotaService.create({
        idCuota: cuotaId,
        capitalPagado: Number(capitalPagado),
        interesPagado: Number(interesPagado),
        moraPagada: Number(moraPagada),
        metodoPago,
        observacion: pagoObservacion,
      });

      setCapitalPagado("");
      setInteresPagado("");
      setMoraPagada("");
      setPagoObservacion("");
      const cuotasData = await cuotaPrestamoService.getByPrestamoId(selectedPrestamoId);
      setCuotas(cuotasData);
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
          <h1 className="text-2xl font-semibold text-slate-900">Resumen financiero del socio</h1>
          <p className="mt-2 text-sm text-slate-600">Consulta rápida del estado de aportaciones y préstamos.</p>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total aportado</p>
            <p className="mt-2 text-2xl font-semibold">S/ {totalAportado.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total prestado</p>
            <p className="mt-2 text-2xl font-semibold">S/ {totalPrestado.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Saldo pendiente</p>
            <p className="mt-2 text-2xl font-semibold">S/ {saldoPendiente.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Registrar aportación</h2>
              <form onSubmit={handleRegistrarAportacion} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Monto</label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(event) => setMonto(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Observación</label>
                  <input
                    value={observacion}
                    onChange={(event) => setObservacion(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingAportacion}
                  className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                >
                  {submittingAportacion ? "Procesando..." : "Guardar aportación"}
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Aportaciones</h2>
              <ul className="mt-4 space-y-2">
                {aportaciones.length === 0 ? (
                  <li className="text-sm text-slate-500">No hay aportaciones registradas.</li>
                ) : (
                  aportaciones.map((item) => (
                    <li key={item.idAportacion ?? item.periodo} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">S/ {Number(item.monto ?? 0).toFixed(2)}</span>
                        <span className="text-sm text-slate-500">{item.periodo ?? "Sin periodo"}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.observacion ?? "Sin observación"}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Préstamos</h2>
              <ul className="mt-4 space-y-2">
                {prestamos.length === 0 ? (
                  <li className="text-sm text-slate-500">No hay préstamos registrados.</li>
                ) : (
                  prestamos.map((prestamo) => (
                    <li key={prestamo.idPrestamo} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Préstamo #{prestamo.idPrestamo}</span>
                        <span className="text-sm text-slate-500">{prestamo.estado ?? "ACTIVO"}</span>
                      </div>
                      <p className="mt-1 text-sm">Monto: S/ {Number(prestamo.monto ?? 0).toFixed(2)}</p>
                      <p className="text-sm">Saldo pendiente: S/ {Number(prestamo.saldoPendiente ?? 0).toFixed(2)}</p>
                      <button
                        onClick={() => handleVerCuotas(Number(prestamo.idPrestamo))}
                        className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        Ver cuotas
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Cuotas del préstamo</h2>
              <p className="mt-2 text-sm text-slate-600">Seleccione un préstamo para consultar sus cuotas.</p>
              <ul className="mt-4 space-y-2">
                {cuotas.length === 0 ? (
                  <li className="text-sm text-slate-500">Aún no hay cuotas cargadas.</li>
                ) : (
                  cuotas.map((cuota) => (
                    <li key={cuota.idCuota} className="rounded-md border border-slate-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Cuota #{cuota.numeroCuota ?? cuota.idCuota}</span>
                        <span className="text-sm text-slate-500">{cuota.estado ?? "PENDIENTE"}</span>
                      </div>
                      <p className="mt-1 text-sm">Monto: S/ {Number(cuota.montoCuota ?? 0).toFixed(2)}</p>
                      <form onSubmit={(event) => handlePagarCuota(event, cuota.idCuota)} className="mt-3 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <input
                            type="number"
                            value={capitalPagado}
                            onChange={(event) => setCapitalPagado(event.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Capital"
                            required
                          />
                          <input
                            type="number"
                            value={interesPagado}
                            onChange={(event) => setInteresPagado(event.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Interés"
                            required
                          />
                          <input
                            type="number"
                            value={moraPagada}
                            onChange={(event) => setMoraPagada(event.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Mora"
                            required
                          />
                          <input
                            value={metodoPago}
                            onChange={(event) => setMetodoPago(event.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Método de pago"
                          />
                        </div>
                        <input
                          value={pagoObservacion}
                          onChange={(event) => setPagoObservacion(event.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Observación"
                        />
                        <button
                          type="submit"
                          disabled={submittingPago}
                          className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                        >
                          {submittingPago ? "Procesando..." : "Pagar cuota"}
                        </button>
                      </form>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* TODO: mejorar el diseño visual según el prototipo de alta resolución. */}
      </div>
    </main>
  );
}
