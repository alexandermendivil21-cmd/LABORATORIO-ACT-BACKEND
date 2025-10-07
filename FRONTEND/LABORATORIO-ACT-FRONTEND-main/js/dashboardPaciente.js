// js/dashboardPaciente.js
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const content = document.getElementById("content");
  const navLinks = Array.from(document.querySelectorAll(".nav-item"));

  if (!sidebar || !sidebarToggle || !content) {
    console.error("Elementos esenciales no encontrados en DOM");
    return;
  }

  // ---------- FUNCIONES ---------- //
  const isMobile = () => window.innerWidth <= 768;

  const openSidebar = () => {
    if (isMobile()) sidebar.style.transform = "translateX(0)";
    else sidebar.classList.remove("collapsed");
  };

  const closeSidebar = () => {
    if (isMobile()) sidebar.style.transform = "translateX(-100%)";
    else sidebar.classList.add("collapsed");
  };

const toggleSidebar = () => {
  if (isMobile()) {
    const current = getComputedStyle(sidebar).transform;
    if (current === "matrix(1, 0, 0, 1, 0, 0)" || current === "none") {
      closeSidebar();
    } else {
      openSidebar();
    }
  } else {
    sidebar.classList.toggle("collapsed");
  }
};


  const loadSection = (section) => {
    fetch(`views/${section}.html`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        content.style.transition = "opacity 0.25s ease";
        content.style.opacity = 0;
        setTimeout(() => {
          content.innerHTML = html;
          content.style.opacity = 1;
        }, 180);
      })
      .catch(err => {
        console.error("Error cargando vista", section, err);
        content.innerHTML = `<p style="color:crimson">Error al cargar la vista "${section}". Revisa la consola.</p>`;
      });
  };

  // ---------- EVENTOS ---------- //

  // Toggle sidebar
  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Click en links del sidebar
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // marcar activo
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // cargar sección
      const section = link.dataset.section || link.getAttribute("href").substring(1);
      loadSection(section);

      // cerrar sidebar en mobile al seleccionar link
      if (isMobile()) closeSidebar();
    });
  });

  // Ajustar sidebar al redimensionar
window.addEventListener("resize", () => {
  if (isMobile()) {
    closeSidebar();
  } else {
    sidebar.style.transform = "";
    sidebar.classList.remove("collapsed");
  }
});


  // ---------- CARGA INICIAL ---------- //
  loadSection("overview");
  if (isMobile()) {
    sidebar.style.transform = "translateX(-100%)"; // inicia cerrado en mobile
  } else {
    sidebar.classList.remove("collapsed"); // inicia abierto en desktop
  }
});
