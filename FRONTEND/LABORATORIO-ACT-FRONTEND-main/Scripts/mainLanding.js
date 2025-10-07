// mainLanding.js
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  // Animar todas las secciones al hacer scroll
  document.querySelectorAll("section, .service-item").forEach(el => {
    observer.observe(el);
  });

  // Efecto hover en íconos (rebote)
  document.querySelectorAll(".service-item i").forEach(icon => {
    icon.addEventListener("mouseenter", () => {
      icon.classList.add("bounce");
    });
    icon.addEventListener("animationend", () => {
      icon.classList.remove("bounce");
    });
  });
});
