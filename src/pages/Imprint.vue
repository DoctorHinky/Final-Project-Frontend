<!-- src/pages/Imprint.vue -->
<template>
  <div class="legal-page imprint-page">
    <div class="container">
      <div class="page-header">
        <h1>Impressum</h1>
        <div class="last-updated">Zuletzt aktualisiert: 10. Mai 2025</div>
      </div>

      <div class="content-wrapper">
        <!-- Hauptinhalt -->
        <main class="main-content">
          <!-- Unternehmensinfo -->
          <div class="content-section company-info">
            <h2>Angaben gemäß § 5 TMG</h2>
            <div class="info-card">
              <div class="logo-area">
                <div class="logo">
                  <img src="../assets/images/Logo.png" alt="Firmenlogo" />
                </div>
              </div>
              <div class="info-details">
                <h3>Muster GmbH</h3>
                <address>
                  <p>Musterstraße 123<br>
                  12345 Musterstadt<br>
                  Deutschland</p>
                  
                  <div class="contact-group">
                    <div class="contact-item">
                      <div class="label">Telefon:</div>
                      <div class="value">+49 123 456789</div>
                    </div>
                    <div class="contact-item">
                      <div class="label">E-Mail:</div>
                      <div class="value">info@beispiel.de</div>
                    </div>
                    <div class="contact-item">
                      <div class="label">Website:</div>
                      <div class="value">www.beispiel.de</div>
                    </div>
                  </div>
                </address>
              </div>
            </div>
            
            <div class="registration-info">
              <h3>Handelsregister</h3>
              <p>Amtsgericht Musterstadt<br>
              HRB 12345</p>
              
              <h3>Umsatzsteuer-ID</h3>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br>
              DE 123456789</p>
            </div>
          </div>
          
          <!-- Verantwortlichkeiten -->
          <div class="content-section">
            <h2>Verantwortlich für den Inhalt</h2>
            <div class="responsibility-card">
              <div class="person-avatar">
                <span class="avatar-placeholder">MM</span>
              </div>
              <div class="person-info">
                <h3>Max Mustermann</h3>
                <p>Geschäftsführer</p>
                <p>E-Mail: gf@beispiel.de</p>
              </div>
            </div>
            
            <div class="responsibility-text">
              <h3>Verantwortlich nach § 55 Abs. 2 RStV</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            </div>
          </div>
          
          <!-- Rechtliches -->
          <div class="content-section">
            <h2>Rechtliche Hinweise</h2>
            
            <h3>Urheberrecht</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            
            <div class="info-box">
              <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            
            <h3>Haftungsausschluss</h3>
            <h4>Haftung für Inhalte</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
            
            <h4>Haftung für Links</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
          </div>
          
          <!-- Streitschlichtung -->
          <div class="content-section">
            <h2>Streitschlichtung</h2>
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a></p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.</p>
          </div>
          
          <!-- Bildnachweise -->
          <div class="content-section">
            <h2>Bildnachweise</h2>
            <div class="image-credits">
              <div class="credit-item">
                <div class="credit-category">Header-Bilder:</div>
                <div class="credit-source">Lorem ipsum dolor sit amet, consectetur adipiscing</div>
              </div>
              <div class="credit-item">
                <div class="credit-category">Icons:</div>
                <div class="credit-source">Nullam auctor, nisl eget ultricies tincidunt</div>
              </div>
              <div class="credit-item">
                <div class="credit-category">Produktfotos:</div>
                <div class="credit-source">Nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl</div>
              </div>
            </div>
          </div>

          <div class="content-footer">
            <div class="print-section">
              <button @click="printPage" class="action-button">
                <span class="icon">🖨️</span> Diese Seite drucken
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImprintPage',
  methods: {
    printPage() {
      window.print();
    }
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;

.legal-page {
  padding: 120px 0 60px;
  
  .page-header {
    text-align: center;
    margin-bottom: map.get(vars.$spacing, xxl);
    
    h1 {
      font-size: 2.5rem;
      font-weight: map.get(map.get(vars.$fonts, weights), bold);
      margin-bottom: map.get(vars.$spacing, s);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, header);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
      }
    }
    
    .last-updated {
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }
  
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .main-content {
    .content-section {
      margin-bottom: map.get(vars.$spacing, xxl);
      
      h2 {
        font-size: 1.8rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        margin-bottom: map.get(vars.$spacing, l);
        padding-bottom: map.get(vars.$spacing, s);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            border-bottom: 2px solid mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      h3 {
        font-size: 1.3rem;
        font-weight: map.get(map.get(vars.$fonts, weights), semibold);
        margin: map.get(vars.$spacing, l) 0 map.get(vars.$spacing, m);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      h4 {
        font-size: 1.1rem;
        font-weight: map.get(map.get(vars.$fonts, weights), semibold);
        margin: map.get(vars.$spacing, m) 0;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      p {
        margin-bottom: map.get(vars.$spacing, m);
        line-height: 1.7;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
        
        a {
          text-decoration: none;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          transition: color map.get(vars.$transitions, default);
          
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
      
      .info-box {
        margin: map.get(vars.$spacing, l) 0;
        padding: map.get(vars.$spacing, l);
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border-left: 4px solid mixins.theme-color($theme, accent-green);
          }
        }
        
        p {
          margin-bottom: 0;
        }
      }
    }
    
    .info-card {
      display: flex;
      margin: map.get(vars.$spacing, l) 0;
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      overflow: hidden;
      
      @include mixins.responsive('mobile') {
        flex-direction: column;
      }
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border: 1px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
        }
      }
      
      .logo-area {
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: map.get(vars.$spacing, l);
        
        @include mixins.responsive('mobile') {
          width: 100%;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
          }
        }
        
        .logo {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: #ffffff;
              @include mixins.shadow('small', $theme);
            }
          }
          
          img {
            width: 80px;
            height: auto;
          }
        }
      }
      
      .info-details {
        flex: 1;
        padding: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
          }
        }
        
        h3 {
          margin-top: 0;
          font-size: 1.5rem;
        }
        
        address {
          font-style: normal;
          
          p {
            margin-bottom: map.get(vars.$spacing, l);
          }
        }
        
        .contact-group {
          display: flex;
          flex-direction: column;
          gap: map.get(vars.$spacing, m);
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          
          @include mixins.responsive('mobile') {
            flex-direction: column;
            align-items: flex-start;
            gap: map.get(vars.$spacing, xs);
          }
          
          .label {
            font-weight: map.get(map.get(vars.$fonts, weights), medium);
            width: 80px;
            
            @include mixins.responsive('mobile') {
              width: auto;
            }
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }
          
          .value {
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }
    }
    
    .registration-info {
      margin-top: map.get(vars.$spacing, xl);
      
      h3 {
        margin-top: map.get(vars.$spacing, xl);
        
        &:first-child {
          margin-top: 0;
        }
      }
    }
    
    .responsibility-card {
      display: flex;
      align-items: center;
      margin: map.get(vars.$spacing, l) 0;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      
      @include mixins.responsive('mobile') {
        flex-direction: column;
        text-align: center;
      }
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      .person-avatar {
        width: 80px;
        height: 80px;
        margin-right: map.get(vars.$spacing, l);
        
        @include mixins.responsive('mobile') {
          margin-right: 0;
          margin-bottom: map.get(vars.$spacing, m);
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          font-size: 1.8rem;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
              color: #ffffff;
            }
          }
        }
      }
      
      .person-info {
        h3 {
          margin-top: 0;
          margin-bottom: map.get(vars.$spacing, xs);
        }
        
        p {
          margin-bottom: map.get(vars.$spacing, xs);
        }
      }
    }
    
    .responsibility-text {
      margin-top: map.get(vars.$spacing, xl);
    }
    
    .image-credits {
      .credit-item {
        display: flex;
        margin-bottom: map.get(vars.$spacing, m);
        padding-bottom: map.get(vars.$spacing, m);
        
        @include mixins.responsive('mobile') {
          flex-direction: column;
        }
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            border-bottom: 1px solid mixins.theme-color($theme, border-light);
          }
        }
        
        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .credit-category {
          width: 150px;
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          
          @include mixins.responsive('mobile') {
            width: auto;
            margin-bottom: map.get(vars.$spacing, xs);
          }
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        .credit-source {
          flex: 1;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }
    
    .content-footer {
      margin-top: map.get(vars.$spacing, xxl);
      padding-top: map.get(vars.$spacing, l);
      text-align: center;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          border-top: 1px solid mixins.theme-color($theme, border-light);
        }
      }
      
      .print-section {
        .action-button {
          display: inline-flex;
          align-items: center;
          gap: map.get(vars.$spacing, s);
          padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          cursor: pointer;
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          transition: all map.get(vars.$transitions, default);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-primary);
              border: 1px solid mixins.theme-color($theme, border-light);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
                border-color: mixins.theme-color($theme, accent-teal);
                transform: translateY(-3px);
                @include mixins.shadow('small', $theme);
              }
            }
          }
          
          .icon {
            font-size: 1.2em;
          }
        }
      }
    }
  }
}

// Druckstil
@media print {
  .navigation,
  .header, 
  .footer,
  .print-section {
    display: none !important;
  }
  
  .legal-page {
    padding: 0;
  }
  
  .page-header {
    text-align: left;
    border-bottom: 1px solid #000;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }
  
  h1, h2, h3, h4 {
    color: #000 !important;
    -webkit-text-fill-color: initial !important;
  }
  
  p, li, .contact-item .label, .contact-item .value, .credit-category, .credit-source {
    color: #333 !important;
  }
  
  .info-card, .responsibility-card {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
  
  .logo-area {
    background-color: #f0f0f0 !important;
  }
  
  .info-box {
    background-color: #f0f0f0 !important;
    border-left: 2px solid #666 !important;
  }
}
</style>