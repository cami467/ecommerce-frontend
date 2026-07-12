import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { tokenStorage } from "./tokenStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ------------------------------------------------------------------
// INTERCEPTOR DE REQUEST: agrega el access token a cada peticion
// ------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ------------------------------------------------------------------
// MANEJO DE REFRESH: evita que multiples requests en paralelo
// disparen multiples refrescos simultaneos del token.
//
// IMPORTANTE: esta es la UNICA funcion que debe canjear el refresh
// token en toda la app. Como el backend usa ROTATE_REFRESH_TOKENS +
// BLACKLIST_AFTER_ROTATION, el refresh token es de un solo uso: si
// dos lugares distintos (por ejemplo este interceptor y
// AuthBootstrap) leen el mismo token y cada uno intenta canjearlo
// por su cuenta, el segundo llega tarde con un token ya invalidado
// y termina borrando la sesion que el primero acababa de establecer.
// Por eso refrescarAccessToken() se exporta y se reutiliza tambien
// desde api/auth.ts, en vez de que cada lado tenga su propia copia.
// ------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

export async function refrescarAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = ejecutarRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function ejecutarRefresh(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/token/refresh/`,
      { refresh: refreshToken },
    );
    const nuevoAccessToken: string = response.data.access;
    const nuevoRefreshToken = response.data.refresh;
    useAuthStore.getState().setAccessToken(nuevoAccessToken);

    if (nuevoRefreshToken) {
      tokenStorage.setRefreshToken(nuevoRefreshToken);
    }
    return nuevoAccessToken;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// INTERCEPTOR DE RESPONSE: si la API responde 401, intenta
// refrescar el token una sola vez y reintenta la request original.
// ------------------------------------------------------------------
interface RequestConfigConReintento extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigConReintento;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const esError401 = error.response?.status === 401;
    const yaReintento = originalRequest._retry === true;
    const esRutaDeToken = originalRequest.url?.includes("/token/");

    if (!esError401 || yaReintento || esRutaDeToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const nuevoAccessToken = await refrescarAccessToken();

    if (!nuevoAccessToken) {
      useAuthStore.getState().logout();
      tokenStorage.clearRefreshToken();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${nuevoAccessToken}`;
    return apiClient(originalRequest);
  },
);

export default apiClient;