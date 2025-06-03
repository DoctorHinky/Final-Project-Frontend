// src/services/theme.service.ts
import { ref, computed, watch } from 'vue';

class ThemeService {
  private isDarkMode = ref(localStorage.getItem('theme') === 'dark');
  
  constructor() {
    // Theme beim Start auf das HTML-Element anwenden
    this.applyTheme();
    
    // Bei Änderungen automatisch anwenden
    watch(this.isDarkMode, () => {
      this.applyTheme();
      this.saveTheme();
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
  
  // Theme umschalten
  toggleTheme() {
    this.isDarkMode.value = !this.isDarkMode.value;
  }
  
  // Theme explizit setzen
  setTheme(isDark: boolean) {
    this.isDarkMode.value = isDark;
  }
  
  // Theme auf HTML-Element anwenden
  private applyTheme() {
    const html = document.documentElement;
    const body = document.body;
    
    if (this.isDarkMode.value) {
      html.classList.remove('theme-light');
      html.classList.add('theme-dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    } else {
      html.classList.remove('theme-dark');
      html.classList.add('theme-light');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    }
  }
  
  // Theme in localStorage speichern
  private saveTheme() {
    localStorage.setItem('theme', this.isDarkMode.value ? 'dark' : 'light');
  }
}

// Singleton-Instanz exportieren
export const themeService = new ThemeService();