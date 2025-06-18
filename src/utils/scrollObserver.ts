// Scroll-Animationen mit IntersectionObserver

export function setupScrollObserver() {
  // mxXx: Verzögerung für das Hinzufügen der Klasse
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => { // mxXx: Verzögerung hinzugefügt
          entry.target.classList.add('visible');
        }, 150); // mxXx: 150ms Verzögerung
      }
    });
  }, { threshold: 0.1 });

  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    observer.observe(section);
  });

  return observer;
}

// Nach Routenwechsel aufrufen
export function resetScrollObserver() {
  setTimeout(() => {
    setupScrollObserver();
  }, 100);
}