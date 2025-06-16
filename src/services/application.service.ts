// src/services/application.service.ts
import api from './axiosInstance';

// Bestehende Interfaces (unverändert)
export interface ApplicationFormData {
  phone: string;
  email: string;
  expertise: string;
  expertiseOther: string;
  qualifications: string;
  motivation: string;
  sampleTitle: string;
  sampleDescription: string;
  agreeTerms: boolean;
}

export interface ApplicationFiles {
  coverLetter: File | null;
  certification: File | null;
  writingSample: File | null;
}

export interface ApplicationResponse {
  message: string;
  applicationId: string;
  documentsUploaded: number;
}

export interface MyApplicationsResponse {
  message: string;
  data: ApplicationItem[];
}

export interface ApplicationItem {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  phone: string;
  email: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  referenceDocument: {
    url: string;
  }[];
}

// NEU: Admin-spezifische Interfaces
export type ApplicationStatus = 'PENDING' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
export type ApplicationDocType = 'RESUME' | 'CERTIFICATION' | 'COVER_LETTER' | 'OTHER';

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  url: string;
  publicId: string;
  type: ApplicationDocType;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string | null;
  phone: string;
  email: string;
  content: string;
  status: ApplicationStatus;
  modId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    profilePicture?: string | null;
  } | null;
  referenceDocument?: ApplicationDocument[];
}

export interface RejectionDto {
  reason: string;
}

export interface UserApplicationsResponse {
  message: string;
  data: Application[];
}

class ApplicationService {
  /**
   * Sendet eine neue Autor-Bewerbung (BESTEHEND - unverändert)
   */
  async sendApplication(
    formData: ApplicationFormData,
    files: ApplicationFiles
  ): Promise<ApplicationResponse> {
    try {
      // FormData für Multipart/Form-Data erstellen
      const form = new FormData();

      // Text-Daten zusammenfassen zu content
      const contentParts = [];
      
      if (formData.expertise) {
        contentParts.push(`Fachbereich: ${formData.expertise}`);
        if (formData.expertise === 'other' && formData.expertiseOther) {
          contentParts.push(`Spezifizierung: ${formData.expertiseOther}`);
        }
      }
      
      if (formData.qualifications) {
        contentParts.push(`Qualifikationen: ${formData.qualifications}`);
      }
      
      if (formData.motivation) {
        contentParts.push(`Motivation: ${formData.motivation}`);
      }
      
      if (formData.sampleTitle) {
        contentParts.push(`Beispiel-Artikel Titel: ${formData.sampleTitle}`);
      }
      
      if (formData.sampleDescription) {
        contentParts.push(`Beispiel-Artikel Beschreibung: ${formData.sampleDescription}`);
      }

      const content = contentParts.join('\n\n');

      // Backend-Felder setzen
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('content', content);

      // Dateien anhängen
      if (files.coverLetter) {
        form.append('coverLetter', files.coverLetter);
      }

      if (files.certification) {
        form.append('certification', files.certification);
      }

      if (files.writingSample) {
        // writingSample wird als "resume" gesendet
        form.append('resume', files.writingSample);
      }

      const response = await api.post<ApplicationResponse>('/application/sendApplication', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 Sekunden Timeout für File-Upload
      });

      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Senden der Bewerbung:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Zeitüberschreitung beim Upload. Bitte versuchen Sie es erneut.');
      }
      
      throw new Error('Fehler beim Senden der Bewerbung. Bitte versuchen Sie es später erneut.');
    }
  }

  /**
   * Lädt die eigenen Bewerbungen (BESTEHEND - unverändert)
   */
  async getMyApplications(): Promise<ApplicationItem[]> {
    try {
      const response = await api.get<MyApplicationsResponse>('/application/getMyApplications');
      return response.data.data;
    } catch (error: any) {
      console.error('Fehler beim Laden der Bewerbungen:', error);
      
      if (error.response?.status === 404) {
        // Keine Bewerbungen gefunden ist normal
        return [];
      }
      
      throw new Error('Fehler beim Laden der Bewerbungen.');
    }
  }

  /**
   * Storniert eine Bewerbung (BESTEHEND - unverändert)
   */
  async cancelApplication(applicationId: string): Promise<{ message: string }> {
    try {
      const response = await api.get(`/application/cancelApplication/${applicationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Stornieren der Bewerbung:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Fehler beim Stornieren der Bewerbung.');
    }
  }

  // ========================================
  // NEU: ADMIN-FUNKTIONEN
  // ========================================

  /**
   * Alle Bewerbungen abrufen mit optionalem Status-Filter (ADMIN)
   */
  async getAllApplications(status: ApplicationStatus | 'ALL' = 'ALL'): Promise<Application[]> {
    try {
      const response = await api.get('/application/getApplications', {
        params: { status }
      });
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Bewerbungen:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Laden der Bewerbungen');
    }
  }

  /**
   * Bewerbung nach ID abrufen (ADMIN)
   */
  async getApplicationById(applicationId: string): Promise<Application> {
    try {
      const applications = await this.getAllApplications('ALL');
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        throw new Error('Bewerbung nicht gefunden');
      }
      
      return application;
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Bewerbung:', error);
      throw new Error(error.message || 'Fehler beim Laden der Bewerbung');
    }
  }

  /**
   * Bewerbungen eines bestimmten Benutzers abrufen (ADMIN)
   */
  async getApplicationsByUser(userId: string): Promise<UserApplicationsResponse> {
    try {
      const response = await api.get(`/application/getApplicationByUser/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Benutzer-Bewerbungen:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Laden der Benutzer-Bewerbungen');
    }
  }

  /**
   * Bewerbung "übernehmen" (Status auf IN_PROGRESS setzen) (ADMIN)
   */
  async takeApplication(applicationId: string): Promise<{ message: string; data: Application }> {
    try {
      const response = await api.post(`/application/takeApplication/${applicationId}`, {});
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Übernehmen der Bewerbung:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Übernehmen der Bewerbung');
    }
  }

  /**
   * Bewerbung akzeptieren (ADMIN)
   */
  async acceptApplication(applicationId: string): Promise<{ message: string; data: Application }> {
    try {
      const response = await api.post(`/application/acceptApplication/${applicationId}`, {});
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Akzeptieren der Bewerbung:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Akzeptieren der Bewerbung');
    }
  }

  /**
   * Bewerbung ablehnen (ADMIN)
   */
  async rejectApplication(applicationId: string, reason: string): Promise<{ message: string; data: Application }> {
    try {
      const rejectionData: RejectionDto = { reason };
      const response = await api.patch(`/application/rejectApplication/${applicationId}`, rejectionData);
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Ablehnen der Bewerbung:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Ablehnen der Bewerbung');
    }
  }

  /**
   * Benutzer für weitere Bewerbungen sperren (ADMIN)
   */
  async blockUserFromApplications(userId: string, reason: string): Promise<{ message: string; data: any }> {
    try {
      const response = await api.patch(`/application/blockUser/${userId}`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Sperren des Benutzers:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Sperren des Benutzers');
    }
  }

  /**
   * Sperre für Bewerbungen aufheben (ADMIN)
   */
  async unblockUserFromApplications(userId: string): Promise<{ message: string; data: any }> {
    try {
      const response = await api.patch(`/application/unblockUser/${userId}`, {});
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Entsperren des Benutzers:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Entsperren des Benutzers');
    }
  }

  /**
   * Cleanup verwaiste Bewerbungen (ADMIN)
   */
  async cleanupApplications(): Promise<{ message: string; deletions: number }> {
    try {
      const response = await api.get('/application/cleanUp');
      return response.data;
    } catch (error: any) {
      console.error('Fehler beim Aufräumen der Bewerbungen:', error);
      throw new Error(error.response?.data?.message || 'Fehler beim Aufräumen der Bewerbungen');
    }
  }

  // ========================================
  // ERWEITERTE HILFSMETHODEN
  // ========================================

  /**
   * Status-Label für deutsche Anzeige (erweitert)
   */
  getStatusLabel(status: ApplicationStatus): string {
    switch (status) {
      case 'PENDING': return 'Ausstehend';
      case 'IN_PROGRESS': return 'In Bearbeitung';
      case 'ACCEPTED': return 'Akzeptiert';
      case 'REJECTED': return 'Abgelehnt';
      case 'CANCELED': return 'Storniert';
      default: return 'Unbekannt';
    }
  }

  /**
   * Status-CSS-Klasse für Styling (neu)
   */
  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELED': return 'status-canceled';
      default: return 'status-unknown';
    }
  }

  /**
   * Dokumenttyp-Label für deutsche Anzeige (neu)
   */
  getDocumentTypeLabel(type: ApplicationDocType): string {
    switch (type) {
      case 'RESUME': return 'Lebenslauf/Textprobe';
      case 'CERTIFICATION': return 'Zertifizierung';
      case 'COVER_LETTER': return 'Anschreiben';
      case 'OTHER': return 'Sonstiges';
      default: return 'Unbekannt';
    }
  }

  /**
   * Hilfsmethode: Validiert Datei-Größe und -Typ (BESTEHEND - unverändert)
   */
  validateFile(file: File, maxSizeMB: number, allowedTypes: string[]): string | null {
    // Größe prüfen
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Datei ist zu groß. Maximum: ${maxSizeMB}MB`;
    }

    // Dateityp prüfen
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `Ungültiger Dateityp. Erlaubt: ${allowedTypes.join(', ')}`;
    }

    return null; // Keine Fehler
  }

  /**
   * Hilfsmethode: Validiert alle Dateien (BESTEHEND - unverändert)
   */
  validateFiles(files: ApplicationFiles): string[] {
    const errors: string[] = [];

    if (files.coverLetter) {
      const error = this.validateFile(files.coverLetter, 5, ['pdf', 'doc', 'docx']);
      if (error) errors.push(`Anschreiben: ${error}`);
    }

    if (files.certification) {
      const error = this.validateFile(files.certification, 10, ['pdf', 'jpg', 'jpeg', 'png']);
      if (error) errors.push(`Zertifizierung: ${error}`);
    }

    if (files.writingSample) {
      const error = this.validateFile(files.writingSample, 5, ['pdf', 'doc', 'docx']);
      if (error) errors.push(`Textprobe: ${error}`);
    }

    return errors;
  }

  /**
   * Hilfsmethode: Status-Text übersetzen (BESTEHEND - alias für Kompatibilität)
   */
  getStatusText(status: ApplicationItem['status']): string {
    return this.getStatusLabel(status as ApplicationStatus);
  }

  /**
   * Hilfsmethode: Status-Farbe für UI (BESTEHEND - erweitert)
   */
  getStatusColor(status: ApplicationItem['status'] | ApplicationStatus): string {
    const colorMap = {
      'PENDING': 'orange',
      'IN_PROGRESS': 'blue',
      'ACCEPTED': 'green', 
      'REJECTED': 'red',
      'CANCELED': 'gray'
    };

    return colorMap[status] || 'gray';
  }
}

// Singleton exportieren (unverändert)
export const applicationService = new ApplicationService();

// Default Export für Admin-Komponenten
export default applicationService;