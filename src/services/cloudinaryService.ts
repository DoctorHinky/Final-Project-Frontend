// src/services/cloudinaryService.ts

/**
 * Service für die Interaktion mit Cloudinary API
 */

// Cloudinary-Konfiguration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'IHRE_CLOUD_NAME';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Hochladen einer Datei zu Cloudinary
 * @param file - Die hochzuladende Datei
 * @param folder - Zielordner in Cloudinary
 * @param username - Benutzername für die Benennung des Assets
 * @returns Ein Promise mit den Upload-Ergebnissen
 */
export const cloudinaryUpload = async (
  file: File,
  folder = 'profile_avatars',
  username?: string
): Promise<{ publicId: string; secureUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('api_key', CLOUDINARY_API_KEY || '');
    formData.append('folder', folder);
    
    // Optimierungen für Bilder
    formData.append('transformation', 'q_auto,f_auto'); // Auto-Qualität und Format
    
    // Wenn ein Benutzername vorhanden ist, verwenden wir ihn für den öffentlichen ID
    if (username) {
      // Erstellen einer eindeutigen ID basierend auf Benutzername und Zeitstempel
      const uniqueFilename = `user_${username}_${Date.now()}`;
      formData.append('public_id', uniqueFilename);
    }

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary-Upload fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
    };
  } catch (error) {
    console.error('Fehler beim Hochladen zu Cloudinary:', error);
    throw error;
  }
};

/**
 * Löschen eines Assets aus Cloudinary
 * @param publicId - Die öffentliche ID des zu löschenden Assets
 * @returns Ein Promise mit dem Löschergebnis
 */
export const cloudinaryDelete = async (publicId: string): Promise<boolean> => {
  try {
    // Hier müsste in einer realen Implementierung ein Aufruf an das Backend erfolgen,
    // da die Cloudinary-API für Löschoperationen Authentifizierung mit einem signierten
    // API-Secret erfordert, das nicht im Frontend gespeichert werden sollte.
    
    // Beispiel für einen Backend-Endpunkt
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Cloudinary-Löschung fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Fehler beim Löschen von Cloudinary:', error);
    throw error;
  }
};

/**
 * Generiert eine Cloudinary-URL mit Transformationsparametern
 * @param publicId - Die öffentliche ID des Assets
 * @param options - Transformationsoptionen
 * @returns Die transformierte URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}
): string => {
  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};