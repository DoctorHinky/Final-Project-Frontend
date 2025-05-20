<template>
  <section class="section subscription-section" id="sub">
    <div class="section-header">
      <h2>Mehr dazu erfahren</h2>
      <div class="header-decoration"></div>
    </div>

    <div class="subscription">
      <div class="subscription-info">
        <div class="info-content">
          <div class="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <p class="info-text">Melde dich für den Newsletter an und erhalte regelmäßig neue Artikel und Informationen zu für dich relevanten Themen.</p>
          <div class="benefits">
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Zweimal im Monat neue Inhalte</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Kostenlos und jederzeit kündbar</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Du bleibst immer auf dem neuesten Stand</span>
            </div>
          </div>
        </div>
        <div class="decoration-circle"></div>
      </div>

      <div class="form-container">
        <div class="form-header">Newsletter anmelden</div>
        <div class="form-content">
          <div class="form-group">
            <div class="input-wrapper">
              <input type="text" id="name" placeholder=" ">
              <label for="name">Vorname</label>
              <div class="input-focus-bg"></div>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input type="email" id="email" placeholder=" ">
              <label for="email">E-Mail</label>
              <div class="input-focus-bg"></div>
            </div>
          </div>

          <div class="form-group">
            <label class="dropdown-label">Alter der Kinder</label>
            <div class="custom-dropdown">
              <div class="dropdown-selected" @click="toggleDropdown" :class="{ 'active': isOpen }" tabindex="0"
                @keydown.enter="toggleDropdown" @keydown.space="toggleDropdown" @keydown.up="navigateOptions(-1)"
                @keydown.down="navigateOptions(1)" @keydown.esc="closeDropdown">
                <span>{{ selectedOption.text }}</span>
                <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              <div class="dropdown-options" :class="{ 'show': isOpen }">
                <div v-for="(option, index) in options" :key="option.value" class="dropdown-option"
                  :class="{ 'selected': option.value === selectedOption.value }" @click="selectOption(option)"
                  tabindex="0" @keydown.enter="selectOption(option)" :data-index="index">
                  {{ option.text }}
                </div>
              </div>

              <!-- Hidden input for form submission -->
              <input type="hidden" id="age" name="age" :value="selectedOption.value">
            </div>
          </div>

          <button class="btn">
            <span>Anmelden</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <p class="footnote">* Deine Daten werden vertraulich und ausschließlich für die Zusendung des Newsletters verwendet.
      Du kannst dich jederzeit mit einem Klick einfach abmelden.</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'SubscriptionSection',
  setup() {
    const options = [
      { value: '', text: 'Bitte wählen' },
      { value: '0-3', text: '0-3 Jahre' },
      { value: '4-6', text: '4-6 Jahre' },
      { value: '7-12', text: '7-12 Jahre' },
      { value: '13+', text: '13+ Jahre' }
    ];

    const selectedOption = ref(options[0]);
    const isOpen = ref(false);

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const selectOption = (option: { value: string; text: string }) => {
      selectedOption.value = option;
      closeDropdown();
    };

    const navigateOptions = (direction: number) => {
      if (!isOpen.value) {
        isOpen.value = true;
        return;
      }

      const currentIndex = options.findIndex(option => option.value === selectedOption.value.value);
      let newIndex = currentIndex + direction;

      if (newIndex < 0) {
        newIndex = options.length - 1;
      } else if (newIndex >= options.length) {
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
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      options,
      selectedOption,
      isOpen,
      toggleDropdown,
      closeDropdown,
      selectOption,
      navigateOptions
    };
  }
});
</script>

<style lang="scss">
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.subscription-section {
  @include animations.scroll-fade-in;
  padding: 4rem 0;
  position: relative;
  
  .section-header {
    text-align: center;
    margin-bottom: 3.5rem;
    position: relative;
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      position: relative;
      display: inline-block;
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
      margin: 0 auto;
      
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

  .subscription {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }

    .subscription-info,
    .form-container {
      position: relative;
      border-radius: 16px;
      transition: all 0.4s ease;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.03);
        }
      }
      
      &:hover {
        transform: translateY(-8px);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.08),
              0 2px 5px rgba(0, 0, 0, 0.05);
          }
        }
      }
    }

    .subscription-info {
      position: relative;
      z-index: 2;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
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
      
      .info-content {
        padding: 2.5rem;
        position: relative;
        z-index: 2;
      }
      
      .info-icon {
        margin-bottom: 1.5rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, accent-green);
          }
        }
      }
      
      .info-text {
        font-size: 1.1rem;
        line-height: 1.7;
        margin-bottom: 2rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .benefits {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          
          .benefit-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            flex-shrink: 0;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                background: mixins.theme-color($theme, accent-green);
                color: white;
              }
            }
          }
          
          span {
            font-size: 1rem;
            line-height: 1.5;
            
            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }
      
      .decoration-circle {
        position: absolute;
        bottom: -80px;
        right: -80px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        z-index: 1;
        opacity: 0.05;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: mixins.theme-color($theme, accent-green);
          }
        }
      }
    }

    .form-container {
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 6px;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: linear-gradient(
              to right,
              mixins.theme-color($theme, accent-teal) 0%,
              mixins.theme-color($theme, accent-green) 100%
            );
          }
        }
      }
      
      .form-header {
        padding: 1.5rem 2.5rem;
        font-weight: 700;
        font-size: 1.1rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
            border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.5);
          }
        }
      }
      
      .form-content {
        padding: 2rem 2.5rem;
      }
    }
  }

  .form-group {
    margin-bottom: 1.6rem;
    
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
      margin-bottom: 0.5rem;
      
      input {
        width: 100%;
        padding: 1rem 1.2rem;
        font-size: 1rem;
        border-radius: 8px;
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
              border-color: mixins.theme-color($theme, accent-teal);
            }
            
            &:focus + label, &:not(:placeholder-shown) + label {
              transform: translateY(-130%) scale(0.85);
              background-color: mixins.theme-color($theme, secondary-bg);
              padding: 0 8px;
              color: mixins.theme-color($theme, accent-teal);
            }
            
            &:focus ~ .input-focus-bg {
              opacity: 1;
            }
          }
        }
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
      
      .input-focus-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        opacity: 0;
        z-index: 1;
        transition: opacity 0.3s ease;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background: rgba(mixins.theme-color($theme, accent-teal), 0.05);
          }
        }
      }
    }

    .custom-dropdown {
      position: relative;
      width: 100%;
      font-family: map.get(vars.$fonts, primary);
      z-index: 10;

      .dropdown-selected {
        width: 100%;
        padding: 1rem 1.2rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        outline: none;
        transition: all 0.3s ease;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            color: mixins.theme-color($theme, text-primary);
            border: 1px solid mixins.theme-color($theme, border-medium);

            &:hover, &:focus {
              border-color: mixins.theme-color($theme, accent-teal);
            }

            &.active {
              border-color: mixins.theme-color($theme, accent-teal);
              background: rgba(mixins.theme-color($theme, accent-teal), 0.05);
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
        max-height: 250px;
        overflow-y: auto;
        border-radius: 8px;

        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, secondary-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
        }

        &.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-option {
          padding: 0.9rem 1.2rem;
          cursor: pointer;
          transition: background 0.2s ease;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.1);

              &:hover, &:focus {
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.05);
              }

              &.selected {
                font-weight: 600;
                background-color: rgba(mixins.theme-color($theme, accent-teal), 0.1);
                color: mixins.theme-color($theme, accent-teal);
              }

              &:last-child {
                border-bottom: none;
              }
            }
          }
        }
      }
    }
  }

  .btn {
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
    width: 100%;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background: linear-gradient(
          90deg, 
          mixins.theme-color($theme, accent-teal) 0%, 
          mixins.theme-color($theme, accent-green) 100%
        );
        color: white;
        box-shadow: 0 8px 15px rgba(mixins.theme-color($theme, accent-teal), 0.2);
      }
    }
    
    &:hover {
      transform: translateY(-3px);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          box-shadow: 0 12px 20px rgba(mixins.theme-color($theme, accent-teal), 0.3);
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

  .footnote {
    font-size: 0.85rem;
    margin-top: 2.5rem;
    text-align: center;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }
}
</style>