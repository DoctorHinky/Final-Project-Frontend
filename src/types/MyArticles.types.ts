// src/types/MyArticles.types.ts
import type { PostCategory } from "./dtos/Post.Category.types";

/**
 * Erweiterte History-Response vom Backend
 * Diese Interface sollte mit dem Backend synchronisiert werden
 */
export interface ExtendedHistoryItem {
  // Standard History-Felder
  id: string;
  title: string;
  quickDescription: string;
  image: string | null; // Cloudinary-URL
  author: {
    id?: string | null;
    username: string;
    isPedagogicalAuthor?: boolean;
  };
  readAt: string;
  solvedAt: string | null;
  postId: string;
  postTitle: string;
  postQuickDescription: string;
  postAuthor: string;

  // Erweiterte Post-Daten (für Bild-Support)
  postImage?: string | null; // Cloudinary-URL
  postTags?: string[]; // Post-Tags
  category?: PostCategory; // Post-Kategorie
  postCreatedAt?: string; // Original-Erstellungsdatum
  postPopularityScore?: number; // Popularitätsscore
}

/**
 * Artikel-Daten kombiniert mit History-Informationen für MyArticles
 * Implementiert BaseArticleItem für ArticleReader-Kompatibilität
 */
export interface MyArticleItem {
  // History-Daten (required für MyArticles)

  // Post-Daten (required overrides von BaseArticleItem)
  id: string;
  title: string;
  quickDescription: string;
  image: string | null;
  author: {
    id?: string | null;
    username: string;
    profilePicture?: string | null;
  };
  category: PostCategory | string;
  tags: string[];
  createdAt: string;
  isCertifiedAuthor: boolean;
  readAt: string;
  historyId?: string; // ID des History-Eintrags

  // Computed Felder für UI (required für MyArticles)
  lastRead: string; // formatiertes Datum für Anzeige
  status: "reading" | "completed"; // basierend auf solvedAt

  // Erweiterte Felder (optional)
  popularityScore?: number; // Popularitätsscore
}

/**
 * Tab-Konfiguration für MyArticles
 */
export interface MyArticleTab {
  id: string;
  name: string;
}

/**
 * Artikel-Counts für Tabs
 */
export interface ArticleCounts {
  all: number;
  reading: number;
  completed: number;
  [key: string]: number;
}

/**
 * Filter-Optionen für MyArticles
 */
export interface MyArticleFilters {
  searchQuery: string;
  filterTags: string[];
  sortOption: "date-desc" | "date-asc" | "title-asc" | "title-desc";
  viewMode: "grid" | "list";
}

/**
 * Sort-Optionen für Artikel
 */
export type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";

/**
 * View-Modi für Artikel-Anzeige
 */
export type ViewMode = "grid" | "list";

/**
 * Artikel-Status
 */
export type ArticleStatus = "reading" | "completed";

/**
 * Response für MyArticles mit Pagination
 */
export interface MyArticlesResponse {
  articles: MyArticleItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Pagination-Meta-Informationen
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Image-Helper für MyArticles
 */
export interface ArticleImageData {
  url: string | null;
  publicId: string | null;
  alt: string;
  optimizedUrl?: string;
}

/**
 * Converter-Optionen für History zu MyArticle
 */
export interface ConversionOptions {
  optimizeImages?: boolean;
  fallbackImage?: string | null;
  defaultCategory?: PostCategory;
}

/**
 * Event-Handler-Typen für MyArticles-Komponenten
 */
export interface MyArticlesEvents {
  "open-article": (article: MyArticleItem) => void;
  "remove-article": (articleId: string) => void;
  "add-filter-tag": (tag: string) => void;
  "update:sort-option": (option: SortOption) => void;
  "update:view-mode": (mode: ViewMode) => void;
  "filter-articles": () => void;
  "remove-filter-tag": (index: number) => void;
  "clear-filters": () => void;
  "update:search-query": (query: string) => void;
  "update:active-tab": (tabId: string) => void;
}

/**
 * Loading-States für MyArticles
 */
export interface LoadingStates {
  articles: boolean;
  removing: boolean;
  loading: string | null; // ID des aktuell ladenden Artikels
}

/**
 * Error-Types für MyArticles
 */
export interface MyArticlesError {
  type: "loading" | "removing" | "opening" | "network";
  message: string;
  articleId?: string;
  timestamp: Date;
}

/**
 * Search-Filter-Konfiguration
 */
export interface SearchFilterConfig {
  placeholder: string;
  minSearchLength: number;
  debounceTime: number;
  caseSensitive: boolean;
  searchFields: (keyof MyArticleItem)[];
}

/**
 * Default-Werte für MyArticles
 */
export const MyArticlesDefaults = {
  itemsPerPage: 10,
  defaultSort: "date-desc" as SortOption,
  defaultView: "grid" as ViewMode,
  searchDebounce: 300,
  minSearchLength: 2,
  defaultTab: "all",
  fallbackImage: null,
  optimizeImages: true,
} as const;

/**
 * Utility-Type für partielle MyArticleItem-Updates
 */
export type MyArticleItemUpdate = Partial<Pick<MyArticleItem, "status" | "lastRead" | "tags" | "image">>;

/**
 * Type Guards für MyArticles
 */
export const isMyArticleItem = (obj: any): obj is MyArticleItem => {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.historyId === "string" &&
    typeof obj.readAt === "string" &&
    (obj.status === "reading" || obj.status === "completed")
  );
};

export const isValidSortOption = (option: string): option is SortOption => {
  return ["date-desc", "date-asc", "title-asc", "title-desc"].includes(option);
};

export const isValidViewMode = (mode: string): mode is ViewMode => {
  return ["grid", "list"].includes(mode);
};
