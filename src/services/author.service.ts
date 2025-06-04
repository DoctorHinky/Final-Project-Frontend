// src/services/author.service.ts
import { authService } from "./auth.service";
import type { QuizCreation as Quiz } from "@/components/pages/DashboardPages/CreateArticle/types";
import type { Draft as Article } from "@/components/pages/DashboardPages/CreateArticle/types";
import type { Chapter } from "@/components/pages/DashboardPages/CreateArticle/types/Draft.Chapter.types";
import api from "./axiosInstance";

/* interface Chapter {
  title: string;
  content: string;
  chapterImage?: string;
}

interface Article {
  id?: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  quiz?: Quiz; // Quiz ist jetzt auf Artikelebene statt pro Kapitel
  status: "draft" | "published";
  updated_at?: string;
  publishedAt?: string;
} */

interface ServiceResult {
  success: boolean;
  draftId?: string;
  articleId?: string;
  message: string;
}

interface DraftsResult {
  drafts: Article[];
}

interface ArticlesResult {
  articles: Article[];
}

class AuthorService {
  // Prüft, ob der eingeloggte Benutzer ein Autor ist
  isAuthor(): boolean {
    // const userData = authService.getUserData();
    // In einer realen Anwendung würden Sie hier die tatsächliche Autor-Rolle prüfen
    // Für Testzwecke gibt diese Funktion aktuell true zurück
    return true; // Für Entwicklungsphase alle als Autoren betrachten
    // Spätere Implementierung: return userData && userData.isAuthor === true;
  }

  // Artikel als Entwurf speichern
  async saveArticleDraft(articleData: Article): Promise<ServiceResult> {
    console.log("Speichere Artikelentwurf:", articleData);

    // Simulieren einer erfolgreichen Speicherung
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende Entwürfe laden
        const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");
        let draftId = articleData.id;

        // Prüfen, ob es ein Update oder ein neuer Entwurf ist
        const existingDraftIndex = drafts.findIndex((draft) => draft.id === articleData.id);

        if (existingDraftIndex >= 0) {
          // Bestehenden Entwurf aktualisieren
          drafts[existingDraftIndex] = {
            ...articleData,
            updated_at: new Date().toISOString(),
          };
        } else {
          // Neuen Entwurf erstellen
          draftId = "draft_" + Date.now();
          const newDraft: Article = {
            ...articleData,
            id: draftId,
            status: "draft",
            updated_at: new Date().toISOString(),
          };
          drafts.push(newDraft);
        }

        // Im LocalStorage speichern
        localStorage.setItem("article_drafts", JSON.stringify(drafts));

        resolve({
          success: true,
          draftId,
          message: "Artikel erfolgreich als Entwurf gespeichert",
        });
      }, 500);
    });
  }

  // Artikel veröffentlichen oder aktualisierten Artikel speichern
  async publishArticle(articleData: any): Promise<ServiceResult> {
    console.log("Veröffentliche Artikel:", articleData);
    const data = {
      ...articleData,
      isPublished: true,
    };

    return await api.post("/article/create", data);
  }

  // Entwurf löschen
  async deleteDraft(draftId: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende Entwürfe laden
        const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");

        // Entwurf entfernen
        const updatedDrafts = drafts.filter((draft) => draft.id !== draftId);

        // Aktualisierte Liste speichern
        localStorage.setItem("article_drafts", JSON.stringify(updatedDrafts));

        resolve({
          success: true,
          message: "Entwurf erfolgreich gelöscht",
        });
      }, 300);
    });
  }

  // Veröffentlichten Artikel löschen
  async deletePublishedArticle(articleId: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende veröffentlichte Artikel laden
        const articles: Article[] = JSON.parse(localStorage.getItem("published_articles") || "[]");

        // Artikel entfernen
        const updatedArticles = articles.filter((article) => article.id !== articleId);

        // Aktualisierte Liste speichern
        localStorage.setItem("published_articles", JSON.stringify(updatedArticles));

        resolve({
          success: true,
          message: "Artikel erfolgreich gelöscht",
        });
      }, 500);
    });
  }

  // Alle Entwürfe des Autors abrufen
  async getAuthorDrafts(): Promise<DraftsResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts: Article[] = JSON.parse(localStorage.getItem("article_drafts") || "[]");

        // Nach Datum sortieren (neueste zuerst)
        drafts.sort((a, b) => {
          const dateA = new Date(a.updated_at || "").getTime();
          const dateB = new Date(b.updated_at || "").getTime();
          return dateB - dateA;
        });

        resolve({ drafts });
      }, 300);
    });
  }

  // Alle veröffentlichten Artikel des Autors abrufen
  async getAuthorPublishedArticles(): Promise<ArticlesResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const articles: Article[] = JSON.parse(localStorage.getItem("published_articles") || "[]");

        // Nach Datum sortieren (neueste zuerst)
        articles.sort((a, b) => {
          const dateA = new Date(a.publishedAt || "").getTime();
          const dateB = new Date(b.publishedAt || "").getTime();
          return dateB - dateA;
        });

        resolve({ articles });
      }, 400);
    });
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

  // Funktion zum Duplizieren eines veröffentlichten Artikels als Entwurf
  async duplicateArticleAsDraft(articleId: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Artikel abrufen
        const article = await this.getArticleById(articleId);

        if (!article) {
          resolve({
            success: false,
            message: "Artikel zum Duplizieren nicht gefunden",
          });
          return;
        }

        // Als neuen Entwurf speichern
        const draftData: Article = {
          id: `draft_${Date.now()}`, // Neue ID für den Entwurf
          title: `${article.title} (Kopie)`,
          description: article.description,
          coverImage: article.coverImage,
          chapters: article.chapters,
          quiz: article.quiz, // Auch das Quiz kopieren
          status: "draft",
          updated_at: new Date().toISOString(),
        };

        const result = await this.saveArticleDraft(draftData);

        resolve({
          success: result.success,
          draftId: result.draftId,
          message: "Artikel erfolgreich als Entwurf dupliziert",
        });
      }, 500);
    });
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
              success: false,
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
