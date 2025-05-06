<!-- src/pages/Contact.vue -->
<template>
  <div class="contact-page container">
    <h1>Kontakt</h1>
    <p class="subtitle">Wir freuen uns auf deine Nachricht!</p>
    
    <div class="contact-container">
      <div class="contact-info">
        <div class="info-card">
          <div class="icon">📧</div>
          <h2>E-Mail</h2>
          <p>info@elternundkind.de</p>
          <p>Wir antworten in der Regel innerhalb von 24 Stunden.</p>
        </div>
        
        <div class="info-card">
          <div class="icon">📱</div>
          <h2>Telefon</h2>
          <p>+49 123 456789</p>
          <p>Montag bis Freitag: 9:00 - 17:00 Uhr</p>
        </div>
        
        <div class="info-card">
          <div class="icon">📍</div>
          <h2>Adresse</h2>
          <p>Eltern & Kind GmbH</p>
          <p>Familienstraße 42</p>
          <p>10115 Berlin</p>
        </div>
        
        <div class="info-card">
          <div class="icon">📸</div>
          <h2>Social Media</h2>
          <p>Folge uns auf Instagram</p>
          <a href="https://www.instagram.com" target="_blank" class="social-link">@elternundkind</a>
        </div>
      </div>
      
      <div class="contact-form-container">
        <h2>Schreib uns eine Nachricht</h2>
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-group">
            <label for="name">Name *</label>
            <input type="text" id="name" v-model="formData.name" required />
          </div>
          
          <div class="form-group">
            <label for="email">E-Mail *</label>
            <input type="email" id="email" v-model="formData.email" required />
          </div>
          
          <div class="form-group">
            <label for="subject">Betreff *</label>
            <input type="text" id="subject" v-model="formData.subject" required />
          </div>
          
          <div class="form-group">
            <label for="message">Nachricht *</label>
            <textarea id="message" v-model="formData.message" rows="6" required></textarea>
          </div>
          
          <div class="form-group checkbox">
            <label class="checkbox-container">
              <input type="checkbox" v-model="formData.privacy" required />
              <span class="checkmark"></span>
              Ich habe die <router-link to="/datenschutz">Datenschutzerklärung</router-link> gelesen und stimme zu.
            </label>
          </div>
          
          <button type="submit" class="submit-button">Nachricht senden</button>
        </form>
      </div>
    </div>
    
    <div class="faq-section">
      <h2>Häufig gestellte Fragen</h2>
      
      <div class="faq-container">
        <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
          <div class="faq-question" @click="toggleFaq(index)">
            <h3>{{ faq.question }}</h3>
            <span class="toggle-icon">{{ faq.isOpen ? '−' : '+' }}</span>
          </div>
          <div class="faq-answer" v-if="faq.isOpen">
            <p>{{ faq.answer }}</p>
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
      message: '',
      privacy: false
    });
    
    const submitForm = () => {
      alert('Vielen Dank für deine Nachricht! Wir werden uns so schnell wie möglich bei dir melden.');
      // Formular zurücksetzen
      formData.name = '';
      formData.email = '';
      formData.subject = '';
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
    
    const toggleFaq = (index: number) => {
      faqs.value[index].isOpen = !faqs.value[index].isOpen;
    };
    
    return {
      formData,
      submitForm,
      faqs,
      toggleFaq
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.contact-page {
  padding: map.get(vars.$spacing, xxxl) 0;
  
  h1 {
    font-size: 2.5rem;
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
    margin-bottom: map.get(vars.$spacing, m);
    @include animations.fade-in(0.8s, 0.2s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-primary);
      }
    }
  }
  
  .subtitle {
    font-size: map.get(map.get(vars.$fonts, sizes), large);
    margin-bottom: map.get(vars.$spacing, xxl);
    @include animations.fade-in(0.8s, 0.3s);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-secondary);
      }
    }
  }
  
  .contact-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: map.get(vars.$spacing, xxl);
    margin-bottom: map.get(vars.$spacing, xxxl);
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      grid-template-columns: 1fr;
    }
  }
  
  .contact-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: map.get(vars.$spacing, l);
    align-content: start;
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
      grid-template-columns: 1fr;
    }
    
    .info-card {
      @include animations.fade-in(0.8s);
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          @include mixins.shadow('small', $theme);
        }
      }
      
      .icon {
        font-size: 2rem;
        margin-bottom: map.get(vars.$spacing, m);
      }
      
      h2 {
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        margin-bottom: map.get(vars.$spacing, s);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      p {
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.6;
        margin-bottom: map.get(vars.$spacing, xs);
        
        &:last-of-type {
          margin-bottom: 0;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .social-link {
        display: inline-block;
        text-decoration: none;
        margin-top: map.get(vars.$spacing, xs);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
            
            &:hover {
              color: mixins.theme-color($theme, accent-teal);
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
  
  .contact-form-container {
    @include animations.fade-in(0.8s, 0.3s);
    padding: map.get(vars.$spacing, xl);
    border-radius: map.get(map.get(vars.$layout, border-radius), large);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 2px solid mixins.theme-color($theme, border-light);
        @include mixins.shadow('medium', $theme);
      }
    }
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, xl);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    .contact-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: map.get(vars.$spacing, l);
      
      .form-group {
        &:nth-child(3), &:nth-child(4), &:nth-child(5), &:last-child {
          grid-column: 1 / -1;
        }
        
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
        
        input, textarea {
          width: 100%;
          padding: map.get(vars.$spacing, m);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @include mixins.form-element($theme);
            }
          }
        }
        
        &.checkbox {
          display: flex;
          align-items: center;
          
          .checkbox-container {
            display: flex;
            align-items: center;
            
            input[type="checkbox"] {
              width: auto;
              margin-right: map.get(vars.$spacing, xs);
            }
            
            a {
              text-decoration: none;
              
              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, accent-teal);
                  
                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
            }
          }
        }
      }
      
      .submit-button {
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
        grid-column: 1 / -1;
        justify-self: end;
        border: none;
        cursor: pointer;
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        transition: transform map.get(vars.$transitions, default),
                   box-shadow map.get(vars.$transitions, default);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.button-style($theme, 'medium', true);
          }
        }
      }
    }
  }
  
  .faq-section {
    @include animations.fade-in(0.8s, 0.5s);
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      margin-bottom: map.get(vars.$spacing, xl);
      text-align: center;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    .faq-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .faq-item {
      margin-bottom: map.get(vars.$spacing, m);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      overflow: hidden;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: map.get(vars.$spacing, m);
        cursor: pointer;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
        
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        .toggle-icon {
          font-size: 1.5rem;
          font-weight: bold;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-green);
            }
          }
        }
      }
      
      .faq-answer {
        padding: map.get(vars.$spacing, m);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
          }
        }
        
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
</style>