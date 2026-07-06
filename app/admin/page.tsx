"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Aportacion, ConfiguracionCooperativa, HistorialFinanciero, Prestamo, Socio, Usuario } from "@/interfaces";
import { aportacionService } from "@/services/aportacion.service";
import { historialFinancieroService } from "@/services/historialFinanciero.service";
import { prestamoService } from "@/services/prestamo.service";
import { socioService } from "@/services/socio.service";
import { usuarioService } from "@/services/usuario.service";
import { configuracionCooperativaService } from "@/services/configuracionCooperativa.service";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";

type SectionKey = "socios" | "usuarios" | "prestamos" | "aportaciones" | "pagos" | "historial" | "configuracion";

const initialSocioForm = {
  codigoSocio: "",
  dni: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  direccion: "",
  idUsuario: "",
};

const initialUsuarioForm = {
  username: "",
  password: "",
  email: "",
  idRol: "4",
  // idCooperativa será tomado del contexto de autenticación
};

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SectionKey>("socios");
  const { idCooperativa, nombreCooperativa } = useAuth();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
  const [historial, setHistorial] = useState<HistorialFinanciero | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionCooperativa | null>(null);
  const [historialSocioId, setHistorialSocioId] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socioForm, setSocioForm] = useState(initialSocioForm);
  const [usuarioForm, setUsuarioForm] = useState(initialUsuarioForm);
  const [configForm, setConfigForm] = useState<ConfiguracionCooperativa>({});

  const fetchUsuarios = async () => {
    try {
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada para listar usuarios");
        return;
      }
      // Preferir endpoint filtrado por cooperativa
      const data = await usuarioService.getByCooperativa(Number(idCooperativa));
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
    }
  };

  const crearUsuario = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await usuarioService.create({
        username: usuarioForm.username,
        password: usuarioForm.password,
        email: usuarioForm.email,
        idRol: Number(usuarioForm.idRol),
        // idCooperativa se toma del contexto de autenticación
        idCooperativa: Number(idCooperativa ?? 0),
      });
      setUsuarioForm(initialUsuarioForm);
      await fetchUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };
                // idCooperativa: se asigna desde AuthContext; no editable
  const fetchSocios = async () => {
    try {
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada para listar socios");
        return;
      }
      const data = await socioService.getByCooperativa(Number(idCooperativa));
      setSocios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los socios");
    }
  };

  const crearSocio = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await socioService.create({
        codigoSocio: socioForm.codigoSocio,
        dni: socioForm.dni,
        nombres: socioForm.nombres,
        apellidos: socioForm.apellidos,
        telefono: socioForm.telefono,
        direccion: socioForm.direccion,
        idUsuario: Number(socioForm.idUsuario),
        // idCooperativa se toma del contexto de autenticación
        idCooperativa: Number(idCooperativa ?? 0),
      });
      setSocioForm(initialSocioForm);
      await fetchSocios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el socio");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrestamos = async () => {
    try {
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada para listar préstamos");
        return;
      }
      // Preferir endpoint filtrado por cooperativa
      const data = await prestamoService.getByCooperativa(Number(idCooperativa));
      setPrestamos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los préstamos");
    }
  };

  const aprobarPrestamo = async (idPrestamo: number) => {
    setLoading(true);
    setError("");

    try {
      await prestamoService.aprobar(idPrestamo);
      await fetchPrestamos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar el préstamo");
    } finally {
      setLoading(false);
    }
  };

  const fetchAportaciones = async () => {
    try {
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada para listar aportaciones");
        return;
      }
      // Preferir endpoint filtrado por cooperativa
      const data = await aportacionService.getByCooperativa(Number(idCooperativa));
      setAportaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las aportaciones");
    }
  };

  const fetchHistorialFinanciero = async (idSocio: string) => {
    const numericId = Number(idSocio);
    if (!numericId) {
      setError("Ingrese un idSocio válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Validar que el socio pertenezca a la cooperativa autenticada
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada");
        return;
      }

      const socioPertenece = socios.some((s) => Number(s.idSocio) === numericId);
      if (!socioPertenece) {
        setError("El socio no pertenece a la cooperativa autenticada");
        return;
      }

      const data = await historialFinancieroService.getBySocioId(numericId);
      setHistorial(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial financiero");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfiguracion = async () => {
    try {
      if (!idCooperativa) {
        setError("No se encontró la cooperativa autenticada");
        return;
      }
      const data = await configuracionCooperativaService.getByCooperativa(Number(idCooperativa));
      setConfiguracion(data);
      setConfigForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la configuración");
    }
  };

  const actualizarConfiguracion = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await configuracionCooperativaService.update(Number(configuracion?.idConfiguracion ?? 1), configForm);
      await fetchConfiguracion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sectionParam = searchParams.get("view");
    const validSections: SectionKey[] = ["socios", "usuarios", "prestamos", "aportaciones", "pagos", "historial", "configuracion"];

    if (sectionParam && validSections.includes(sectionParam as SectionKey)) {
      setActiveSection(sectionParam as SectionKey);
    } else {
      setActiveSection("socios");
      router.replace("/admin?view=socios");
    }
  }, [router, searchParams]);

  useEffect(() => {
    // Cargar datos cuando esté disponible el idCooperativa autenticado
    if (!idCooperativa) {
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([
          fetchSocios(),
          fetchUsuarios(),
          fetchPrestamos(),
          fetchAportaciones(),
          fetchConfiguracion(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, [idCooperativa]);

  return (
    <AdminLayout
      title="Panel administrativo"
      subtitle="Gestión funcional para socios, usuarios, préstamos, aportaciones, pagos y configuración de la cooperativa."
    >
      {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null
      }
      {loading ? <p className="mt-4 text-sm text-slate-500">Cargando datos...</p> : null}

      {activeSection === "socios" ? (
          <section id="socios" className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold">Socios</h2>
              <table className="mt-4 min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Código</th>
                    <th className="px-2 py-2">Nombres</th>
                    <th className="px-2 py-2">Apellidos</th>
                    <th className="px-2 py-2">Teléfono</th>
                    <th className="px-2 py-2">Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {socios.map((socio) => (
                    <tr key={socio.idSocio ?? socio.codigoSocio} className="border-b">
                      <td className="px-2 py-2">{socio.idSocio ?? "-"}</td>
                      <td className="px-2 py-2">{socio.codigoSocio ?? "-"}</td>
                      <td className="px-2 py-2">{socio.nombres ?? "-"}</td>
                      <td className="px-2 py-2">{socio.apellidos ?? "-"}</td>
                      <td className="px-2 py-2">{socio.telefono ?? "-"}</td>
                      <td className="px-2 py-2">{socio.direccion ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={crearSocio} className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold">Registrar socio</h2>
              {[
                ["codigoSocio", "Código socio"],
                ["dni", "DNI"],
                ["nombres", "Nombres"],
                ["apellidos", "Apellidos"],
                ["telefono", "Teléfono"],
                ["direccion", "Dirección"],
                  ["idUsuario", "ID Usuario"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    value={socioForm[field as keyof typeof socioForm]}
                    onChange={(event) => setSocioForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    required={field !== "direccion"}
                  />
                </div>
              ))}
              <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                Crear socio
              </button>
            </form>
          </section>
        ) : null}

        {activeSection === "usuarios" ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-x-auto rounded-lg border border-slate-200 p-4">
              <h2 className="text-lg font-semibold">Usuarios</h2>
              <table className="mt-4 min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Usuario</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Rol</th>
                    <th className="px-2 py-2">Cooperativa</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.idUsuario} className="border-b">
                      <td className="px-2 py-2">{usuario.idUsuario ?? "-"}</td>
                      <td className="px-2 py-2">{usuario.username ?? "-"}</td>
                      <td className="px-2 py-2">{usuario.email ?? "-"}</td>
                      <td className="px-2 py-2">{usuario.idRol ?? "-"}</td>
                      <td className="px-2 py-2">{usuario.idCooperativa ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={crearUsuario} className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold">Crear usuario</h2>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input value={usuarioForm.username} onChange={(event) => setUsuarioForm((current) => ({ ...current, username: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" value={usuarioForm.password} onChange={(event) => setUsuarioForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={usuarioForm.email} onChange={(event) => setUsuarioForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
                <select value={usuarioForm.idRol} onChange={(event) => setUsuarioForm((current) => ({ ...current, idRol: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="4">ADMINISTRADOR</option>
                  <option value="5">SOCIO</option>
                  <option value="6">OPERADOR</option>
                </select>
              </div>
              {/* idCooperativa se asigna automáticamente desde AuthContext */}
              <button type="submit" className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                Crear usuario
              </button>
            </form>
          </section>
        ) : null}

        {activeSection === "prestamos" ? (
          <section className="mt-6 rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">Préstamos</h2>
            <table className="mt-4 min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Socio</th>
                  <th className="px-2 py-2">Monto</th>
                  <th className="px-2 py-2">Saldo</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((prestamo) => (
                  <tr key={prestamo.idPrestamo} className="border-b">
                    <td className="px-2 py-2">{prestamo.idPrestamo ?? "-"}</td>
                    <td className="px-2 py-2">{prestamo.idSocio ?? "-"}</td>
                    <td className="px-2 py-2">{prestamo.monto ?? "-"}</td>
                    <td className="px-2 py-2">{prestamo.saldoPendiente ?? "-"}</td>
                    <td className="px-2 py-2">{prestamo.estado ?? "-"}</td>
                    <td className="px-2 py-2">
                      {prestamo.estado === "PENDIENTE" ? (
                        <button onClick={() => aprobarPrestamo(Number(prestamo.idPrestamo))} className="rounded-full border border-emerald-600 px-3 py-1 text-sm text-emerald-700">
                          Aprobar
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeSection === "aportaciones" ? (
          <section className="mt-6 rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">Aportaciones</h2>
            <table className="mt-4 min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Socio</th>
                  <th className="px-2 py-2">Monto</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Periodo</th>
                  <th className="px-2 py-2">Observación</th>
                </tr>
              </thead>
              <tbody>
                {aportaciones.map((aportacion) => (
                  <tr key={aportacion.idAportacion} className="border-b">
                    <td className="px-2 py-2">{aportacion.idAportacion ?? "-"}</td>
                    <td className="px-2 py-2">{aportacion.idSocio ?? "-"}</td>
                    <td className="px-2 py-2">{aportacion.monto ?? "-"}</td>
                    <td className="px-2 py-2">{aportacion.tipo ?? "-"}</td>
                    <td className="px-2 py-2">{aportacion.periodo ?? "-"}</td>
                    <td className="px-2 py-2">{aportacion.observacion ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeSection === "pagos" ? (
          <section id="pagos" className="mt-6 rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">Pagos de cuotas</h2>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              TODO: integrar con el endpoint de pagos cuando esté disponible en el backend.
            </div>
          </section>
        ) : null}

        {activeSection === "historial" ? (
          <section id="historial" className="mt-6 rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">Historial financiero</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">ID socio</label>
                <input value={historialSocioId} onChange={(event) => setHistorialSocioId(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <button onClick={() => fetchHistorialFinanciero(historialSocioId)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">
                Consultar historial
              </button>
            </div>

            {historial ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Total aportado</p>
                  <p className="mt-1 text-xl font-semibold">{historial.totalAportado ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Total prestado</p>
                  <p className="mt-1 text-xl font-semibold">{historial.totalPrestado ?? "-"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-500">Saldo pendiente</p>
                  <p className="mt-1 text-xl font-semibold">{historial.saldoPendiente ?? "-"}</p>
                </div>
              </div>
            ) : null}

            {historial?.aportaciones?.length ? (
              <div className="mt-6">
                <h3 className="font-semibold">Aportaciones</h3>
                <ul className="mt-3 space-y-2">
                  {historial.aportaciones.map((item) => (
                    <li key={item.idAportacion} className="rounded-md border border-slate-200 p-3 text-sm">
                      {item.periodo ?? "-"} - S/ {item.monto ?? 0} - {item.observacion ?? "Sin observación"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {historial?.prestamos?.length ? (
              <div className="mt-6">
                <h3 className="font-semibold">Préstamos</h3>
                <ul className="mt-3 space-y-2">
                  {historial.prestamos.map((item) => (
                    <li key={item.idPrestamo} className="rounded-md border border-slate-200 p-3 text-sm">
                      Préstamo #{item.idPrestamo} - Estado: {item.estado ?? "-"} - Saldo: {item.saldoPendiente ?? 0}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeSection === "configuracion" ? (
          <section className="mt-6 rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-semibold">Configuración cooperativa</h2>
            <form onSubmit={actualizarConfiguracion} className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["tasaInteresDefault", "Tasa interés default"],
                ["moneda", "Moneda"],
                ["montoMaximoPrestamo", "Monto máximo préstamo"],
                ["numeroMaximoCuotas", "Número máximo cuotas"],
                ["diasGracia", "Días gracia"],
                ["montoMinimoAportacion", "Monto mínimo aportación"],
                ["montoMaximoAportacion", "Monto máximo aportación"],
                ["diaPagoAportacion", "Día de pago aportación"],
                ["idCooperativa", "ID Cooperativa"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                  <input
                    value={configForm[field as keyof ConfiguracionCooperativa] ?? ""}
                    onChange={(event) => setConfigForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">
                  Actualizar configuración
                </button>
              </div>
            </form>
          </section>
        ) : null}

      </AdminLayout>
    );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#f1f5f9_40%,_#e2e8f0)] p-6">
          <div className="mx-auto flex max-w-7xl items-center justify-center rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Cargando panel administrativo...
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
