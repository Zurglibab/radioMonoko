import { API_BASE_URL } from './apiConfig';

// Limiteur de concurrence : max 3 requêtes simultanées vers le backend.
// Les suivantes attendent en file FIFO pour éviter les 429.
const MAX_CONCURRENT = 3;
let _active = 0;
const _queue: Array<() => void> = [];

function _acquire(): Promise<void> {
  if (_active < MAX_CONCURRENT) {
    _active++;
    return Promise.resolve();
  }
  return new Promise<void>(resolve => {
    _queue.push(() => { _active++; resolve(); });
  });
}

function _release() {
  _active--;
  if (_queue.length > 0) _queue.shift()!();
}

/**
 * apiFetch : Wrapper générique autour de fetch, centralisant la logique d'appel à l'API.
 * - Limite la concurrence à MAX_CONCURRENT requêtes simultanées.
 * - Ajoute automatiquement le token d'authentification si fourni.
 * - Gère les erreurs réseau et HTTP de manière uniforme.
 */
export async function apiFetch<T>(
  path: string,
  options: { token?: string; method?: string; body?: any } = {}
): Promise<T> {
  await _acquire();

  try {
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
    } catch {
      throw new Error("Réseau injoignable.");
    }

    if (!response.ok) {
      // 404 are often expected (no status set, resource not yet created) — only log ≥ 400 non-404
      if (__DEV__ && response.status !== 404) {
        const body = await response.text().catch(() => '');
        console.warn(`[API] HTTP ${response.status} on ${path} —`, body);
      }
      if (response.status === 401) throw new Error("Session d'authentification expirée.");
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    _release();
  }
}
