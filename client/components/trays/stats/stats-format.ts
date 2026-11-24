export function clock(ms: number | null) {
  if (ms === null) return '–';
  const seconds = Math.round(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

export function duration(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}${minutes === 1 ? 'min' : 'mins'}`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function perMove(ms: number | null) {
  return ms === null ? '–' : `${(ms / 1000).toFixed(1)}s`;
}

export function percent(value: number | null) {
  return value === null ? '–' : `${Math.round(value * 100)}%`;
}
