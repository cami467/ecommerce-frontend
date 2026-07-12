import apiClient, { refrescarAccessToken } from "./client";
import { tokenStorage } from "./tokenStorage";
import { useAuthStore, type Usuario } from "../store/authStore";

interface LoginCredenciales {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  usuario: Usuario;
}

interface RegistroDatos {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  telefono?: string;
}

export interface ActualizarPerfilPayload {
  first_name: string;
  last_name: string;
  telefono?: string;
}

export async function login(credenciales: LoginCredenciales): Promise<void> {
  const response = await apiClient.post<LoginResponse>("/token/", {
    email: credenciales.email.trim().toLowerCase(),
    password: credenciales.password,
  });

  const { access, refresh, usuario } = response.data;

  useAuthStore.getState().setAccessToken(access);
  useAuthStore.getState().setUsuario(usuario);
  tokenStorage.setRefreshToken(refresh);
}

export async function registro(datos: RegistroDatos): Promise<void> {
  await apiClient.post("/usuarios/registro/", datos);
}

export async function obtenerPerfil() {
  const response = await apiClient.get<Usuario>("/usuarios/perfil/");
  return response.data;
}

export async function actualizarPerfil(payload: ActualizarPerfilPayload) {
  const response = await apiClient.patch<Usuario>("/usuarios/perfil/", payload);
  return response.data;
}

// ------------------------------------------------------------------
// CANDADO PARA inicializarSesion(): evita que dos llamadas en paralelo
// (ej. React StrictMode invocando el useEffect de AuthBootstrap dos
// veces al montar) disparen dos ejecuciones completas de esta función.
//
// El canje del refresh token en sí ya no se hace acá: se delega a
// refrescarAccessToken() de api/client.ts, que es la ÚNICA función
// de toda la app que le pega a /token/refresh/. Así, si en el mismo
// instante el interceptor de un 401 también necesita refrescar
// (por ejemplo, porque PagoResultadoPage disparó un fetch antes de
// que la sesión terminara de restaurarse), ambos caminos comparten
// el mismo candado y el mismo resultado, en vez de canjear el mismo
// refresh token dos veces por separado.
// ------------------------------------------------------------------
let inicializarSesionPromise: Promise<void> | null = null;

export async function inicializarSesion(): Promise<void> {
  if (inicializarSesionPromise) {
    return inicializarSesionPromise;
  }

  inicializarSesionPromise = ejecutarInicializarSesion().finally(() => {
    inicializarSesionPromise = null;
  });

  return inicializarSesionPromise;
}

async function ejecutarInicializarSesion(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    useAuthStore.getState().setInicializando(false);
    return;
  }

  try {
    const nuevoAccessToken = await refrescarAccessToken();

    if (!nuevoAccessToken) {
      throw new Error("No se pudo refrescar la sesión.");
    }

    const perfilResponse = await apiClient.get<Usuario>("/usuarios/perfil/");
    useAuthStore.getState().setUsuario(perfilResponse.data);
  } catch {
    tokenStorage.clearRefreshToken();
    useAuthStore.getState().logout();
  } finally {
    useAuthStore.getState().setInicializando(false);
  }
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();

  try {
    if (refreshToken) {
      await apiClient.post("/usuarios/logout/", { refresh: refreshToken });
    }
  } catch {
    // Si falla el logout en el backend (token ya vencido, red caida, etc.)
    // igual limpiamos el estado local. El usuario no debe quedar "trabado".
  } finally {
    tokenStorage.clearRefreshToken();
    useAuthStore.getState().logout();
  }
}

export async function cambiarPassword(data: {
  password_actual: string
  password_nueva: string
}) {
  const response = await apiClient.post(
    "/usuarios/cambiar-password/",
    data
  )

  return response.data
}