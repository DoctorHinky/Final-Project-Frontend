// IntersectionObserver für Scroll-Animationen

export function setupScrollObserver() {
  // IntersectionObserver für Scroll-Animationen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  // Alle Sektionen beobachten
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    observer.observe(section);
  });

  return observer;
}

// Diese Funktion kann nach jedem Routenwechsel aufgerufen werden
export function resetScrollObserver() {
  // Kleine Verzögerung, um sicherzustellen, dass das DOM aktualisiert wurde
  setTimeout(() => {
    setupScrollObserver();
  }, 100);
}