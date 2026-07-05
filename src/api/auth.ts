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

export async function inicializarSesion(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    useAuthStore.getState().setInicializando(false);
    return;
  }

  try {
    const refreshResponse = await apiClient.post<RefreshResponse>(
      "/token/refresh/",
      {
        refresh: refreshToken,
      },
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
