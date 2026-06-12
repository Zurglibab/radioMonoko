let _backoffUntil = 0;
const BACKOFF_DURATION = 60_000;

export function isInBackoff(): boolean {
  return Date.now() < _backoffUntil;
}

export function triggerGlobalBackoff(): void {
  _backoffUntil = Date.now() + BACKOFF_DURATION;
}

export function clearBackoff(): void {
  _backoffUntil = 0;
}
