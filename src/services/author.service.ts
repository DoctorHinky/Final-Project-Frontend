// src/services/author.service.ts
import { authService } from './auth.service';

interface QuizAnswer {
  text: string;
}

interface QuizQuestion {
  text: string;
  answers: QuizAnswer[];
  correctAnswer: number;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface Chapter {
  title: string;
  content: string;
  chapterImage?: string;
  quiz?: Quiz;
}

interface Article {
  id?: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  status: 'draft' | 'published';
  lastUpdated?: string;
  publishDate?: string;
}

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
    const userData = authService.getUserData();
    // In einer realen Anwendung würden Sie hier die tatsächliche Autor-Rolle prüfen
    // Für Testzwecke gibt diese Funktion aktuell true zurück
    return true; // Für Entwicklungsphase alle als Autoren betrachten
    // Spätere Implementierung: return userData && userData.isAuthor === true;
  }
 
  // Artikel als Entwurf speichern
  async saveArticleDraft(articleData: Article): Promise<ServiceResult> {
    console.log('Speichere Artikelentwurf:', articleData);
   
    // Simulieren einer erfolgreichen Speicherung
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende Entwürfe laden
        const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
        let draftId = articleData.id;
        
        // Prüfen, ob es ein Update oder ein neuer Entwurf ist
        const existingDraftIndex = drafts.findIndex(draft => draft.id === articleData.id);
        
        if (existingDraftIndex >= 0) {
          // Bestehenden Entwurf aktualisieren
          drafts[existingDraftIndex] = {
            ...articleData,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Neuen Entwurf erstellen
          draftId = 'draft_' + Date.now();
          const newDraft: Article = {
            ...articleData,
            id: draftId,
            status: 'draft',
            lastUpdated: new Date().toISOString()
          };
          drafts.push(newDraft);
        }
        
        // Im LocalStorage speichern
        localStorage.setItem('article_drafts', JSON.stringify(drafts));
       
        resolve({
          success: true,
          draftId,
          message: 'Artikel erfolgreich als Entwurf gespeichert'
        });
      }, 500);
    });
  }
 
  // Artikel veröffentlichen oder aktualisierten Artikel speichern
  async publishArticle(articleData: Article): Promise<ServiceResult> {
    console.log('Veröffentliche Artikel:', articleData);
   
    // Simulieren einer erfolgreichen Veröffentlichung
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende veröffentlichte Artikel laden
        const articles: Article[] = JSON.parse(localStorage.getItem('published_articles') || '[]');
        let articleId = articleData.id;
        
        // Prüfen, ob es ein Update oder ein neuer Artikel ist
        const existingArticleIndex = articles.findIndex(article => article.id === articleData.id);
        
        if (existingArticleIndex >= 0) {
          // Bestehenden Artikel aktualisieren
          articles[existingArticleIndex] = {
            ...articles[existingArticleIndex],
            title: articleData.title,
            description: articleData.description,
            coverImage: articleData.coverImage,
            chapters: articleData.chapters,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Neuen Artikel erstellen
          articleId = 'pub_' + Date.now();
          const newArticle: Article = {
            ...articleData,
            id: articleId,
            status: 'published',
            publishDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
          articles.push(newArticle);
        }
        
        // Im LocalStorage speichern
        localStorage.setItem('published_articles', JSON.stringify(articles));
       
        resolve({
          success: true,
          articleId,
          message: existingArticleIndex >= 0 ? 'Artikel erfolgreich aktualisiert' : 'Artikel erfolgreich veröffentlicht'
        });
      }, 1000);
    });
  }
 
  // Entwurf löschen
  async deleteDraft(draftId: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende Entwürfe laden
        const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
        
        // Entwurf entfernen
        const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
        
        // Aktualisierte Liste speichern
        localStorage.setItem('article_drafts', JSON.stringify(updatedDrafts));
        
        resolve({
          success: true,
          message: 'Entwurf erfolgreich gelöscht'
        });
      }, 300);
    });
  }
  
  // Veröffentlichten Artikel löschen
  async deletePublishedArticle(articleId: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Bestehende veröffentlichte Artikel laden
        const articles: Article[] = JSON.parse(localStorage.getItem('published_articles') || '[]');
        
        // Artikel entfernen
        const updatedArticles = articles.filter(article => article.id !== articleId);
        
        // Aktualisierte Liste speichern
        localStorage.setItem('published_articles', JSON.stringify(updatedArticles));
        
        resolve({
          success: true,
          message: 'Artikel erfolgreich gelöscht'
        });
      }, 500);
    });
  }
 
  // Alle Entwürfe des Autors abrufen
  async getAuthorDrafts(): Promise<DraftsResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
        
        // Nach Datum sortieren (neueste zuerst)
        drafts.sort((a, b) => {
          const dateA = new Date(a.lastUpdated || '').getTime();
          const dateB = new Date(b.lastUpdated || '').getTime();
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
        const articles: Article[] = JSON.parse(localStorage.getItem('published_articles') || '[]');
        
        // Nach Datum sortieren (neueste zuerst)
        articles.sort((a, b) => {
          const dateA = new Date(a.publishDate || '').getTime();
          const dateB = new Date(b.publishDate || '').getTime();
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
        const publishedArticles: Article[] = JSON.parse(localStorage.getItem('published_articles') || '[]');
        let article = publishedArticles.find(a => a.id === articleId);
        
        // Falls nicht gefunden, in Entwürfen suchen
        if (!article) {
          const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
          article = drafts.find(d => d.id === articleId);
        }
        
        resolve(article || null);
      }, 200);
    });
  }
  
  // Ein Kapitel mit seinem Bild und Quiz aktualisieren
  async updateChapter(articleId: string, chapterIndex: number, chapterData: Chapter): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Zuerst in veröffentlichten Artikeln suchen
        const publishedArticles: Article[] = JSON.parse(localStorage.getItem('published_articles') || '[]');
        let articleIndex = publishedArticles.findIndex(a => a.id === articleId);
        let isPublished = true;
        
        // Falls nicht gefunden, in Entwürfen suchen
        if (articleIndex === -1) {
          const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
          articleIndex = drafts.findIndex(d => d.id === articleId);
          isPublished = false;
        }
        
        if (articleIndex !== -1) {
          // Artikel und Kapitel aktualisieren
          if (isPublished) {
            if (publishedArticles[articleIndex].chapters[chapterIndex]) {
              publishedArticles[articleIndex].chapters[chapterIndex] = chapterData;
              publishedArticles[articleIndex].lastUpdated = new Date().toISOString();
              localStorage.setItem('published_articles', JSON.stringify(publishedArticles));
            }
          } else {
            const drafts: Article[] = JSON.parse(localStorage.getItem('article_drafts') || '[]');
            if (drafts[articleIndex].chapters[chapterIndex]) {
              drafts[articleIndex].chapters[chapterIndex] = chapterData;
              drafts[articleIndex].lastUpdated = new Date().toISOString();
              localStorage.setItem('article_drafts', JSON.stringify(drafts));
            }
          }
          
          resolve({
            success: true,
            message: 'Kapitel erfolgreich aktualisiert'
          });
        } else {
          resolve({
            success: false,
            message: 'Artikel nicht gefunden'
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
            message: 'Artikel zum Duplizieren nicht gefunden'
          });
          return;
        }
        
        // Als neuen Entwurf speichern
        const draftData: Article = {
          title: `${article.title} (Kopie)`,
          description: article.description,
          coverImage: article.coverImage,
          chapters: article.chapters,
          status: 'draft'
        };
        
        const result = await this.saveArticleDraft(draftData);
        
        resolve({
          success: result.success,
          draftId: result.draftId,
          message: 'Artikel erfolgreich als Entwurf dupliziert'
        });
      }, 500);
    });
  }
  
  // Funktion zum Speichern eines Quiz für ein bestimmtes Kapitel
  async saveQuiz(articleId: string, chapterIndex: number, quizData: Quiz): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Artikel abrufen
          const article = await this.getArticleById(articleId);
          
          if (!article) {
            resolve({
              success: false,
              message: 'Artikel nicht gefunden'
            });
            return;
          }
          
          // Kapitel aktualisieren
          if (article.chapters[chapterIndex]) {
            // Kapitel mit Quiz-Daten aktualisieren
            const updatedChapter = {
              ...article.chapters[chapterIndex],
              quiz: quizData
            };
            
            // Kapitel-Update an die updateChapter-Funktion delegieren
            const result = await this.updateChapter(articleId, chapterIndex, updatedChapter);
            
            resolve({
              success: result.success,
              message: result.success ? 'Quiz erfolgreich gespeichert' : 'Fehler beim Speichern des Quiz'
            });
          } else {
            resolve({
              success: false,
              message: 'Kapitel nicht gefunden'
            });
          }
        } catch (error) {
          console.error('Fehler beim Speichern des Quiz:', error);
          resolve({
            success: false,
            message: 'Ein Fehler ist aufgetreten'
          });
        }
      }, 300);
    });
  }
  
  // Funktion zum Abrufen der Quiz-Ergebnisse eines Benutzers
  async getUserQuizResults(userId: string, articleId: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Hier würde in einer realen Anwendung das Abrufen der Ergebnisse stattfinden
        // Für jetzt geben wir Beispieldaten zurück
        resolve({
          userId,
          articleId,
          results: [
            { chapterIndex: 0, score: 80, completedAt: new Date().toISOString() },
            { chapterIndex: 1, score: 90, completedAt: new Date().toISOString() }
          ]
        });
      }, 300);
    });
  }
  
  // Funktion zum Speichern von Quiz-Ergebnissen eines Benutzers
  async saveQuizResults(userId: string, articleId: string, chapterIndex: number, score: number): Promise<ServiceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Hier würde in einer realen Anwendung das Speichern der Ergebnisse stattfinden
        console.log(`Quiz-Ergebnisse gespeichert: Benutzer=${userId}, Artikel=${articleId}, Kapitel=${chapterIndex}, Punktzahl=${score}`);
        
        resolve({
          success: true,
          message: 'Ergebnisse erfolgreich gespeichert'
        });
      }, 300);
    });
  }
}

export const authorService = new AuthorService();