// src/services/author.service.ts
import type { QuizCreation as Quiz } from "@/components/pages/DashboardPages/CreateArticle/types";
import type { Draft as Article } from "@/components/pages/DashboardPages/CreateArticle/types";
import type { Chapter } from "@/components/pages/DashboardPages/CreateArticle/types/Draft.Chapter.types";
import api from "./axiosInstance";
import { authService } from "./auth.service";
import type { Article as Post } from "@/types/dtos";

interface ServiceResult {
  status?: number;
  success?: boolean;
  postId?: string;
  message?: string | undefined;
}

interface DraftsResult {
  drafts: Article[];
}

interface ArticlesResult {
  posts: Post[];
}

class AuthorService {
  isAuthor(): boolean | null {
    const userData = authService.getUserData();
    return userData && userData.role === "AUTHOR";
  }

  // Artikel als Entwurf speichern
  async saveArticleDraft(articleData: FormData): Promise<ServiceResult> {
    articleData.append("published", "false");
    return await api.post("/article/create", articleData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 25000,
    });
  }

  // Artikel veröffentlichen oder aktualisierten Artikel speichern
  async publishArticle(articleData: FormData): Promise<ServiceResult> {
    articleData.append("published", "true");
    return await api.post("/article/create", articleData, {
      timeout: 25000,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Entwurf löschen
  async deleteArticle(draftId: string): Promise<string> {
    try {
      const response = await api.patch(
        `/article/deletePost/${draftId}`,
        { reason: "normaler Userdelete" },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return response.data.message || "Entwurf erfolgreich gelöscht";
    } catch (error) {
      console.error("Fehler beim Löschen des Entwurfs:", error);

      return "Ein Fehler ist aufgetreten";
    }
  }

  // Alle Entwürfe des Autors abrufen
  async getAuthorDrafts(): Promise<DraftsResult> {
    const userData = authService.getUserData();

    if (!userData || !userData.userId) return { drafts: [] };
    try {
      const response = await api.get(`/article/getPostByAuthor/${userData.userId}/?published=false`, {
        headers: { "Content-Type": "application/json" },
      });
      const drafts: Article[] = response.data.posts || [];
      return { drafts };
    } catch (error) {
      console.error("Fehler beim Laden der Entwürfe:", error);
      return { drafts: [] };
    }
  }

  // Alle veröffentlichten Artikel des Autors abrufen
  async getAuthorPublishedArticles(): Promise<ArticlesResult> {
    const userData = authService.getUserData();

    if (!userData || !userData.userId) return { posts: [] };
    try {
      const response = await api.get(`/article/getPostByAuthor/${userData.userId}`, {
        headers: { "Content-Type": "application/json" },
      });
      const posts: Post[] = response.data.posts || [];
      return { posts };
    } catch (error) {
      console.error("Fehler beim Laden der Entwürfe:", error);
      return { posts: [] };
    }
  }

  // Einen einzelnen Artikel abrufen (für die Detailansicht)
  async getArticleById(articleId: string): Promise<Article | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Zuerst in veröffentlichten Artikeln suchen
        const publishedArticles: Article[] = JSON.parse(localStorage.getItem("published_articles") || "[]");
        let article = publishedArticles.find((a) => a.id === articleId);

        // Falls nicht gefunden, in Entwürfen suchen
        if (!article) {
          const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");
          article = drafts.find((d) => d.id === articleId);
        }

        resolve(article || null);
      }, 200);
    });
  }

  // Ein Kapitel aktualisieren (ohne Quiz)
  async updateChapter(articleId: string, chapterIndex: number, chapterData: Chapter): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Zuerst in veröffentlichten Artikeln suchen
        const publishedArticles: Article[] = JSON.parse(localStorage.getItem("published_articles") || "[]");
        let articleIndex = publishedArticles.findIndex((a) => a.id === articleId);
        let isPublished = true;

        // Falls nicht gefunden, in Entwürfen suchen
        if (articleIndex === -1) {
          const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");
          articleIndex = drafts.findIndex((d) => d.id === articleId);
          isPublished = false;
        }

        if (articleIndex !== -1) {
          // Artikel und Kapitel aktualisieren
          if (isPublished) {
            if (publishedArticles[articleIndex].chapters[chapterIndex]) {
              publishedArticles[articleIndex].chapters[chapterIndex] = chapterData;
              publishedArticles[articleIndex].updated_at = new Date().toISOString();
              localStorage.setItem("published_articles", JSON.stringify(publishedArticles));
            }
          } else {
            const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");
            if (drafts[articleIndex].chapters[chapterIndex]) {
              drafts[articleIndex].chapters[chapterIndex] = chapterData;
              drafts[articleIndex].updated_at = new Date().toISOString();
              localStorage.setItem("article_drafts", JSON.stringify(drafts));
            }
          }

          resolve({
            success: true,
            message: "Kapitel erfolgreich aktualisiert",
          });
        } else {
          resolve({
            success: false,
            message: "Artikel nicht gefunden",
          });
        }
      }, 300);
    });
  }

  // WICHTIG: Korrigierte saveUpdate Methode
  async saveUpdate(postId: string, article: FormData, published: boolean): Promise<any> {
    try {
      // Backend erwartet published als Query-Parameter
      const response = await api.patch(`/article/updateFullPost/${postId}?published=${published}`, article, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 Sekunden Timeout für große Updates
      });

      if (response.status === 200 || response.data?.status === "OK") {
        return {
          success: true,
          message: published ? "Artikel erfolgreich veröffentlicht" : "Entwurf erfolgreich aktualisiert",
          data: response.data,
        };
      }

      return {
        success: false,
        message: response.data?.message || "Fehler beim Aktualisieren des Artikels",
      };
    } catch (error: any) {
      console.error("Fehler beim Aktualisieren des Artikels:", error);
      console.error("Error response:", error.response?.data);

      // Detailliertere Fehlerbehandlung
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: "Ein unerwarteter Fehler ist aufgetreten",
      };
    }
  }

  // Funktion zum Speichern eines Quiz für einen Artikel (jetzt auf Artikelebene)
  async saveArticleQuiz(articleId: string, quizData: Quiz): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Artikel abrufen
          const article = await this.getArticleById(articleId);

          if (!article) {
            resolve({
              message: "Artikel nicht gefunden",
            });
            return;
          }

          // Quiz auf Artikelebene speichern
          const isPublished = article.status === "published";

          if (isPublished) {
            // Veröffentlichten Artikel aktualisieren
            const publishedArticles: Article[] = JSON.parse(localStorage.getItem("published_articles") || "[]");
            const articleIndex = publishedArticles.findIndex((a) => a.id === articleId);

            if (articleIndex !== -1) {
              publishedArticles[articleIndex].quiz = quizData;
              publishedArticles[articleIndex].updated_at = new Date().toISOString();
              localStorage.setItem("published_articles", JSON.stringify(publishedArticles));
            }
          } else {
            // Entwurf aktualisieren
            const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");
            const draftIndex = drafts.findIndex((d) => d.id === articleId);

            if (draftIndex !== -1) {
              drafts[draftIndex].quiz = quizData;
              drafts[draftIndex].updated_at = new Date().toISOString();
              localStorage.setItem("article_drafts", JSON.stringify(drafts));
            }
          }

          resolve({
            success: true,
            message: "Quiz erfolgreich gespeichert",
          });
        } catch (error) {
          console.error("Fehler beim Speichern des Quiz:", error);
          resolve({
            success: false,
            message: "Ein Fehler ist aufgetreten",
          });
        }
      }, 300);
    });
  }

  // Funktion zum Abrufen der Quiz-Ergebnisse eines Benutzers (jetzt für den gesamten Artikel)
  async getUserQuizResults(userId: string, articleId: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Hier würde in einer realen Anwendung das Abrufen der Ergebnisse stattfinden
        // Für jetzt geben wir Beispieldaten zurück
        resolve({
          userId,
          articleId,
          results: {
            score: 85,
            completedAt: new Date().toISOString(),
            correctAnswers: 17,
            totalQuestions: 20,
          },
        });
      }, 300);
    });
  }

  // Funktion zum Speichern von Quiz-Ergebnissen eines Benutzers (jetzt für den gesamten Artikel)
  async saveQuizResults(
    userId: string,
    articleId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number
  ): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Hier würde in einer realen Anwendung das Speichern der Ergebnisse stattfinden
        console.log(
          `Quiz-Ergebnisse gespeichert: Benutzer=${userId}, Artikel=${articleId}, Punktzahl=${score}, Korrekte Antworten=${correctAnswers}/${totalQuestions}`
        );

        resolve({
          success: true,
          message: "Ergebnisse erfolgreich gespeichert",
        });
      }, 300);
    });
  }
}

export const authorService = new AuthorService();
