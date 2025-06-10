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
 * Transformation-Optionen für Cloudinary
 */
export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'pad' | 'limit' | 'mfit' | 'mpad';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  effects?: string[];
  fetch_format?: 'auto';
}

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
  options: CloudinaryOptions = {}
): string => {
  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
    effects = [],
    fetch_format = 'auto'
  } = options;

  // Basis-Transformationen
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`,
    `fetch_format_${fetch_format}`
  ];

  // Zusätzliche Effekte hinzufügen
  if (effects.length > 0) {
    transformations.push(...effects);
  }

  const transformationString = transformations.join(',');
 
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
};

/**
 * Vordefinierte Presets für verschiedene Anwendungsfälle
 */
export const CloudinaryPresets = {
  // Artikel-Thumbnails (Grid-Ansicht)
  articleThumbnail: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 340,
    height: 240,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto'
  }),

  // Artikel-Thumbnails (Listen-Ansicht)
  articleListThumbnail: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 160,
    height: 120,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto'
  }),

  // Profile-Avatare
  profileAvatar: (publicId: string, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = { small: 40, medium: 80, large: 150 };
    return getCloudinaryUrl(publicId, {
      width: sizes[size],
      height: sizes[size],
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
      gravity: 'face'
    });
  },

  // Hero-Bilder
  heroImage: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 1200,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'auto'
  }),

  // Responsive Bilder für verschiedene Bildschirmgrößen
  responsive: {
    mobile: (publicId: string) => getCloudinaryUrl(publicId, {
      width: 350,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),
    tablet: (publicId: string) => getCloudinaryUrl(publicId, {
      width: 500,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),
    desktop: (publicId: string) => getCloudinaryUrl(publicId, {
      width: 800,
      height: 450,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    })
  }
};

/**
 * Hilfsfunktion: Bestimmt die optimale Bildgröße basierend auf Kontext
 * @param publicId - Cloudinary Public ID
 * @param context - Verwendungskontext
 * @returns Optimierte Cloudinary URL
 */
export const getOptimizedImageUrl = (
  publicId: string | null,
  fallbackUrl: string | null,
  context: 'article-grid' | 'article-list' | 'hero' | 'avatar' = 'article-grid'
): string | null => {
  // Wenn keine publicId verfügbar, Fallback-URL verwenden
  if (!publicId) {
    return fallbackUrl;
  }

  // Kontext-spezifische Optimierung
  switch (context) {
    case 'article-grid':
      return CloudinaryPresets.articleThumbnail(publicId);
    case 'article-list':
      return CloudinaryPresets.articleListThumbnail(publicId);
    case 'hero':
      return CloudinaryPresets.heroImage(publicId);
    case 'avatar':
      return CloudinaryPresets.profileAvatar(publicId);
    default:
      return CloudinaryPresets.articleThumbnail(publicId);
  }
};

/**
 * URL-Validator für Cloudinary-URLs
 * @param url - URL zum Validieren
 * @returns Boolean ob URL eine gültige Cloudinary-URL ist
 */
export const isCloudinaryUrl = (url: string): boolean => {
  const cloudinaryPattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/`
  );
  return cloudinaryPattern.test(url);
};

/**
 * Extrahiert die Public ID aus einer Cloudinary-URL
 * @param url - Cloudinary URL
 * @returns Public ID oder null
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;
  
  const match = url.match(/\/v\d+\/(.+)$/);
  if (match && match[1]) {
    // Entfernt Dateiendung falls vorhanden
    return match[1].replace(/\.[^/.]+$/, '');
  }
  
  return null;
};

/**
 * Error-Handler für Bilder mit automatischem Fallback
 * @param event - Image Error Event
 * @param fallbackUrl - Alternative URL oder null für Placeholder
 */
export const handleImageError = (
  event: Event,
  fallbackUrl?: string | null
): void => {
  const img = event.target as HTMLImageElement;
  
  console.warn('Cloudinary Bild-Fehler:', img.src);
  
  if (fallbackUrl) {
    img.src = fallbackUrl;
  } else {
    // Verstecke Bild und zeige Placeholder
    img.style.display = 'none';
    const container = img.closest('.article-image, .list-item-image');
    if (container) {
      const placeholder = container.querySelector('.image-placeholder') as HTMLElement;
      if (placeholder) {
        placeholder.style.display = 'flex';
      }
    }
  }
};

export default {
  upload: cloudinaryUpload,
  delete: cloudinaryDelete,
  getUrl: getCloudinaryUrl,
  presets: CloudinaryPresets,
  getOptimized: getOptimizedImageUrl,
  isValidUrl: isCloudinaryUrl,
  extractPublicId: extractPublicIdFromUrl,
  handleError: handleImageError
};