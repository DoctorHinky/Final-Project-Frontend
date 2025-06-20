// utils/postCategoryUtils.ts

export function mapPostCategoryToGerman(category?: string): string {
  if (!category) return "Verschiedenes";
  const map: Record<string, string> = {
    ENTERTAINMENT: "Unterhaltung",
    EDUCATION: "Bildung",
    RAISING_CHILDREN: "Kindererziehung",
    FAMILY: "Familie",
    CULTURE: "Kultur",
    NATURE: "Natur",
    TECHNOLOGY: "Technologie",
    HEALTH: "Gesundheit",
    LIFESTYLE: "Lebensstil",
    TRAVEL: "Reisen",
    FOOD: "Essen",
    FITNESS: "Fitness",
    OTHER: "Verschiedenes",
  };

  return map[category] ?? "Verschiedenes";
}
