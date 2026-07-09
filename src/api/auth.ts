import apiClient from "./client";
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

interface RefreshResponse {
  access: string;
  refresh?: string;
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
// veces al montar) lean el MISMO refresh token y ambas intenten
// canjearlo. Como el backend usa ROTATE_REFRESH_TOKENS +
// BLACKLIST_AFTER_ROTATION, el refresh token es de un solo uso: la
// primera llamada lo canjea con éxito y la segunda, al llegar tarde
// con el mismo token ya invalidado, fallaba y BORRABA la sesión
// recién obtenida por la primera. Con este candado, la segunda
// llamada simplemente espera y reutiliza el resultado de la primera.
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
    const refreshResponse = await apiClient.post<RefreshResponse>(
      "/token/refresh/",
      { refresh: refreshToken }
    );

    const { access, refresh } = refreshResponse.data;

    useAuthStore.getState().setAccessToken(access);

    if (refresh) {
      tokenStorage.setRefreshToken(refresh);
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
