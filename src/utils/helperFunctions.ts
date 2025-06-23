export function formatDate(date: string | Date | null, defaultReturn: string = ""): string {
  if (!date) return defaultReturn;

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return defaultReturn;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function formatDateOnly(date: string | Date | null, defaultReturn?: any): string {
  console.log("datum", date);
  if (!date || date === null) return defaultReturn || "";

  return new Date(date).toLocaleDateString("de-DE", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
