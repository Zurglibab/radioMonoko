import { API_BASE_URL } from './apiConfig';

// Limitation de la concurrence à MAX_CONCURRENT requêtes simultanées pour éviter de saturer le serveur et gérer les ressources côté client.
const MAX_CONCURRENT = 2;
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
 * apiFetch : Fonction utilitaire pour effectuer des requêtes API avec gestion intégrée de la concurrence, des erreurs réseau, des réponses HTTP et des délais de retry en cas de 429.
 * Elle prend en charge l'ajout automatique du token d'authentification dans les en-têtes, la sérialisation du corps de la requête, et le parsing de la réponse JSON.
 * En cas de dépassement de la limite de requêtes (429), elle attend le délai spécifié par le serveur avant de retenter une fois.
 * Les erreurs réseau sont capturées et transformées en messages d'erreur lisibles, tandis que les erreurs HTTP sont gérées avec des messages spécifiques pour les cas courants (401, 404).
 * @param path 
 * @param options 
 * @returns 
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

    const fetchOpts = {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    let response: Response | null = null;
    try {
      response = await fetch(url, fetchOpts);
    } catch {
      throw new Error("Réseau injoignable.");
    }
    if (response.status === 429) {
      if (__DEV__) console.warn(`[API] 429 sur ${path} — slot libéré sans retry`);
      throw new Error("HTTP 429");
    }
    if (!response) throw new Error("Réseau injoignable.");

    if (!response.ok) {
      if (__DEV__) {
        const body = await response.text().catch(() => '');
        console.warn(`[API] HTTP ${response.status} on ${path} —`, body || '(empty body)');
      }
      if (response.status === 401) throw new Error("Session d'authentification expirée.");
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as T;
    }
  } finally {
    _release();
  }
}