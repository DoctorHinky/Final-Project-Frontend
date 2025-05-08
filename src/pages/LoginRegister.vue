<!-- src/pages/LoginRegister.vue -->
<template>
  <div class="login-register-page">
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
          
          <div v-if="loginStatus.message" :class="['status-message', loginStatus.success ? 'success' : 'error']">
            {{ loginStatus.message }}
          </div>
          
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
              <div class="hint-text">Testlogin: test@example.com</div>
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
              <div class="hint-text">Testpasswort: password123</div>
            </div>
            
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="loginForm.rememberMe" />
                Angemeldet bleiben
              </label>
              
              <a href="#" class="forgot-password">Passwort vergessen?</a>
            </div>
            
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading">Wird angemeldet...</span>
              <span v-else>Anmelden</span>
            </button>
          </form>
        </div>
        
        <!-- Register Formular -->
        <div class="form-container" v-if="activeTab === 'register'">
          <h2>Werde Teil unserer Community</h2>
          <p>Erstelle ein Konto, um alle Funktionen nutzen zu können.</p>
          
          <div v-if="registerStatus.message" :class="['status-message', registerStatus.success ? 'success' : 'error']">
            {{ registerStatus.message }}
          </div>
          
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
              <div class="custom-dropdown">
                <div class="dropdown-selected" @click="toggleDropdown" :class="{ 'active': isOpen }" tabindex="0"
                  @keydown.enter="toggleDropdown" @keydown.space="toggleDropdown" @keydown.up="navigateOptions(-1)"
                  @keydown.down="navigateOptions(1)" @keydown.esc="closeDropdown">
                  <span>{{ selectedOption.text }}</span>
                  <span class="dropdown-arrow">▼</span>
                </div>

                <div class="dropdown-options" :class="{ 'show': isOpen }">
                  <div v-for="(option, index) in roleOptions" :key="option.value" class="dropdown-option"
                    :class="{ 'selected': option.value === selectedOption.value }" @click="selectOption(option)"
                    tabindex="0" @keydown.enter="selectOption(option)" :data-index="index">
                    {{ option.text }}
                  </div>
                </div>

                <!-- Hidden input for form submission -->
                <input type="hidden" id="register-role" name="role" v-model="registerForm.role">
              </div>
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
                <span>Ich stimme den <a href="#" class="terms-link">Nutzungsbedingungen</a> zu</span>
              </label>
            </div>
            
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading">Wird registriert...</span>
              <span v-else>Konto erstellen</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/auth.service';

export default defineComponent({
  name: 'LoginRegister',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const activeTab = ref('login');
    const isLoading = ref(false);
    
    // Status-Meldungen
    const loginStatus = reactive({
      success: false,
      message: ''
    });
    
    const registerStatus = reactive({
      success: false,
      message: ''
    });
    
    // Login-Formular
    const loginForm = reactive({
      email: '',
      password: '',
      rememberMe: false
    });
    
    // Anmeldung verarbeiten
    const handleLogin = async () => {
      isLoading.value = true;
      loginStatus.message = '';
      
      try {
        const result = await authService.login(loginForm.email, loginForm.password);
        
        if (result.success) {
          loginStatus.success = true;
          loginStatus.message = 'Anmeldung erfolgreich! Du wirst weitergeleitet...';
          
          // Nach kurzer Verzögerung weiterleiten
          setTimeout(() => {
            // Prüfen, ob es eine Redirect-URL gibt
            const redirectPath = route.query.redirect as string || '/member/dashboard';
            router.push(redirectPath);
          }, 1000);
        } else {
          loginStatus.success = false;
          loginStatus.message = result.message || 'Anmeldung fehlgeschlagen. Bitte überprüfe deine Eingaben.';
        }
      } catch (error) {
        loginStatus.success = false;
        loginStatus.message = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
        console.error('Login error:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Register-Formular
    const registerForm = reactive({
      firstName: '',
      lastName: '',
      username: '',
      role: '',
      dob: '',
      phone: '',
      email: '',
      password: '',
      agreeTerms: false
    });
    
    // Registrierung verarbeiten
    const handleRegister = async () => {
      isLoading.value = true;
      registerStatus.message = '';
      
      try {
        // Dummy-Registrierung (später durch echte API ersetzen)
        setTimeout(() => {
          registerStatus.success = true;
          registerStatus.message = 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.';
          
          // Tab zur Anmeldung wechseln
          setTimeout(() => {
            activeTab.value = 'login';
            
            // Anmeldedaten vorausfüllen
            loginForm.email = registerForm.email;
            
            // Formular zurücksetzen
            registerForm.firstName = '';
            registerForm.lastName = '';
            registerForm.username = '';
            registerForm.role = '';
            registerForm.dob = '';
            registerForm.phone = '';
            registerForm.email = '';
            registerForm.password = '';
            registerForm.agreeTerms = false;
            
            isLoading.value = false;
          }, 1500);
        }, 1000);
      } catch (error) {
        registerStatus.success = false;
        registerStatus.message = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
        console.error('Register error:', error);
        isLoading.value = false;
      }
    };
    
    // Dropdown-Funktionalität
    const isOpen = ref(false);
    
    const roleOptions = [
      { value: '', text: 'Wähle eine Rolle' },
      { value: 'parent', text: 'Eltern' },
      { value: 'child', text: 'Kind' }
    ];
    
    const selectedOption = ref(roleOptions[0]);
    
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };
    
    const closeDropdown = () => {
      isOpen.value = false;
    };
    
    const selectOption = (option: { value: string; text: string }) => {
      selectedOption.value = option;
      registerForm.role = option.value;
      closeDropdown();
    };
    
    const navigateOptions = (direction: number) => {
      if (!isOpen.value) {
        isOpen.value = true;
        return;
      }
    
      const currentIndex = roleOptions.findIndex(option => option.value === selectedOption.value.value);
      let newIndex = currentIndex + direction;
    
      if (newIndex < 0) {
        newIndex = roleOptions.length - 1;
      } else if (newIndex >= roleOptions.length) {
        newIndex = 0;
      }
    
      // Nur fokussieren, nicht auswählen
      const optionElements = document.querySelectorAll('.dropdown-option');
      if (optionElements[newIndex]) {
        (optionElements[newIndex] as HTMLElement).focus();
      }
    };
    
    // Klick außerhalb schließt Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.custom-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && isOpen.value) {
        closeDropdown();
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      
      // Prüfen, ob bereits angemeldet
      if (authService.isLoggedIn()) {
        // Falls bereits angemeldet, zur geschützten Seite weiterleiten
        router.push('/member/dashboard');
      }
      
      // Bei Redirect-Parameter den Login-Tab aktivieren
      if (route.query.redirect) {
        activeTab.value = 'login';
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    return {
      activeTab,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      isLoading,
      loginStatus,
      registerStatus,
      // Dropdown-Funktionalität
      isOpen,
      roleOptions,
      selectedOption,
      toggleDropdown,
      closeDropdown,
      selectOption,
      navigateOptions
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
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: map.get(vars.$spacing, xl) 0;
  position: relative;
  z-index: 100;
  
  .auth-container {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border-radius: map.get(map.get(vars.$layout, border-radius), large);
        border: 2px solid mixins.theme-color($theme, border-medium);
        @include mixins.shadow('medium', $theme);
        overflow: hidden;
      }
    }
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
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, nav-item-bg);
          color: mixins.theme-color($theme, text-primary);
          
          &.active {
            background: mixins.theme-gradient($theme, nav-active);
            color: white;
          }
        }
      }
    }
  }
  
  .form-container {
    padding: map.get(vars.$spacing, xl);
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, l);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
    
    // Status-Meldungen
    .status-message {
      padding: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      margin-bottom: map.get(vars.$spacing, l);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      
      &.success {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(mixins.theme-color($theme, accent-green), 0.15);
            color: mixins.theme-color($theme, accent-green);
            border: 1px solid rgba(mixins.theme-color($theme, accent-green), 0.3);
          }
        }
      }
      
      &.error {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: rgba(255, 100, 100, 0.15);
            color: #ff6464;
            border: 1px solid rgba(255, 100, 100, 0.3);
          }
        }
      }
    }
    
    .form-group {
      margin-bottom: map.get(vars.$spacing, l);
      
      label {
        display: block;
        margin-bottom: map.get(vars.$spacing, xs);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      input, select {
        width: 100%;
        padding: map.get(vars.$spacing, s);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border: 1px solid mixins.theme-color($theme, border-light);
            border-radius: map.get(map.get(vars.$layout, border-radius), medium);
            background-color: mixins.theme-color($theme, secondary-bg);
            color: mixins.theme-color($theme, text-primary);
            
            &::placeholder {
              color: mixins.theme-color($theme, text-tertiary);
            }
            
            &:focus {
              outline: none;
              border-color: mixins.theme-color($theme, accent-teal);
              box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.3);
            }
          }
        }
      }
      
      // Benutzerdefiniertes Dropdown-Menü
      .custom-dropdown {
        position: relative;
        width: 100%;
        font-family: map.get(vars.$fonts, primary);

        // Ausgewähltes Element
        .dropdown-selected {
          width: 100%;
          padding: 0.9rem 1.2rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          border-radius: map.get(map.get(vars.$layout, border-radius), medium);
          outline: none;
          font-size: map.get(map.get(vars.$fonts, sizes), base);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @if $theme =='dark' {
                background-color: rgba(15, 36, 25, 0.8);
              }
              @else {
                background-color: rgba(255, 255, 255, 0.7);
              }

              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-medium);
              transition: all map.get(vars.$transitions, default);

              &:hover,
              &:focus {
                border-color: mixins.theme-color($theme, accent-teal);
                box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.2);
              }

              &.active {
                border-color: mixins.theme-color($theme, accent-teal);
                box-shadow: 0 0 0 2px rgba(mixins.theme-color($theme, accent-teal), 0.2);
              }
            }
          }

          // Pfeil-Icon
          .dropdown-arrow {
            font-size: 0.8rem;
            transition: transform 0.2s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }

          &.active .dropdown-arrow {
            transform: rotate(180deg);
          }
        }

        // Optionen-Dropdown
        .dropdown-options {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
          max-height: 250px;
          overflow-y: auto;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, card-bg);
              border: 1px solid mixins.theme-color($theme, border-light);
              border-radius: map.get(map.get(vars.$layout, border-radius), medium);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
          }

          &.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          // Einzelne Option
          .dropdown-option {
            padding: 12px 16px;
            cursor: pointer;
            outline: none;
            font-size: map.get(map.get(vars.$fonts, sizes), base);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.2);

                &:hover,
                &:focus {
                  background-color: mixins.theme-color($theme, hover-color);
                }

                &.selected {
                  font-weight: map.get(map.get(vars.$fonts, weights), bold);
                  background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                }

                &:last-child {
                  border-bottom: none;
                }
              }
            }
          }
        }
      }
      
      // Hints für Testdaten
      .hint-text {
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        margin-top: map.get(vars.$spacing, xxs);
        font-style: italic;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
      }
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: map.get(vars.$spacing, l);
      
      .checkbox-container {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        input[type="checkbox"] {
          margin-right: map.get(vars.$spacing, xs);
          width: auto;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      a.terms-link, a.forgot-password {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal) !important;
            text-decoration: none;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
    
    .submit-button {
      margin-top: map.get(vars.$spacing, xl);
      width: 100%;
      padding: map.get(vars.$spacing, m);
      border: none;
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      cursor: pointer;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      transform: scale(1.05);
      transition: all 0.5s;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          
          &:hover {
            transform: translateY(-3px);
            @include mixins.glow('green', 'small', $theme);
          }
          
          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
        }
      }
    }
  }
}
</style>