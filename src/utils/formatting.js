export function formatDuration(hours) {
  if (hours == null) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} ч ${m} мин`;
}

export function formatTravelDuration(totalHours, days, useTravelTime) {
  if (!useTravelTime || totalHours == null || totalHours <= 0) return `${days} дн.`;
  if (totalHours < 24) return `${Math.round(totalHours)} ч`;
  const d = Math.floor(totalHours / 24);
  const h = Math.round(totalHours % 24);
  return `${d} сут ${h} ч`;
}