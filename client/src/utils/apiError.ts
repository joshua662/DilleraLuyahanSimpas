import type { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const ax = error as AxiosError<ApiErrorBody>;
  const data = ax.response?.data;

  if (data?.errors) {
    const flat = Object.values(data.errors).flat().filter(Boolean);
    if (flat.length) return flat.join(" ");
  }

  if (data?.message) return data.message;

  if (ax.message === "Network Error") {
    return "Cannot reach the server. Start the API: cd server && php artisan serve";
  }

  return fallback;
}

export function isEmailAlreadyRegistered(error: unknown): boolean {
  const ax = error as AxiosError<ApiErrorBody>;
  const status = ax.response?.status;
  const emailErrors = ax.response?.data?.errors?.email ?? [];

  return (
    status === 422 &&
    (ax.response?.data?.code === "EMAIL_EXISTS" ||
      emailErrors.some((m) => /already|registered|taken|exists/i.test(m)))
  );
}
