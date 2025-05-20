<!-- src/pages/Contact.vue -->
<template>
  <div class="contact-page container">
    <div class="page-header">
      <h1>Kontakt</h1>
      <div class="header-decoration"></div>
      <p class="subtitle">Wir freuen uns auf deine Nachricht!</p>
    </div>

    <div class="contact-container">
      <div class="contact-info">
        <div class="info-card">
          <div class="icon-wrapper">
            <!-- HeroIcon für E-Mail -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </div>
          <h2>E-Mail</h2>
          <p>info@learntogrow.de</p>
          <p class="detail-text">Wir antworten in der Regel innerhalb von 24 Stunden.</p>
        </div>

        <div class="info-card">
          <div class="icon-wrapper">
            <!-- HeroIcon für Telefon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path fill-rule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2>Telefon</h2>
          <p>+49 123 456789</p>
          <p class="detail-text">Montag bis Freitag: 9:00 - 17:00 Uhr</p>
        </div>

        <div class="info-card">
          <div class="icon-wrapper">
            <!-- HeroIcon für Standort -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2>Adresse</h2>
          <p>LearnToGrow GmbH</p>
          <p>Familienstraße 42</p>
          <p>10115 Berlin</p>
        </div>

        <div class="info-card">
          <div class="icon-wrapper">
            <!-- HeroIcon für Instagram -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2>Social Media</h2>
          <p>Folge uns auf Instagram</p>
          <a href="https://www.instagram.com" target="_blank" class="social-link">@LearnToGrow</a>
        </div>
      </div>

      <div class="contact-form-container">
        <div class="form-header">
          <h2>Schreib uns eine Nachricht</h2>
          <div class="form-decoration"></div>
        </div>
        
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="name" v-model="formData.name" placeholder=" " required />
                <label for="name">Name *</label>
                <div class="input-focus-bg"></div>
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <input type="email" id="email" v-model="formData.email" placeholder=" " required />
                <label for="email">E-Mail *</label>
                <div class="input-focus-bg"></div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="dropdown-label" for="subject">Betreff *</label>
            <div class="custom-dropdown">
              <div class="dropdown-selected" @click="toggleDropdown" :class="{ 'active': isDropdownOpen }" tabindex="0"
                @keydown.enter="toggleDropdown" @keydown.space="toggleDropdown" @keydown.up="navigateOptions(-1)"
                @keydown.down="navigateOptions(1)" @keydown.esc="closeDropdown">
                <span>{{ formData.subject ? getSelectedOptionText() : 'Bitte wählen...' }}</span>
                <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd" />
                </svg>
              </div>

              <div class="dropdown-options" :class="{ 'show': isDropdownOpen }">
                <div class="dropdown-group">
                  <div class="group-label">Allgemeine Anfragen</div>
                  <div class="dropdown-option" @click="selectOption('Beratung')" tabindex="0">Beratungsgespräch anfragen</div>
                  <div class="dropdown-option" @click="selectOption('Information')" tabindex="0">Informationsmaterial anfordern</div>
                  <div class="dropdown-option" @click="selectOption('Workshop')" tabindex="0">Frage zu Workshops/Veranstaltungen</div>
                </div>
                
                <div class="dropdown-group">
                  <div class="group-label">Accountbezogene Anfragen</div>
                  <div class="dropdown-option" @click="selectOption('Registrierung')" tabindex="0">Probleme bei der Registrierung</div>
                  <div class="dropdown-option" @click="selectOption('Anmeldung')" tabindex="0">Anmeldeprobleme</div>
                  <div class="dropdown-option" @click="selectOption('Passwort')" tabindex="0">Passwort zurücksetzen</div>
                  <div class="dropdown-option" @click="selectOption('Konto')" tabindex="0">Kontoverwaltung</div>
                </div>
                
                <div class="dropdown-group">
                  <div class="group-label">Inhaltliche Anfragen</div>
                  <div class="dropdown-option" @click="selectOption('Artikel')" tabindex="0">Frage zu einem Artikel</div>
                  <div class="dropdown-option" @click="selectOption('Expertise')" tabindex="0">Expertenmeinung einholen</div>
                  <div class="dropdown-option" @click="selectOption('Kooperation')" tabindex="0">Kooperationsanfrage</div>
                </div>
                
                <div class="dropdown-group">
                  <div class="group-label">Sonstige Anfragen</div>
                  <div class="dropdown-option" @click="selectOption('Feedback')" tabindex="0">Feedback geben</div>
                  <div class="dropdown-option" @click="selectOption('Technisch')" tabindex="0">Technische Probleme melden</div>
                  <div class="dropdown-option" @click="selectOption('Presse')" tabindex="0">Presseanfrage</div>
                  <div class="dropdown-option" @click="selectOption('Karriere')" tabindex="0">Karriere/Stellenangebote</div>
                  <div class="dropdown-option" @click="selectOption('Sonstiges')" tabindex="0">Sonstige Anfrage</div>
                </div>
              </div>

              <!-- Hidden input for form submission -->
              <input type="hidden" id="subject" name="subject" :value="formData.subject">
            </div>
            
            <div class="input-wrapper" v-if="formData.subject === 'Sonstiges'">
              <input 
                type="text" 
                id="customSubject" 
                v-model="formData.customSubject" 
                placeholder=" "
                required 
              />
              <label for="customSubject">Betreff angeben *</label>
              <div class="input-focus-bg"></div>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper textarea">
              <textarea id="message" v-model="formData.message" rows="6" placeholder=" " required></textarea>
              <label for="message">Nachricht *</label>
              <div class="input-focus-bg"></div>
            </div>
          </div>

          <div class="form-group checkbox">
            <label class="checkbox-container">
              <input type="checkbox" v-model="formData.privacy" required />
              <span class="checkmark"></span>
              <span class="checkbox-text">Ich habe die <router-link to="/datenschutz">Datenschutzerklärung</router-link> gelesen und stimme zu.</span>
            </label>
          </div>

          <button type="submit" class="submit-button">
            <span>Nachricht senden</span>
            <!-- HeroIcon für Papierflugzeug -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>

    <div class="faq-section">
      <div class="section-header">
        <h2>Häufig gestellte Fragen</h2>
        <div class="header-decoration"></div>
      </div>

      <div class="faq-container">
        <div v-for="(faq, index) in faqs" :key="index" class="faq-item" :class="{ 'open': faq.isOpen }">
          <div class="faq-question" @click="toggleFaq(index)">
            <h3>{{ faq.question }}</h3>
            <div class="toggle-icon">
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="faq-answer" :style="{ maxHeight: faq.isOpen ? '500px' : '0' }">
            <div class="answer-content">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

export default defineComponent({
  name: 'ContactPage',
  setup() {
    const formData = reactive({
      name: '',
      email: '',
      subject: '',
      customSubject: '',
      message: '',
      privacy: false
    });
    
    const isDropdownOpen = ref(false);
    
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };
    
    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };
    
    const selectOption = (value: string) => {
      formData.subject = value;
      closeDropdown();
    };
    
    const navigateOptions = (direction: number) => {
      // Diese Funktion würde die Tastaturnavigation im Dropdown implementieren
      console.log('Navigate: ', direction);
    };
    
    const getSelectedOptionText = () => {
      const options = {
        'Beratung': 'Beratungsgespräch anfragen',
        'Information': 'Informationsmaterial anfordern',
        'Workshop': 'Frage zu Workshops/Veranstaltungen',
        'Registrierung': 'Probleme bei der Registrierung',
        'Anmeldung': 'Anmeldeprobleme',
        'Passwort': 'Passwort zurücksetzen',
        'Konto': 'Kontoverwaltung',
        'Artikel': 'Frage zu einem Artikel',
        'Expertise': 'Expertenmeinung einholen',
        'Kooperation': 'Kooperationsanfrage',
        'Feedback': 'Feedback geben',
        'Technisch': 'Technische Probleme melden',
        'Presse': 'Presseanfrage',
        'Karriere': 'Karriere/Stellenangebote',
        'Sonstiges': 'Sonstige Anfrage'
      };
      return options[formData.subject as keyof typeof options] || formData.subject;
    };

    const submitForm = () => {
      // Für Ticketsystem: Betreff anpassen wenn "Sonstiges" gewählt wurde
      const finalSubject = formData.subject === 'Sonstiges' 
        ? `Sonstiges: ${formData.customSubject}` 
        : formData.subject;
      
      // Hier könnten Daten an ein Backend gesendet werden
      console.log('Sende Anfrage mit Betreff:', finalSubject);
      
      alert('Vielen Dank für deine Nachricht! Wir werden uns so schnell wie möglich bei dir melden.');
      // Formular zurücksetzen
      formData.name = '';
      formData.email = '';
      formData.subject = '';
      formData.customSubject = '';
      formData.message = '';
      formData.privacy = false;
    };

    const faqs = ref([
      {
        question: 'Wie schnell erhalte ich eine Antwort auf meine Anfrage?',
        answer: 'Wir bearbeiten alle Anfragen innerhalb von 24 Stunden an Werktagen. In Ausnahmefällen und an Wochenenden kann es etwas länger dauern.',
        isOpen: false
      },
      {
        question: 'Kann ich auch telefonisch beraten werden?',
        answer: 'Ja, wir bieten auch telefonische Beratungen an. Bitte vereinbare dafür einen Termin über unser Kontaktformular oder rufe direkt während unserer Geschäftszeiten an.',
        isOpen: false
      },
      {
        question: 'Bietet ihr auch Workshops oder Veranstaltungen an?',
        answer: 'Ja, wir organisieren regelmäßig Workshops und Vorträge zu verschiedenen Erziehungsthemen. Die aktuellen Termine findest du in unserem Newsletter und auf unseren Social-Media-Kanälen.',
        isOpen: false
      },
      {
        question: 'Wie kann ich Autor/in bei euch werden?',
        answer: 'Wir freuen uns immer über neue Beiträge von Experten und Eltern. Schicke uns einfach eine E-Mail mit deinem Themenvorschlag und einigen Informationen zu deiner Person und Expertise.',
        isOpen: false
      }
    ]);

    // Modifizierte toggleFaq-Funktion für Accordion-Verhalten
    const toggleFaq = (index: number) => {
      // Wenn das Element bereits geöffnet ist, schließe es
      if (faqs.value[index].isOpen) {
        faqs.value[index].isOpen = false;
      } else {
        // Schließe alle FAQs
        faqs.value.forEach((faq, i) => {
          faq.isOpen = i === index;
        });
      }
    };

    // Handler für Klicks außerhalb des Dropdowns
    const handleOutsideClick = (event: MouseEvent) => {
      const dropdown = document.querySelector('.custom-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node) && isDropdownOpen.value) {
        closeDropdown();
      }
    };

    // Event-Listener hinzufügen/entfernen
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });

    return {
      formData,
      isDropdownOpen,
      toggleDropdown,
      closeDropdown,
      selectOption,
      navigateOptions,
      getSelectedOptionText,
      submitForm,
      faqs,
      toggleFaq
    };
  }
});

import { onMounted, onBeforeUnmount } from 'vue';
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.contact-page {
  padding: 5rem 0;
  max-width: 1200px;
  margin: 0 auto;
  
  .page-header {
    text-align: center;
    margin-bottom: 4rem;
    
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg, 
            mixins.theme-color($theme, accent-green) 0%, 
            mixins.theme-color($theme, accent-teal) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }
    
    .header-decoration {
      width: 80px;
      height: 4px;
      border-radius: 2px;
      margin: 1rem auto 1.5rem;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: linear-gradient(
            90deg, 
            mixins.theme-color($theme, accent-green) 0%, 
            mixins.theme-color($theme, accent-teal) 100%
          );
        }
      }
    }
    
    .subtitle {
      font-size: 1.2rem;
      line-height: 1.5;
      max-width: 600px;
      margin: 0 auto;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }

  .contact-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2.5rem;
    margin-bottom: 5rem;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .contact-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    
    @media (max-width: 1024px) and (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-card {
      position: relative;
      padding: 1.8rem;
      border-radius: 16px;
      transition: all 0.3s ease;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
      }
      
      &:hover {
        transform: translateY(-5px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-color: mixins.theme-color($theme, accent-green);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
          }
        }
        
        .icon-wrapper {
          transform: translateY(-8px) rotate(5deg);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              box-shadow: 0 8px 20px rgba(mixins.theme-color($theme, accent-green), 0.4);
            }
          }
        }
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(
              to bottom,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%
            );
          }
        }
      }

      .icon-wrapper {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.2rem;
        transition: all 0.3s ease;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(135deg,
              mixins.theme-color($theme, accent-green) 0%,
              mixins.theme-color($theme, accent-teal) 100%);
            color: white;
            box-shadow: 0 5px 15px rgba(mixins.theme-color($theme, accent-green), 0.2);
          }
        }
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }

      p {
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 0.4rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
        
        &.detail-text {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }

      .social-link {
        display: inline-block;
        text-decoration: none;
        margin-top: 0.5rem;
        font-weight: 600;
        position: relative;
        padding-bottom: 2px;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          border-radius: 1px;
          transition: width 0.3s ease;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-teal);
            
            &::after {
              background: mixins.theme-color($theme, accent-teal);
            }
            
            &:hover {
              color: mixins.theme-color($theme, accent-green);
              
              &::after {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }

  .contact-form-container {
    border-radius: 16px;
    overflow: hidden;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
      }
    }
    
    .form-header {
      padding: 2rem;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        }
      }
      
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .form-decoration {
        width: 50px;
        height: 3px;
        border-radius: 2px;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(
              90deg, 
              mixins.theme-color($theme, accent-teal) 0%, 
              mixins.theme-color($theme, accent-green) 100%
            );
          }
        }
      }
    }

    .contact-form {
      padding: 2rem;
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }
      
      .form-group {
        margin-bottom: 1.5rem;
        
        .dropdown-label {
          display: block;
          margin-bottom: 0.6rem;
          font-weight: 600;
          font-size: 0.95rem;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }

        .input-wrapper {
          position: relative;
          
          input, textarea {
            width: 100%;
            padding: 1rem 1.2rem;
            font-size: 1rem;
            border-radius: 10px;
            background: transparent;
            position: relative;
            z-index: 2;
            transition: all 0.3s ease;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
                border: 1px solid mixins.theme-color($theme, border-medium);
                
                &:focus {
                  outline: none;
                  border-color: mixins.theme-color($theme, accent-green);
                }
                
                &:focus + label, &:not(:placeholder-shown) + label {
                  transform: translateY(-135%) scale(0.85);
                  background-color: mixins.theme-color($theme, card-bg);
                  padding: 0 8px;
                  color: mixins.theme-color($theme, accent-green);
                }
                
                &:focus ~ .input-focus-bg {
                  opacity: 1;
                }
              }
            }
          }
          
          textarea {
            resize: vertical;
            min-height: 120px;
          }
          
          label {
            position: absolute;
            left: 1.2rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1rem;
            pointer-events: none;
            transition: all 0.2s ease;
            z-index: 3;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-tertiary);
              }
            }
          }
          
          &.textarea label {
            top: 1.8rem;
            transform: none;
          }
          
          .input-focus-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            opacity: 0;
            z-index: 1;
            transition: opacity 0.3s ease;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: rgba(mixins.theme-color($theme, accent-green), 0.08);
              }
            }
          }
        }
        
        .custom-dropdown {
          position: relative;
          width: 100%;
          z-index: 10;
          margin-bottom: 1rem;

          .dropdown-selected {
            width: 100%;
            padding: 1rem 1.2rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 10px;
            outline: none;
            transition: all 0.3s ease;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: transparent;
                color: mixins.theme-color($theme, text-primary);
                border: 1px solid mixins.theme-color($theme, border-medium);

                &:hover, &:focus {
                  border-color: mixins.theme-color($theme, accent-green);
                }

                &.active {
                  border-color: mixins.theme-color($theme, accent-green);
                  background: rgba(mixins.theme-color($theme, accent-green), 0.1);
                }
              }
            }

            .dropdown-arrow {
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

          .dropdown-options {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            max-height: 300px;
            overflow-y: auto;
            border-radius: 10px;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background-color: mixins.theme-color($theme, card-bg);
                border: 1px solid mixins.theme-color($theme, border-light);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              }
            }

            &.show {
              opacity: 1;
              visibility: visible;
              transform: translateY(0);
            }
            
            .dropdown-group {
              padding: 0.5rem 0;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
                  
                  &:last-child {
                    border-bottom: none;
                  }
                }
              }
              
              .group-label {
                padding: 0.5rem 1.2rem;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, text-tertiary);
                  }
                }
              }
            }

            .dropdown-option {
              padding: 0.8rem 1.2rem;
              cursor: pointer;
              transition: background 0.2s ease;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-primary);

                  &:hover, &:focus {
                    background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                  }
                }
              }
            }
          }
        }
        
        &.checkbox {
          margin-top: 2rem;
          
          .checkbox-container {
            display: flex;
            align-items: flex-start;
            position: relative;
            padding-left: 30px;
            cursor: pointer;
            
            input[type="checkbox"] {
              position: absolute;
              opacity: 0;
              cursor: pointer;
              height: 0;
              width: 0;
              
              &:checked ~ .checkmark {
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    background-color: mixins.theme-color($theme, accent-green);
                    border-color: mixins.theme-color($theme, accent-green);
                  }
                }
                
                &:after {
                  display: block;
                }
              }
            }
            
            .checkmark {
              position: absolute;
              top: 0;
              left: 0;
              height: 20px;
              width: 20px;
              border-radius: 4px;
              transition: all 0.2s ease;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  background-color: transparent;
                  border: 2px solid mixins.theme-color($theme, border-medium);
                }
              }
              
              &:after {
                content: "";
                position: absolute;
                display: none;
                left: 6px;
                top: 2px;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
              }
            }
            
            .checkbox-text {
              font-size: 0.95rem;
              line-height: 1.5;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, text-secondary);
                }
              }
              
              a {
                text-decoration: none;
                position: relative;
                
                &::after {
                  content: '';
                  position: absolute;
                  bottom: -1px;
                  left: 0;
                  width: 100%;
                  height: 1px;
                  transform: scaleX(0);
                  transition: transform 0.3s ease;
                  transform-origin: right;
                }
                
                @each $theme in ('light', 'dark') {
                  .theme-#{$theme} & {
                    color: mixins.theme-color($theme, accent-green);
                    
                    &::after {
                      background-color: mixins.theme-color($theme, accent-green);
                    }
                    
                    &:hover::after {
                      transform: scaleX(1);
                      transform-origin: left;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .submit-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        border: none;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        float: right;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(135deg, 
              mixins.theme-color($theme, accent-green) 0%, 
              mixins.theme-color($theme, accent-teal) 100%
            );
            color: white;
            box-shadow: 0 8px 20px rgba(mixins.theme-color($theme, accent-green), 0.3);
          }
        }
        
        &:hover {
          transform: translateY(-3px);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              box-shadow: 0 15px 30px rgba(mixins.theme-color($theme, accent-green), 0.4);
            }
          }
          
          svg {
            transform: translateX(3px);
          }
        }
        
        svg {
          transition: transform 0.2s ease;
        }
      }
    }
  }

  .faq-section {
    padding-top: 2rem;
    
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
      
      h2 {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .header-decoration {
        width: 60px;
        height: 3px;
        border-radius: 2px;
        margin: 0.8rem auto 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(
              90deg, 
              mixins.theme-color($theme, accent-green) 0%, 
              mixins.theme-color($theme, accent-teal) 100%
            );
          }
        }
      }
    }

    .faq-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-item {
      margin-bottom: 1rem;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
        }
      }
      
      &.open {
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                          border-color: mixins.theme-color($theme, accent-green);
          }
        }
        
        .toggle-icon {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
            }
          }
          
          span:first-child {
            transform: rotate(90deg);
          }
          
          span:last-child {
            transform: rotate(180deg);
          }
        }
      }

      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.2rem 1.5rem;
        cursor: pointer;
        
        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }

        .toggle-icon {
          position: relative;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          transition: all 0.3s ease;
          flex-shrink: 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: rgba(mixins.theme-color($theme, accent-teal), 0.15);
            }
          }
          
          span {
            position: absolute;
            background-color: white;
            transition: all 0.3s ease;
            
            &:first-child {
              top: 50%;
              left: 50%;
              width: 10px;
              height: 2px;
              margin-left: -5px;
              margin-top: -1px;
            }
            
            &:last-child {
              top: 50%;
              left: 50%;
              width: 2px;
              height: 10px;
              margin-left: -1px;
              margin-top: -5px;
            }
          }
        }
      }

      .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        
        .answer-content {
          padding: 0 1.5rem 1.5rem;
          
          p {
            margin: 0;
            line-height: 1.6;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }
    }
  }
}
</style>