export interface Article {
  id: string;
  title: string;
  quickDescription: string;
  image: string;
  publicId_image: string;
  tags: string[];
  forKids: boolean;
  ageRestriction: number;
  isCertifiedAuthor: false;
  authorId: string | null;
  moderatorId: string | null;
  published: boolean;
  publishedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  popularityScore: number;
}
