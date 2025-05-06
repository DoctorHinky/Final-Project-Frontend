<template>
  <div class="login-register-page" :class="{ 'theme-light': isLightTheme, 'theme-dark': !isLightTheme }">
    <div class="container">
      <div class="auth-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'login' }" 
            @click="activeTab = 'login'"
          >
            Anmelden
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'register' }" 
            @click="activeTab = 'register'"
          >
            Registrieren
          </button>
        </div>
        
        <!-- Login Formular -->
        <div class="form-container" v-if="activeTab === 'login'">
          <h2>Willkommen zurück!</h2>
          <p>Melde dich an, um auf dein persönliches Profil zuzugreifen.</p>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="login-email">E-Mail</label>
              <input 
                type="email" 
                id="login-email" 
                v-model="loginForm.email" 
                placeholder="deine@email.de" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="login-password">Passwort</label>
              <input 
                type="password" 
                id="login-password" 
                v-model="loginForm.password" 
                placeholder="Dein Passwort" 
                required
              />
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="loginForm.rememberMe" />
                Angemeldet bleiben
              </label>
              
              <a href="#" class="forgot-password">Passwort vergessen?</a>
            </div>
            
            
            <button type="submit" class="submit-button">Anmelden</button>
          </form>
        </div>
        
        <!-- Register Formular -->
        <div class="form-container" v-if="activeTab === 'register'">
          <h2>Werde Teil unserer Community</h2>
          <p>Erstelle ein Konto, um alle Funktionen nutzen zu können.</p>
          
            <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="register-first-name">Vorname</label>
              <input 
              type="text" 
              id="register-first-name" 
              v-model="registerForm.firstName" 
              placeholder="Vorname" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-last-name">Nachname</label>
              <input 
              type="text" 
              id="register-last-name" 
              v-model="registerForm.lastName" 
              placeholder="Nachname" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-username">Benutzername</label>
              <input 
              type="text" 
              id="register-username" 
              v-model="registerForm.username" 
              placeholder="Benutzername" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-role">Rolle</label>
              <select 
              id="register-role" 
              v-model="registerForm.role" 
              required
              >
              <option value="" disabled>Wähle eine Rolle</option>
              <option value="parent">Eltern</option>
              <option value="child">Kind</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="register-dob">Geburtsdatum</label>
              <input 
              type="date" 
              id="register-dob" 
              v-model="registerForm.dob" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-phone">Telefon</label>
              <input 
              type="tel" 
              id="register-phone" 
              v-model="registerForm.phone" 
              placeholder="Telefonnummer" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-email">E-Mail</label>
              <input 
              type="email" 
              id="register-email" 
              v-model="registerForm.email" 
              placeholder="deine@email.de" 
              required
              />
            </div>
            
            <div class="form-group">
              <label for="register-password">Passwort</label>
              <input 
              type="password" 
              id="register-password" 
              v-model="registerForm.password" 
              placeholder="Erstelle ein sicheres Passwort" 
              required
              />
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="registerForm.agreeTerms" required />
                <span class="checkmark"></span>
                Ich stimme den <a href="#">Nutzungsbedingungen</a> zu
              </label>
            </div>
            
            <button type="submit" class="submit-button">Konto erstellen</button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Theme-Toggle -->
    <div class="theme-toggle-container">
      <button id="themeToggle" title="Theme wechseln" @click="toggleTheme">
        <span class="dark-icon" v-if="isLightTheme">🌙</span>
        <span class="light-icon" v-else>☀️</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';

export default defineComponent({
  name: 'LoginRegister',
  setup() {
    const isLightTheme = ref(localStorage.getItem('theme') === 'light');
    const activeTab = ref('login');
    
    const loginForm = reactive({
      email: '',
      password: '',
      rememberMe: false
    });
    
    const registerForm = reactive({
      name: '',
      email: '',
      password: '',
      agreeTerms: false
    });
    
    const handleLogin = () => {
      console.log('Login mit:', loginForm);
      alert('Login-Funktion ist aktuell nur ein Platzhalter.');
    };
    
    const handleRegister = () => {
      console.log('Registrierung mit:', registerForm);
      alert('Registrierungs-Funktion ist aktuell nur ein Platzhalter.');
    };
    
    const toggleTheme = () => {
      isLightTheme.value = !isLightTheme.value;
      localStorage.setItem('theme', isLightTheme.value ? 'light' : 'dark');
    };
    
    return {
      isLightTheme,
      activeTab,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      toggleTheme
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.login-register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  position: relative;
  z-index: 100;
  
  &.theme-light {
    background-color: mixins.theme-color('light', primary-bg);
    color: mixins.theme-color('light', text-primary);
  }
  
  &.theme-dark {
    background-color: mixins.theme-color('dark', primary-bg);
  }
  
  .auth-container {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    
    background-color: mixins.theme-color('light', card-bg);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    border: 2px solid mixins.theme-color('light', border-medium);
    @include mixins.shadow('medium', 'light');
    overflow: hidden;
  }
  
  .tabs {
    display: flex;
    width: 100%;
    
    .tab {
      flex: 1;
      padding: map.get(vars.$spacing, m) 0;
      text-align: center;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      cursor: pointer;
      border: none;
      transition: all map.get(vars.$transitions, default);
      position: relative;
      overflow: hidden;
      
      background-color: mixins.theme-color('light', nav-item-bg);
      color: mixins.theme-color('light', text-primary);
      
      &.active {
        background: mixins.theme-gradient('light', nav-active);
        color: white;
      }
    }
  }
  
  .form-container {
    padding: map.get(vars.$spacing, xl);
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, xl);
    }
    
    .form-group {
      margin-bottom: map.get(vars.$spacing, l);
      
      label {
        display: block;
        margin-bottom: map.get(vars.$spacing, xs);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
      }
      
      input {
        width: 100%;
        padding: map.get(vars.$spacing, s);
        border: 1px solid mixins.theme-color('light', border-light);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      }
    }
    
    .submit-button {
      margin-top: 50px;
      width: 100%;
      padding: map.get(vars.$spacing, m);
      background: mixins.theme-gradient('light', primary);
      color: white;
      border: none;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
    }
  }
  
  .theme-toggle-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    
    button {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: mixins.theme-color('light', secondary-bg);
      box-shadow: 0 3px 10px mixins.theme-color('light', shadow-color);
    }
  }
}
</style>
