export function formatDate(date: string | Date | null, defaultReturn?: any): string {
  if (!date || date === null) return defaultReturn || "";

  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
