import AxiosInstance from "./AxiosInstance";
import type { User } from "../interfaces/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

const AuthService = {
  login: (data: LoginPayload) =>
    AxiosInstance.post<{ user: User; token: string }>("/auth/login", data),
  register: (data: RegisterPayload) =>
    AxiosInstance.post<{ user: User; token: string }>("/auth/register", data),
  logout: () => AxiosInstance.post("/auth/logout"),
  me: () => AxiosInstance.get<{ user: User }>("/auth/me"),
  forgotPassword: (data: { email: string }) =>
    AxiosInstance.post<{ message: string }>("/auth/forgot-password", data),
  resetPassword: (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) => AxiosInstance.post<{ message: string }>("/auth/reset-password", data),
};

export default AuthService;
