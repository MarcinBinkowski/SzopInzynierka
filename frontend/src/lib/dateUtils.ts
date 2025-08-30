export function isoToLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return '';
  // Remove seconds and Z/timezone
  return iso.slice(0, 16);
}

export function localDatetimeToIso(local: string | null | undefined): string | undefined {
  if (!local) return undefined;
  const date = new Date(local);
  return date.toISOString();
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}


export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleString();
}
