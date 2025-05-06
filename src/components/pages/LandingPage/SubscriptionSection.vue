<template>
  <section class="section subscription-section" id="sub">
    <h2>Mehr dazu erfahren</h2>

    <div class="subscription">
      <div class="subscription-info">
        <p>Melde dich für den Newsletter an und erhalte regelmäßig neue Artikel und Informationen zu für dich relevanten
          Themen.</p>
        <p v-html="bulletPoints"></p>
      </div>

      <div class="form-container">
        <div class="form-group">
          <label for="name">Vorname</label>
          <input type="text" id="name" placeholder="Dein Name">
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input type="email" id="email" placeholder="Deine E-Mail">
        </div>

        <div class="form-group">
          <label for="age">Alter der Kinder</label>
          <div class="custom-dropdown">
            <div class="dropdown-selected" @click="toggleDropdown" :class="{ 'active': isOpen }" tabindex="0"
              @keydown.enter="toggleDropdown" @keydown.space="toggleDropdown" @keydown.up="navigateOptions(-1)"
              @keydown.down="navigateOptions(1)" @keydown.esc="closeDropdown">
              <span>{{ selectedOption.text }}</span>
              <span class="dropdown-arrow">▼</span>
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

        <button class="btn">Anmelden</button>
      </div>
    </div>

    <p class="footnote">* Deine Daten werden vertraulich und ausschließlich für die Zusendung des Newsletters verwendet.
      Du kannst dich jederzeit mit einem Klick einfach abmelden, wenn diese gegen die Bedingungen verstoßen.</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'SubscriptionSection',
  setup() {
    const bulletPoints = '• Zweimal im Monat neue Inhalte<br>• Kostenlos und jederzeit kündbar<br>• Du bleibst immer auf dem neuesten Stand';

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
      bulletPoints,
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
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.subscription-section {
  @include animations.scroll-fade-in;

  h2 {
    font-size: map-get(map-get(vars.$fonts, sizes), xxxl);
    font-weight: map-get(map-get(vars.$fonts, weights), extra-bold);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.section-header($theme);
      }
    }
  }

  .subscription {
    @include mixins.grid(1fr 1fr, auto, map-get(vars.$spacing, xxl));
    margin-top: map-get(vars.$spacing, xxl);

    @include mixins.responsive('tablet') {
      grid-template-columns: 1fr;
    }

    .subscription-info,
    .form-container {
      position: relative;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          padding: map-get(vars.$spacing, xl);
          border-radius: map-get(map-get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          @include mixins.shadow('medium', $theme);
          transition: all map-get(vars.$transitions, default);
        }
      }

      &:hover {
        transform: scale(1.02);
      }
    }

    .subscription-info:hover {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.glow('green', 'medium', $theme);
          border-color: mixins.theme-color($theme, accent-green);
        }
      }
    }

    .form-container:hover {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.glow('teal', 'medium', $theme);
          border-color: mixins.theme-color($theme, accent-teal);
        }
      }
    }

    p {
      font-size: map-get(map-get(vars.$fonts, sizes), medium);
      margin-bottom: map-get(vars.$spacing, l);
      line-height: 1.8;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // Formular-Elemente
  .form-group {
    margin-bottom: map-get(vars.$spacing, l);

    label {
      display: block;
      margin-bottom: map-get(vars.$spacing, s);
      font-weight: map-get(map-get(vars.$fonts, weights), bold);

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }

    input {
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          @include mixins.form-element($theme);
        }
      }
    }

    // Benutzerdefiniertes Dropdown-Menü
    .custom-dropdown {
      position: relative;
      width: 100%;
      font-family: map-get(vars.$fonts, primary);

      // Ausgewähltes Element
      .dropdown-selected {
        width: 100%;
        padding: 0.9rem 1.2rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        border-radius: map-get(map-get(vars.$layout, border-radius), medium);
        outline: none;
        font-size: map-get(map-get(vars.$fonts, sizes), base);

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
            transition: all map-get(vars.$transitions, default);

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
            border-radius: map-get(map-get(vars.$layout, border-radius), medium);
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
          font-size: map-get(map-get(vars.$fonts, sizes), base);

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
              border-bottom: 1px solid rgba(mixins.theme-color($theme, border-light), 0.2);

              &:hover,
              &:focus {
                background-color: mixins.theme-color($theme, hover-color);
              }

              &.selected {
                font-weight: map-get(map-get(vars.$fonts, weights), bold);
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
  }

  // Button
  .btn {
    display: inline-block;
    margin-top: map-get(vars.$spacing, m);
    @include animations.shine-effect;

    &:hover {
      transform: scale(1.05) !important;
    }

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.button-style($theme, 'medium', true);
      }
    }
  }

  // Footnote
  .footnote {
    font-size: map-get(map-get(vars.$fonts, sizes), small);
    margin-top: map-get(vars.$spacing, xxl);
    text-align: center;
    line-height: 1.6;

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        color: mixins.theme-color($theme, text-tertiary);
      }
    }
  }
}
</style>