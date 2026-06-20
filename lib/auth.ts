import api from "./api";
import { LoginResponse, User } from "./types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }
}

export function saveSession(data: LoginResponse): void {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}