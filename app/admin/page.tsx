"use client";

import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Aportacion, ConfiguracionCooperativa, Cooperativa, HistorialFinanciero, Prestamo, Socio, Usuario } from "@/interfaces";
import { aportacionService } from "@/services/aportacion.service";
import { historialFinancieroService } from "@/services/historialFinanciero.service";
import { prestamoService } from "@/services/prestamo.service";
import { socioService } from "@/services/socio.service";
import { usuarioService } from "@/services/usuario.service";
import { configuracionCooperativaService } from "@/services/configuracionCooperativa.service";
import { cooperativaService } from "@/services/cooperativa.service";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { saveCooperativaProfile } from "@/lib/cooperativa";
import {
  isPositiveNumber,
  isValidDayOfMonth,
  isValidDni,
  isValidEmail,
  isValidHexColor,
  isValidPassword,
  isValidPhone,
  isValidRuc,
} from "@/lib/utils";

type SectionKey = "socios" | "usuarios" | "prestamos" | "aportaciones" | "pagos" | "historial" | "configuracion";
type RoleName = "OPERADOR" | "SOCIO" | "ADMINISTRADOR";

const VALID_SECTIONS: SectionKey[] = ["socios", "usuarios", "prestamos", "aportaciones", "pagos", "historial", "configuracion"];

const ROLE_ID_MAP: Record<RoleName, number> = {
  ADMINISTRADOR: 4,
  SOCIO: 5,
  OPERADOR: 6,
};

const ROLE_LABEL_BY_ID: Record<number, string> = {
  4: "ADMINISTRADOR",
  5: "SOCIO",
  6: "OPERADOR",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

const initialUsuarioForm = {
  username: "",
  password: "",
  email: "",
  rol: "OPERADOR" as RoleName,
};

const initialSocioForm = {
  username: "",
  password: "",
  email: "",
  rol: "SOCIO" as RoleName,
  dni: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  direccion: "",
};

const initialCooperativaForm = {
  nombre: "",
  ruc: "",
  direccion: "",
  telefono: "",
  email: "",
  logoUrl: "",
  colorPrincipal: "#0F1E3A",
  colorSecundario: "#1E3A8A",
};

const initialConfigForm = {
  tasaInteresDefault: "",
  moneda: "",
  montoMaximoPrestamo: "",
  numeroMaximoCuotas: "",
  diasGracia: "",
  montoMinimoAportacion: "",
  montoMaximoAportacion: "",
  diaPagoAportacion: "",
};

function toNumberOrUndefined(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function readErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isNotFoundMessage(message: string) {
  return /404|no encontrado|not found/i.test(message);
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { idCooperativa, nombreCooperativa } = useAuth();

  const currentSection = searchParams.get("view");
  const activeSection: SectionKey = currentSection && VALID_SECTIONS.includes(currentSection as SectionKey) ? (currentSection as SectionKey) : "socios";
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [isCreatingUsuario, setIsCreatingUsuario] = useState(false);
  const [isCreatingSocio, setIsCreatingSocio] = useState(false);
  const [isApprovingPrestamo, setIsApprovingPrestamo] = useState(false);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [isSavingFinancial, setIsSavingFinancial] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
  const [historial, setHistorial] = useState<HistorialFinanciero | null>(null);
  const [selectedSocioId, setSelectedSocioId] = useState("");

  const [cooperativaForm, setCooperativaForm] = useState(initialCooperativaForm);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFileName, setLogoFileName] = useState("");

  const [configuracion, setConfiguracion] = useState<ConfiguracionCooperativa | null>(null);
  const [configForm, setConfigForm] = useState(initialConfigForm);

  const [usuarioForm, setUsuarioForm] = useState(initialUsuarioForm);
  const [socioForm, setSocioForm] = useState(initialSocioForm);

  const roleOptions = useMemo<RoleName[]>(() => {
    return ["OPERADOR", "ADMINISTRADOR"];
  }, []);

  const sectionSubtitle = useMemo(() => {
    if (activeSection === "socios") {
      return "Registra socios con creación de usuario SOCIO en dos pasos automáticos.";
    }
    if (activeSection === "usuarios") {
      return "Gestiona usuarios internos de la cooperativa autenticada.";
    }
    if (activeSection === "prestamos") {
      return "Revisa préstamos de la cooperativa y aprueba los pendientes.";
    }
    if (activeSection === "aportaciones") {
      return "Visualiza aportaciones registradas para la cooperativa actual.";
    }
    if (activeSection === "pagos") {
      return "Próximamente.";
    }
    if (activeSection === "historial") {
      return "Consulta historial financiero por socio de la cooperativa.";
    }
    return "Personaliza la identidad visual de tu cooperativa.";
  }, [activeSection]);

  const requireCooperativaId = () => {
    if (!idCooperativa) {
      setError("No se encontró la cooperativa autenticada. Vuelve a iniciar sesión.");
      return null;
    }
    return Number(idCooperativa);
  };

  const persistCooperativaBranding = (source: Partial<Cooperativa>) => {
    saveCooperativaProfile({
      nombreCooperativa: source.nombre || nombreCooperativa || "COOPFIN",
      logoUrl: source.logoUrl,
      colorPrincipal: source.colorPrincipal || "#0F1E3A",
      colorSecundario: source.colorSecundario || "#1E3A8A",
    });
  };

  const fetchUsuarios = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    const data = await usuarioService.getByCooperativa(coopId);
    setUsuarios(data);
  };

  const fetchSocios = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    const data = await socioService.getByCooperativa(coopId);
    setSocios(data);
  };

  const fetchPrestamos = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    const data = await prestamoService.getByCooperativa(coopId);
    setPrestamos(data);
  };

  const fetchAportaciones = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    const data = await aportacionService.getByCooperativa(coopId);
    setAportaciones(data);
  };

  const fetchCooperativa = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    const data = await cooperativaService.getById(coopId);
    setCooperativaForm({
      nombre: data.nombre || "",
      ruc: data.ruc || "",
      direccion: data.direccion || "",
      telefono: data.telefono || "",
      email: data.email || "",
      logoUrl: data.logoUrl || "",
      colorPrincipal: data.colorPrincipal || "#0F1E3A",
      colorSecundario: data.colorSecundario || "#1E3A8A",
    });

    setLogoPreview(data.logoUrl || "");
    setLogoFileName("");
    persistCooperativaBranding(data);
  };

  const fetchConfiguracion = async () => {
    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    try {
      const data = await configuracionCooperativaService.getByCooperativa(coopId);
      setConfiguracion(data);
      setConfigForm({
        tasaInteresDefault: data.tasaInteresDefault?.toString() || "",
        moneda: data.moneda || "",
        montoMaximoPrestamo: data.montoMaximoPrestamo?.toString() || "",
        numeroMaximoCuotas: data.numeroMaximoCuotas?.toString() || "",
        diasGracia: data.diasGracia?.toString() || "",
        montoMinimoAportacion: data.montoMinimoAportacion?.toString() || "",
        montoMaximoAportacion: data.montoMaximoAportacion?.toString() || "",
        diaPagoAportacion: data.diaPagoAportacion?.toString() || "",
      });
    } catch (fetchError) {
      const message = readErrorMessage(fetchError, "No se pudo cargar la configuración financiera");
      if (isNotFoundMessage(message)) {
        setConfiguracion(null);
        setConfigForm(initialConfigForm);
        return;
      }
      throw fetchError;
    }
  };

  const loadInitialData = async () => {
    setIsLoadingInitialData(true);
    setError("");

    try {
      await Promise.all([
        fetchSocios(),
        fetchUsuarios(),
        fetchPrestamos(),
        fetchAportaciones(),
        fetchCooperativa(),
        fetchConfiguracion(),
      ]);
    } catch (loadError) {
      setError(readErrorMessage(loadError, "No se pudo cargar el panel administrativo"));
    } finally {
      setIsLoadingInitialData(false);
    }
  };

  const createUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    if (usuarioForm.rol === "SOCIO") {
      setError("El rol SOCIO se registra únicamente desde el módulo Socios.");
      return;
    }

    if (!isValidEmail(usuarioForm.email)) {
      setError("Ingrese un email válido para el usuario");
      return;
    }

    if (!isValidPassword(usuarioForm.password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número");
      return;
    }

    setIsCreatingUsuario(true);

    try {
      await usuarioService.create({
        username: usuarioForm.username,
        password: usuarioForm.password,
        email: usuarioForm.email,
        idRol: ROLE_ID_MAP[usuarioForm.rol],
        idCooperativa: coopId,
      });

      setUsuarioForm(initialUsuarioForm);
      await fetchUsuarios();
      setNotice("Usuario creado correctamente.");
    } catch (createError) {
      setError(readErrorMessage(createError, "No se pudo crear el usuario"));
    } finally {
      setIsCreatingUsuario(false);
    }
  };

  const createSocio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    if (!isValidEmail(socioForm.email)) {
      setError("Ingrese un email válido para el socio");
      return;
    }

    if (!isValidPassword(socioForm.password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número");
      return;
    }

    if (!isValidDni(socioForm.dni)) {
      setError("El DNI debe tener 8 dígitos numéricos");
      return;
    }

    if (socioForm.telefono.trim() && !isValidPhone(socioForm.telefono)) {
      setError("El teléfono debe tener 9 dígitos numéricos");
      return;
    }

    setIsCreatingSocio(true);

    try {
      // TODO: mover generación de códigoSocio al backend para evitar duplicidad concurrente.
      const codigoSocioGenerado = `SOC-${String(socios.length + 1).padStart(6, "0")}`;

      const usuarioCreado = await usuarioService.create({
        username: socioForm.username,
        password: socioForm.password,
        email: socioForm.email,
        idRol: ROLE_ID_MAP[socioForm.rol],
        idCooperativa: coopId,
      });

      if (!usuarioCreado.idUsuario) {
        throw new Error("El backend no devolvió idUsuario al crear el usuario SOCIO");
      }

      try {
        await socioService.create({
          codigoSocio: codigoSocioGenerado,
          dni: socioForm.dni,
          nombres: socioForm.nombres,
          apellidos: socioForm.apellidos,
          telefono: socioForm.telefono,
          direccion: socioForm.direccion,
          idUsuario: Number(usuarioCreado.idUsuario),
          idCooperativa: coopId,
        });
      } catch (secondError) {
        const secondMessage = readErrorMessage(secondError, "No se pudo crear el socio");
        setError(`${secondMessage}. El usuario ya fue creado; revisa los datos del socio e inténtalo nuevamente.`);
        return;
      }

      setSocioForm(initialSocioForm);
      await Promise.all([fetchSocios(), fetchUsuarios()]);
      setNotice("Socio creado correctamente con usuario asociado.");
    } catch (createError) {
      setError(readErrorMessage(createError, "No se pudo completar el registro del socio"));
    } finally {
      setIsCreatingSocio(false);
    }
  };

  const approvePrestamo = async (idPrestamo: number) => {
    setError("");
    setNotice("");
    setIsApprovingPrestamo(true);

    try {
      await prestamoService.aprobar(idPrestamo);
      await fetchPrestamos();
      setNotice("Préstamo aprobado correctamente.");
    } catch (approveError) {
      setError(readErrorMessage(approveError, "No se pudo aprobar el préstamo"));
    } finally {
      setIsApprovingPrestamo(false);
    }
  };

  const fetchHistorial = async () => {
    setError("");
    setNotice("");

    const socioId = Number(selectedSocioId);
    if (!socioId) {
      setError("Selecciona un socio para consultar el historial financiero.");
      return;
    }

    const isSocioInCooperativa = socios.some((item) => Number(item.idSocio) === socioId);
    if (!isSocioInCooperativa) {
      setError("El socio seleccionado no pertenece a la cooperativa autenticada.");
      return;
    }

    setIsLoadingHistorial(true);

    try {
      const data = await historialFinancieroService.getBySocioId(socioId);
      setHistorial(data);
    } catch (historialError) {
      setError(readErrorMessage(historialError, "No se pudo cargar el historial financiero"));
    } finally {
      setIsLoadingHistorial(false);
    }
  };

  const onLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // TODO: implementar endpoint de carga de imagen y guardar logoUrl real.
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setLogoFileName(file.name);
  };

  const saveIdentity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const coopId = requireCooperativaId();
    if (!coopId) {
      return;
    }

    if (!isValidRuc(cooperativaForm.ruc)) {
      setError("El RUC debe tener 11 dígitos numéricos");
      return;
    }

    if (!isValidEmail(cooperativaForm.email)) {
      setError("Ingrese un email válido para la cooperativa");
      return;
    }

    if (cooperativaForm.telefono.trim() && !isValidPhone(cooperativaForm.telefono)) {
      setError("El teléfono debe tener 9 dígitos numéricos");
      return;
    }

    if (!isValidHexColor(cooperativaForm.colorPrincipal) || !isValidHexColor(cooperativaForm.colorSecundario)) {
      setError("Los colores deben tener formato hexadecimal válido, por ejemplo #0F1E3A");
      return;
    }

    setIsSavingIdentity(true);

    try {
      const payload: Partial<Cooperativa> = {
        nombre: cooperativaForm.nombre,
        ruc: cooperativaForm.ruc,
        direccion: cooperativaForm.direccion,
        telefono: cooperativaForm.telefono,
        email: cooperativaForm.email,
        logoUrl: cooperativaForm.logoUrl,
        colorPrincipal: cooperativaForm.colorPrincipal || "#0F1E3A",
        colorSecundario: cooperativaForm.colorSecundario || "#1E3A8A",
      };

      const updated = await cooperativaService.update(coopId, payload);
      setCooperativaForm({
        nombre: updated.nombre || "",
        ruc: updated.ruc || "",
        direccion: updated.direccion || "",
        telefono: updated.telefono || "",
        email: updated.email || "",
        logoUrl: updated.logoUrl || "",
        colorPrincipal: updated.colorPrincipal || "#0F1E3A",
        colorSecundario: updated.colorSecundario || "#1E3A8A",
      });

      persistCooperativaBranding(updated);
      setNotice("Identidad de la cooperativa actualizada.");
    } catch (saveError) {
      setError(readErrorMessage(saveError, "No se pudo guardar la identidad de la cooperativa"));
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const saveFinancialConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!configuracion?.idConfiguracion) {
      // TODO: confirmar endpoint POST para crear configuración financiera inicial.
      setError("Aún no existe una configuración financiera inicial para esta cooperativa.");
      return;
    }

    if (configForm.montoMaximoPrestamo.trim() && !isPositiveNumber(configForm.montoMaximoPrestamo)) {
      setError("El monto máximo de préstamo debe ser mayor a 0");
      return;
    }

    if (configForm.numeroMaximoCuotas.trim() && !isPositiveNumber(configForm.numeroMaximoCuotas)) {
      setError("El número máximo de cuotas debe ser mayor a 0");
      return;
    }

    if (configForm.montoMinimoAportacion.trim() && !isPositiveNumber(configForm.montoMinimoAportacion)) {
      setError("El monto mínimo de aportación debe ser mayor a 0");
      return;
    }

    if (configForm.montoMaximoAportacion.trim() && !isPositiveNumber(configForm.montoMaximoAportacion)) {
      setError("El monto máximo de aportación debe ser mayor a 0");
      return;
    }

    if (configForm.diaPagoAportacion.trim() && !isValidDayOfMonth(configForm.diaPagoAportacion)) {
      setError("El día de pago de aportación debe estar entre 1 y 31");
      return;
    }

    setIsSavingFinancial(true);

    try {
      const payload: Partial<ConfiguracionCooperativa> = {
        tasaInteresDefault: toNumberOrUndefined(configForm.tasaInteresDefault),
        moneda: configForm.moneda,
        montoMaximoPrestamo: toNumberOrUndefined(configForm.montoMaximoPrestamo),
        numeroMaximoCuotas: toNumberOrUndefined(configForm.numeroMaximoCuotas),
        diasGracia: toNumberOrUndefined(configForm.diasGracia),
        montoMinimoAportacion: toNumberOrUndefined(configForm.montoMinimoAportacion),
        montoMaximoAportacion: toNumberOrUndefined(configForm.montoMaximoAportacion),
        diaPagoAportacion: toNumberOrUndefined(configForm.diaPagoAportacion),
      };

      await configuracionCooperativaService.update(Number(configuracion.idConfiguracion), payload);
      await fetchConfiguracion();
      setNotice("Parámetros financieros actualizados.");
    } catch (saveError) {
      setError(readErrorMessage(saveError, "No se pudo actualizar la configuración financiera"));
    } finally {
      setIsSavingFinancial(false);
    }
  };

  useEffect(() => {
    if (!currentSection || !VALID_SECTIONS.includes(currentSection as SectionKey)) {
      router.replace("/admin?view=socios");
    }
  }, [currentSection, router]);

  useEffect(() => {
    if (!idCooperativa) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadInitialData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [idCooperativa]);

  return (
    <AdminLayout title="Panel administrativo" subtitle={sectionSubtitle}>
      {error ? <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}
      {isLoadingInitialData ? <p className="mb-4 text-sm text-slate-500">Cargando información de la cooperativa...</p> : null}

      {activeSection === "socios" ? (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-900">Socios</h2>
            {socios.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Aún no hay socios registrados</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-2 py-2">ID</th>
                      <th className="px-2 py-2">Código</th>
                      <th className="px-2 py-2">Nombres</th>
                      <th className="px-2 py-2">Apellidos</th>
                      <th className="px-2 py-2">DNI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socios.map((socio) => (
                      <tr key={socio.idSocio ?? socio.codigoSocio} className="border-b border-slate-100">
                        <td className="px-2 py-2">{socio.idSocio ?? "-"}</td>
                        <td className="px-2 py-2">{socio.codigoSocio ?? "-"}</td>
                        <td className="px-2 py-2">{socio.nombres ?? "-"}</td>
                        <td className="px-2 py-2">{socio.apellidos ?? "-"}</td>
                        <td className="px-2 py-2">{socio.dni ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form onSubmit={createSocio} className={`${cardClass} space-y-3`}>
            <h3 className="text-lg font-semibold text-slate-900">Registrar socio</h3>
            <p className="text-xs text-slate-500">Este formulario crea primero el usuario SOCIO y luego el socio asociado.</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  className={inputClass}
                  value={socioForm.username}
                  onChange={(event) => setSocioForm((current) => ({ ...current, username: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className={inputClass}
                  value={socioForm.password}
                  onChange={(event) => setSocioForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={socioForm.email}
                  onChange={(event) => setSocioForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
                <select
                  className={inputClass}
                  value={socioForm.rol}
                  onChange={(event) => setSocioForm((current) => ({ ...current, rol: event.target.value as RoleName }))}
                  disabled
                >
                  <option value="SOCIO">SOCIO</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">DNI</label>
                <input
                  className={inputClass}
                  value={socioForm.dni}
                  onChange={(event) => setSocioForm((current) => ({ ...current, dni: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombres</label>
                <input
                  className={inputClass}
                  value={socioForm.nombres}
                  onChange={(event) => setSocioForm((current) => ({ ...current, nombres: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Apellidos</label>
                <input
                  className={inputClass}
                  value={socioForm.apellidos}
                  onChange={(event) => setSocioForm((current) => ({ ...current, apellidos: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                <input
                  className={inputClass}
                  value={socioForm.telefono}
                  onChange={(event) => setSocioForm((current) => ({ ...current, telefono: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                <input
                  className={inputClass}
                  value={socioForm.direccion}
                  onChange={(event) => setSocioForm((current) => ({ ...current, direccion: event.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingSocio}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingSocio ? "Creando socio..." : "Crear socio"}
            </button>
          </form>
        </section>
      ) : null}

      {activeSection === "usuarios" ? (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={cardClass}>
            <h2 className="text-lg font-semibold text-slate-900">Usuarios</h2>
            {usuarios.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Aún no hay usuarios adicionales</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-2 py-2">ID</th>
                      <th className="px-2 py-2">Usuario</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.idUsuario} className="border-b border-slate-100">
                        <td className="px-2 py-2">{usuario.idUsuario ?? "-"}</td>
                        <td className="px-2 py-2">{usuario.username ?? "-"}</td>
                        <td className="px-2 py-2">{usuario.email ?? "-"}</td>
                        <td className="px-2 py-2">{usuario.idRol ? ROLE_LABEL_BY_ID[usuario.idRol] ?? `ROL ${usuario.idRol}` : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form onSubmit={createUsuario} className={`${cardClass} space-y-3`}>
            <h3 className="text-lg font-semibold text-slate-900">Crear usuario</h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                className={inputClass}
                value={usuarioForm.username}
                onChange={(event) => setUsuarioForm((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className={inputClass}
                value={usuarioForm.password}
                onChange={(event) => setUsuarioForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className={inputClass}
                value={usuarioForm.email}
                onChange={(event) => setUsuarioForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
              <select
                className={inputClass}
                value={usuarioForm.rol}
                onChange={(event) => setUsuarioForm((current) => ({ ...current, rol: event.target.value as RoleName }))}
              >
                {roleOptions.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreatingUsuario}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingUsuario ? "Creando usuario..." : "Crear usuario"}
            </button>
          </form>
        </section>
      ) : null}

      {activeSection === "prestamos" ? (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Préstamos</h2>
          {prestamos.length === 0 ? (
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Aún no hay préstamos</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
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
                    <tr key={prestamo.idPrestamo} className="border-b border-slate-100">
                      <td className="px-2 py-2">{prestamo.idPrestamo ?? "-"}</td>
                      <td className="px-2 py-2">{prestamo.idSocio ?? "-"}</td>
                      <td className="px-2 py-2">{prestamo.monto ?? "-"}</td>
                      <td className="px-2 py-2">{prestamo.saldoPendiente ?? "-"}</td>
                      <td className="px-2 py-2">{prestamo.estado ?? "-"}</td>
                      <td className="px-2 py-2">
                        {prestamo.estado === "PENDIENTE" ? (
                          <button
                            onClick={() => approvePrestamo(Number(prestamo.idPrestamo))}
                            disabled={isApprovingPrestamo}
                            className="rounded-full border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isApprovingPrestamo ? "Procesando..." : "Aprobar"}
                          </button>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {activeSection === "aportaciones" ? (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Aportaciones</h2>
          {aportaciones.length === 0 ? (
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Aún no hay aportaciones</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
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
                    <tr key={aportacion.idAportacion} className="border-b border-slate-100">
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
            </div>
          )}
        </section>
      ) : null}

      {activeSection === "pagos" ? (
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Pagos de cuotas</h2>
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Próximamente.</p>
        </section>
      ) : null}

      {activeSection === "historial" ? (
        <section className={`${cardClass} space-y-4`}>
          <h2 className="text-lg font-semibold text-slate-900">Historial financiero</h2>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Socio</label>
              <select
                className={inputClass}
                value={selectedSocioId}
                onChange={(event) => setSelectedSocioId(event.target.value)}
              >
                <option value="">Selecciona un socio</option>
                {socios.map((socio) => (
                  <option key={socio.idSocio} value={socio.idSocio}>
                    {(socio.nombres || "") + " " + (socio.apellidos || "")} - {socio.codigoSocio || "Sin código"}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchHistorial}
              disabled={isLoadingHistorial}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingHistorial ? "Consultando..." : "Consultar historial"}
            </button>
          </div>

          {historial ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total aportado</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{historial.totalAportado ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total prestado</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{historial.totalPrestado ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Saldo pendiente</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{historial.saldoPendiente ?? 0}</p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeSection === "configuracion" ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveIdentity} className={`${cardClass} space-y-4`}>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Identidad de la cooperativa</h2>
              <p className="mt-1 text-xs text-slate-500">Actualiza los datos principales de la cooperativa.</p>
              <p className="mt-1 text-xs text-slate-500">Personaliza la identidad visual de tu cooperativa.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  className={inputClass}
                  value={cooperativaForm.nombre}
                  onChange={(event) => setCooperativaForm((current) => ({ ...current, nombre: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">RUC</label>
                <input
                  className={inputClass}
                  value={cooperativaForm.ruc}
                  onChange={(event) => setCooperativaForm((current) => ({ ...current, ruc: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                <input
                  className={inputClass}
                  value={cooperativaForm.telefono}
                  onChange={(event) => setCooperativaForm((current) => ({ ...current, telefono: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={cooperativaForm.email}
                  onChange={(event) => setCooperativaForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={cooperativaForm.direccion}
                  onChange={(event) => setCooperativaForm((current) => ({ ...current, direccion: event.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Subir logo</label>
              <input type="file" accept="image/*" onChange={onLogoFileChange} className="w-full text-sm text-slate-700" />
              {logoFileName ? <p className="mt-1 text-xs text-slate-500">Archivo seleccionado: {logoFileName}</p> : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Color principal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 rounded-lg border border-slate-300 bg-white"
                    value={cooperativaForm.colorPrincipal}
                    onChange={(event) => setCooperativaForm((current) => ({ ...current, colorPrincipal: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    value={cooperativaForm.colorPrincipal}
                    onChange={(event) => setCooperativaForm((current) => ({ ...current, colorPrincipal: event.target.value || "#0F1E3A" }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Color secundario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 rounded-lg border border-slate-300 bg-white"
                    value={cooperativaForm.colorSecundario}
                    onChange={(event) => setCooperativaForm((current) => ({ ...current, colorSecundario: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    value={cooperativaForm.colorSecundario}
                    onChange={(event) => setCooperativaForm((current) => ({ ...current, colorSecundario: event.target.value || "#1E3A8A" }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Preview visual</p>
              <div
                className="rounded-xl p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${cooperativaForm.colorPrincipal}, ${cooperativaForm.colorSecundario})` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/20">
                    {logoPreview ? <img src={logoPreview} alt="Preview logo" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/80">COOPFIN</p>
                    <p className="font-semibold">{cooperativaForm.nombre || "Tu cooperativa"}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingIdentity}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingIdentity ? "Guardando identidad..." : "Guardar identidad"}
            </button>
          </form>

          <form onSubmit={saveFinancialConfig} className={`${cardClass} space-y-4`}>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Parámetros financieros</h2>
              <p className="mt-1 text-xs text-slate-500">Define los parámetros financieros de operación.</p>
            </div>

            {configuracion?.idConfiguracion ? (
              <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Configuración activa: #{configuracion.idConfiguracion}
              </p>
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                No existe configuración financiera aún para esta cooperativa.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tasa interés default</label>
                <input
                  className={inputClass}
                  value={configForm.tasaInteresDefault}
                  onChange={(event) => setConfigForm((current) => ({ ...current, tasaInteresDefault: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Moneda</label>
                <input
                  className={inputClass}
                  value={configForm.moneda}
                  onChange={(event) => setConfigForm((current) => ({ ...current, moneda: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monto máximo préstamo</label>
                <input
                  className={inputClass}
                  value={configForm.montoMaximoPrestamo}
                  onChange={(event) => setConfigForm((current) => ({ ...current, montoMaximoPrestamo: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Número máximo cuotas</label>
                <input
                  className={inputClass}
                  value={configForm.numeroMaximoCuotas}
                  onChange={(event) => setConfigForm((current) => ({ ...current, numeroMaximoCuotas: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Días gracia</label>
                <input
                  className={inputClass}
                  value={configForm.diasGracia}
                  onChange={(event) => setConfigForm((current) => ({ ...current, diasGracia: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monto mínimo aportación</label>
                <input
                  className={inputClass}
                  value={configForm.montoMinimoAportacion}
                  onChange={(event) => setConfigForm((current) => ({ ...current, montoMinimoAportacion: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monto máximo aportación</label>
                <input
                  className={inputClass}
                  value={configForm.montoMaximoAportacion}
                  onChange={(event) => setConfigForm((current) => ({ ...current, montoMaximoAportacion: event.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Día de pago aportación</label>
                <input
                  className={inputClass}
                  value={configForm.diaPagoAportacion}
                  onChange={(event) => setConfigForm((current) => ({ ...current, diaPagoAportacion: event.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingFinancial || !configuracion?.idConfiguracion}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingFinancial ? "Guardando parámetros..." : "Guardar parámetros financieros"}
            </button>
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
        <div className="min-h-screen bg-[#F5F7FA] p-6">
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
