export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function setRefreshToken(token: string) {
  localStorage.setItem('refreshToken', token);
}

export function getUser(): StoredUser | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}