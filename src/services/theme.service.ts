// src/services/theme.service.ts
import { ref, computed, watch } from 'vue';

interface ThemeSettings {
  theme: 'light' | 'dark';
  fontSize: number;
}

class ThemeService {
  private isDarkMode = ref(localStorage.getItem('theme') === 'dark');
  private fontSize = ref(Number(localStorage.getItem('fontSize')) || 3);

  constructor() {
    // Theme und Schriftgröße beim Start anwenden
    this.applyTheme();
    this.applyFontSize();
    
    // Bei Änderungen automatisch anwenden
    watch(this.isDarkMode, () => {
      this.applyTheme();
      this.saveTheme();
    });

    watch(this.fontSize, () => {
      this.applyFontSize();
      this.saveFontSize();
    });
  }

  // Getter für Light Theme
  get isLightTheme() {
    return computed(() => !this.isDarkMode.value);
  }

  // Getter für Dark Theme
  get isDarkTheme() {
    return computed(() => this.isDarkMode.value);
  }

  // Getter für aktuelle Schriftgröße
  get currentFontSize() {
    return computed(() => this.fontSize.value);
  }

  // Getter für aktuelles Theme
  get currentTheme() {
    return computed(() => this.isDarkMode.value ? 'dark' : 'light');
  }

  // Theme umschalten
  toggleTheme() {
    this.isDarkMode.value = !this.isDarkMode.value;
  }

  // Theme explizit setzen
  setTheme(isDark: boolean) {
    this.isDarkMode.value = isDark;
  }

  // Theme mit String setzen ('light' oder 'dark')
  setThemeByName(theme: 'light' | 'dark') {
    this.isDarkMode.value = theme === 'dark';
  }

  // Schriftgröße setzen (1-5)
  setFontSize(size: number) {
    if (size >= 1 && size <= 5) {
      this.fontSize.value = size;
    }
  }

  // Komplette Appearance-Settings setzen
  setAppearanceSettings(settings: ThemeSettings) {
    this.setThemeByName(settings.theme);
    this.setFontSize(settings.fontSize);
  }

  // Aktuelle Settings abrufen
  getAppearanceSettings(): ThemeSettings {
    return {
      theme: this.currentTheme.value as 'light' | 'dark',
      fontSize: this.currentFontSize.value
    };
  }

  // Theme auf HTML-Element anwenden
  private applyTheme() {
    const html = document.documentElement;
    const body = document.body;
    
    // Alte Klassen entfernen
    html.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    // Neue Klassen hinzufügen
    const themeClass = this.isDarkMode.value ? 'theme-dark' : 'theme-light';
    html.classList.add(themeClass);
    body.classList.add(themeClass);
  }

  // Schriftgröße auf Body anwenden
  private applyFontSize() {
    const body = document.body;
    
    // Alle font-size Klassen entfernen
    for (let i = 1; i <= 5; i++) {
      body.classList.remove(`font-size-${i}`);
    }
    
    // Aktuelle font-size Klasse hinzufügen
    body.classList.add(`font-size-${this.fontSize.value}`);
  }

  // Theme in localStorage speichern
  private saveTheme() {
    localStorage.setItem('theme', this.isDarkMode.value ? 'dark' : 'light');
  }

  // Schriftgröße in localStorage speichern
  private saveFontSize() {
    localStorage.setItem('fontSize', this.fontSize.value.toString());
  }

  // Settings zurücksetzen
  resetToDefaults() {
    this.setTheme(false); // Light Theme
    this.setFontSize(3); // Mittlere Schriftgröße
  }
}

// Singleton-Instanz exportieren
export const themeService = new ThemeService();