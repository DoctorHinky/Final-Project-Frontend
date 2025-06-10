// src/types/dtos/Post.Category.types.ts

/**
 * Post-Kategorien basierend auf Backend PostCategory Enum
 */
export const PostCategory = {
  EDUCATION: 'EDUCATION',
  ENTERTAINMENT: 'ENTERTAINMENT',
  FAMILY: 'FAMILY',
  CULTURE: 'CULTURE',
  NATURE: 'NATURE',
  RAISING_CHILDREN: 'RAISING_CHILDREN',
  TECHNOLOGY: 'TECHNOLOGY',
  HEALTH: 'HEALTH',
  LIFESTYLE: 'LIFESTYLE',
  TRAVEL: 'TRAVEL',
  FOOD: 'FOOD',
  FITNESS: 'FITNESS',
  OTHER: 'OTHER'
} as const;

export type PostCategory = typeof PostCategory[keyof typeof PostCategory];

/**
 * Deutsche Übersetzungen für Post-Kategorien
 */
export const PostCategoryLabels: Record<PostCategory, string> = {
  [PostCategory.EDUCATION]: 'Bildung',
  [PostCategory.ENTERTAINMENT]: 'Unterhaltung',
  [PostCategory.FAMILY]: 'Familie',
  [PostCategory.CULTURE]: 'Kultur',
  [PostCategory.NATURE]: 'Natur',
  [PostCategory.RAISING_CHILDREN]: 'Kindererziehung',
  [PostCategory.TECHNOLOGY]: 'Technologie',
  [PostCategory.HEALTH]: 'Gesundheit',
  [PostCategory.LIFESTYLE]: 'Lifestyle',
  [PostCategory.TRAVEL]: 'Reisen',
  [PostCategory.FOOD]: 'Essen & Trinken',
  [PostCategory.FITNESS]: 'Fitness',
  [PostCategory.OTHER]: 'Sonstiges'
};

export const getCategoryLabel = (category: PostCategory | string): string => {
  if (typeof category === 'string') {
    const value = (Object.values(PostCategory) as string[]).includes(category)
      ? category as PostCategory
      : undefined;
    return (value && PostCategoryLabels[value]) || category;
  }
  return PostCategoryLabels[category] || 'Unbekannt';
};