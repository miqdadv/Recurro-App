export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const isStrongPassword = (value: string) =>
  value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);

export function getAuthError(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;

  const candidate = error as {
    message?: string;
    longMessage?: string;
    errors?: Array<{ longMessage?: string; message?: string }>;
  };
  return (
    candidate.errors?.[0]?.longMessage ??
    candidate.errors?.[0]?.message ??
    candidate.longMessage ??
    candidate.message ??
    fallback
  );
}
