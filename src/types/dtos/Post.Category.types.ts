export const PostCategory = {
  EDUCATION: "EDUCATION",
  ENTERTAINMENT: "ENTERTAINMENT",
  TECHNOLOGY: "TECHNOLOGY",
  HEALTH: "HEALTH",
  LIFESTYLE: "LIFESTYLE",
  TRAVEL: "TRAVEL",
  FOOD: "FOOD",
  SPORTS: "SPORTS",
  OTHER: "OTHER",
};

export type PostCategory = (typeof PostCategory)[keyof typeof PostCategory];
