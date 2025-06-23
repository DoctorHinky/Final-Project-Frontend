// src/services/user.service.ts
import api from "./axiosInstance";
import type { User } from "@/types/dtos/User.types";

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  shortDescription?: string;
  profilePicture?: string | null;
}

export interface PasswordUpdateData {
  password: string;
  newPassword: string;
}

export interface ProfileImageUploadResponse {
  url: string;
  message: string;
}

export interface CloudinaryUploadResponse {
  message: string;
  url: string;
}

export const userService = {
  // Benutzerdaten abrufen
  async getCurrentUser(): Promise<User> {
    const response = await api.get("/user/getMe");
    return response.data;
  },

  // Benutzerdaten aktualisieren
  async updateUser(userData: UserUpdateData): Promise<User> {
    const response = await api.patch("/user/updateMe", userData);
    return response.data;
  },

  // Passwort ändern
  async updatePassword(passwordData: PasswordUpdateData): Promise<void> {
    await api.patch("/user/updatePassword", passwordData);
  },

  // Konto deaktivieren
  async deactivateAccount(password: string): Promise<void> {
    await api.patch("/user/deactivateMyAccount", { password });
  },

  // Konto reaktivieren
  async reactivateAccount(password: string): Promise<void> {
    await api.patch("/user/reactivateMyAccount", { password });
  },

  // Konto löschen
  async deleteAccount(password: string, deleteReason?: string): Promise<void> {
    const requestBody: any = { password };
    if (deleteReason && deleteReason.trim().length >= 8) {
      requestBody.deleteReason = deleteReason.trim();
    }
    await api.patch("/user/deleteMyAccount", requestBody);
  },

  // === PROFILBILD-FUNKTIONEN ===

  /**
   * Profilbild zu Cloudinary hochladen (über Backend)
   * @param file - Die Bild-Datei
   * @returns Upload-Response mit URL und Public-ID
   */
  async uploadProfileImageToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
    // Datei-Validierung
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append("file", file); // Backend erwartet 'file' als field name

    const response = await api.post("/cloud", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend-Response anpassen
    return {
      message: response.data.message || "Upload erfolgreich",
      url: response.data.url,
    };
  },

  /**
   * Profilbild aus Data-URL zu Cloudinary hochladen (über Backend)
   * @param dataUrl - Data-URL des Bildes (z.B. von ImageUploader)
   * @returns Upload-Response mit URL und Public-ID
   */
  async uploadProfileImageFromDataUrl(dataUrl: string): Promise<CloudinaryUploadResponse> {
    // Data-URL zu Blob konvertieren
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Blob zu File konvertieren für bessere Kompatibilität
    const file = new File([blob], "profile-image.jpg", {
      type: blob.type || "image/jpeg",
      lastModified: Date.now(),
    });

    // Validierung
    this.validateImageFile(file);

    const formData = new FormData();
    formData.append("file", file); // Backend erwartet 'file' als field name

    const uploadResponse = await api.post("/cloud", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend-Response anpassen
    return {
      message: uploadResponse.data.message || "Upload erfolgreich",
      url: uploadResponse.data.url,
    };
  },

  /**
   * Profilbild in der Datenbank aktualisieren
   * @param profilePicture - URL des neuen Profilbilds
   * @param publicId - Public-ID für Cloudinary (optional)
   * @returns Aktualisierte Benutzerdaten
   */
  async updateProfileImage(profilePicture: string): Promise<User> {
    const updateData: UserUpdateData = {
      profilePicture,
    };

    return this.updateUser(updateData);
  },

  /**
   * Kompletter Profilbild-Upload-Workflow
   * @param file - Die Bild-Datei
   * @returns Aktualisierte Benutzerdaten mit neuem Profilbild
   */
  async uploadAndSetProfileImage(file: File): Promise<User> {
    try {
      // 1. Bild zu Cloudinary hochladen
      const uploadResponse = await this.uploadProfileImageToCloudinary(file);

      // 2. Profilbild in der Datenbank aktualisieren
      const updatedUser = await this.updateProfileImage(uploadResponse.url);

      // 3. Event für andere Komponenten triggern
      this.triggerProfileUpdateEvent();

      return updatedUser;
    } catch (error) {
      console.error("Fehler beim Profilbild-Upload:", error);
      throw error;
    }
  },

  /**
   * Kompletter Profilbild-Upload-Workflow aus Data-URL
   * @param dataUrl - Data-URL des Bildes
   * @returns Aktualisierte Benutzerdaten mit neuem Profilbild
   */
  async uploadAndSetProfileImageFromDataUrl(dataUrl: string): Promise<User> {
    try {
      // 1. Data-URL zu Cloudinary hochladen
      const uploadResponse = await this.uploadProfileImageFromDataUrl(dataUrl);

      // 2. Profilbild in der Datenbank aktualisieren
      const updatedUser = await this.updateProfileImage(uploadResponse.url);

      // 3. Event für andere Komponenten triggern
      this.triggerProfileUpdateEvent();

      return updatedUser;
    } catch (error) {
      console.error("Fehler beim Profilbild-Upload aus Data-URL:", error);
      throw error;
    }
  },

  /**
   * Event triggern für Profilbild-Updates (für andere Komponenten)
   */
  triggerProfileUpdateEvent(): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("profile-updated"));
    }
  },

  // === HILFSFUNKTIONEN ===

  /**
   * Validiert ob eine Datei ein gültiges Bild ist
   * @param file - Die zu prüfende Datei
   * @returns true wenn gültiges Bild
   * @throws Error bei ungültiger Datei
   */
  validateImageFile(file: File): boolean {
    if (!file) {
      throw new Error("Keine Datei ausgewählt.");
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Ungültiger Dateityp. Nur JPG, PNG und WebP sind erlaubt.");
    }

    if (file.size > maxSize) {
      throw new Error("Datei ist zu groß. Maximum 5MB erlaubt.");
    }

    if (file.size === 0) {
      throw new Error("Datei ist leer.");
    }

    return true;
  },

  /**
   * Prüft ob ein Benutzer ein benutzerdefiniertes Profilbild hat
   * @param user - Benutzer-Objekt
   * @returns true wenn benutzerdefiniertes Bild vorhanden
   */
  hasCustomProfileImage(user: User): boolean {
    return !!(
      user.profilePicture &&
      user.profilePicture !== "/src/assets/images/AvatarIcon1.webp" &&
      !user.profilePicture.includes("AvatarIcon")
    );
  },

  /**
   * Generiert eine Fallback-URL für Profilbilder
   * @returns Fallback-URL
   */
  getProfileImageFallback(): string {
    // Könnte später durch einen Gravatar oder Initials-Generator ersetzt werden
    return "/src/assets/images/AvatarIcon1.webp";
  },
};

export default userService;
