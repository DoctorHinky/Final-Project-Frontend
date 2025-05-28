<template>
  <section class="section community-section" id="community">
    <h2>Familienstimmen unserer Community</h2>

    <div class="community-content">
      <p>Erfahre, wie andere Familien von unserer Plattform profitieren. Wir sind stolz darauf, Eltern bei den täglichen
        Herausforderungen der Kindererziehung zu unterstützen.</p>
      <p>Diese authentischen Bewertungen spiegeln die Erfahrungen echter Familien wider, die unsere Inhalte und
        Ratschläge in ihren Alltag integriert haben.</p>
    </div>

    <div class="testimonials">
      <div class="testimonial">
        <div class="rating">
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
        </div>
        <div class="testimonial-content">
          <p class="quote">"Die Artikel über Trotzphasen haben mir geholfen, die Entwicklung meines zweijährigen Sohnes
            besser zu verstehen. Ich reagiere jetzt viel gelassener auf schwierige Situationen."</p>
        </div>
        <div class="testimonial-author">
          <div class="author-avatar">👨‍👩‍👦</div>
          <div class="author-info">
            <h3>Familie Müller</h3>
            <p>Eltern eines 2-jährigen Kindes</p>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <div class="rating">
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
        </div>
        <div class="testimonial-content">
          <p class="quote">"Die Tipps zur Medienerziehung waren für uns ein Durchbruch. Wir haben klare Regeln etabliert
            und die Diskussionen über Bildschirmzeit sind deutlich weniger geworden."</p>
        </div>
        <div class="testimonial-author">
          <div class="author-avatar">👩‍👧‍👦</div>
          <div class="author-info">
            <h3>Sandra K.</h3>
            <p>Mutter von zwei Schulkindern</p>
          </div>
        </div>
      </div>

      <div class="testimonial">
        <div class="rating">
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star">★</span>
          <span class="star half">★</span>
        </div>
        <div class="testimonial-content">
          <p class="quote">"Als Vater eines Teenagers hatte ich oft das Gefühl, gegen Wände zu reden. Die
            Kommunikationstipps haben unsere Beziehung komplett verändert. Wir verstehen uns jetzt viel besser."</p>
        </div>
        <div class="testimonial-author">
          <div class="author-avatar">👨‍👧</div>
          <div class="author-info">
            <h3>Thomas Weber</h3>
            <p>Vater einer 15-jährigen Tochter</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommunitySection'
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.community-section {
  @include animations.scroll-fade-in;

  h2 {
    font-size: map.get(map.get(vars.$fonts, sizes), xxxl);
    font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);

    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        @include mixins.section-header($theme);
      }
    }
  }

  .community-content {
    margin-bottom: map.get(vars.$spacing, xxl);

    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, l);
      line-height: 1.8;
    }
  }

  .testimonials {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: map.get(vars.$spacing, xl);

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), desktop)) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: map.get(map.get(vars.$layout, breakpoints), tablet)) {
      grid-template-columns: 1fr;
    }

    .testimonial {
      position: relative;
      display: flex;
      flex-direction: column;
      transition: all 0.3s;
      height: 100%;

      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border-radius: map.get(map.get(vars.$layout, border-radius), large);
          border: 2px solid mixins.theme-color($theme, border-light);
          padding: map.get(vars.$spacing, xl);
          @include mixins.shadow('medium', $theme);
          transition: all 0.4s ease-out;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            border-radius: map.get(map.get(vars.$layout, border-radius), large);

            @if $theme =='dark' {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
            }

            @else {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent);
            }
          }

          &:hover {
            transition: all 0.3s;
            transform: scale(1.03);
            user-select: none;
            @include mixins.glow('green', 'medium', $theme);
            border-color: mixins.theme-color($theme, accent-green);
          }
        }
      }

      .rating {
        margin-bottom: map.get(vars.$spacing, m);
        z-index: 1;
        position: relative;

        .star {
          font-size: 1.5rem;
          margin-right: 2px;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, accent-yellow);
              text-shadow: 0 0 2px rgba(mixins.theme-color($theme, accent-yellow), 0.6);
            }
          }

          &.half {
            position: relative;

            &::after {
              content: "☆";
              position: absolute;
              left: 0;
              top: 0;
              width: 50%;
              overflow: hidden;

              @each $theme in ('light', 'dark') {
                .theme-#{$theme} & {
                  color: mixins.theme-color($theme, secondary-bg);
                }
              }
            }
          }
        }
      }

      .testimonial-content {
        flex: 1;
        margin-bottom: map.get(vars.$spacing, l);
        z-index: 1;
        position: relative;

        .quote {
          font-size: map.get(map.get(vars.$fonts, sizes), medium);
          line-height: 1.8;
          font-style: italic;
          position: relative;
          padding: 0 map.get(vars.$spacing, m);

          &::before,
          &::after {
            font-size: 1.5rem;
            position: absolute;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: rgba(mixins.theme-color($theme, accent-green), 0.4);
              }
            }
          }

          &::before {
            content: '"';
            left: 0;
            top: -5px;
          }

          &::after {
            content: '"';
            right: 0;
            bottom: -10px;
          }
        }
      }

      .testimonial-author {
        display: flex;
        align-items: center;
        z-index: 1;
        position: relative;

        .author-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: map.get(vars.$spacing, m);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;

          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: linear-gradient(135deg, mixins.theme-color($theme, accent-green), mixins.theme-color($theme, accent-teal));
              box-shadow: 0 3px 8px rgba(mixins.theme-color($theme, accent-green), 0.4);
            }
          }
        }

        .author-info {
          h3 {
            font-size: map.get(map.get(vars.$fonts, sizes), medium);
            margin-bottom: map.get(vars.$spacing, xxs);

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-primary);
              }
            }
          }

          p {
            font-size: map.get(map.get(vars.$fonts, sizes), small);
            margin-bottom: 0;

            @each $theme in ('light', 'dark') {
              .theme-#{$theme} & {
                color: mixins.theme-color($theme, text-secondary);
              }
            }
          }
        }
      }

      // Verschiedene Farbakzente für die Testimonials
      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @if $i ==1 {
                border-left: 4px solid mixins.theme-color($theme, accent-green);
              }

              @else if $i ==2 {
                border-left: 4px solid mixins.theme-color($theme, accent-teal);
              }

              @else if $i ==3 {
                border-left: 4px solid mixins.theme-color($theme, accent-lime);
              }
            }
          }
        }
      }
    }
  }
}
</style>