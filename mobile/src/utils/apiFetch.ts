import { API_BASE_URL } from './apiConfig';

/**
 * apiFetch : Wrapper générique autour de fetch, centralisant la logique d'appel à l'API.
 * - Ajoute automatiquement le token d'authentification si fourni.
 * - Gère les erreurs réseau et HTTP de manière uniforme.
 * - Parse la réponse JSON et la typise avec un générique.
 * 
 * @param path 
 * @param options 
 * @returns 
 */
export async function apiFetch<T>(
  path: string,
  options: { token?: string; method?: string; body?: any } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (e: any) {
    throw new Error("Réseau injoignable.");
  }

  if (!response.ok) {
    if (__DEV__) {
      const body = await response.text().catch(() => '');
      console.warn(`[API] HTTP ${response.status} on ${path} —`, body);
    }
    if (response.status === 401) throw new Error("Session d'authentification expirée.");
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}