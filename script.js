  // ========================================
  // 1. Filtrado de libros por etiquetas
  // ========================================
  document.addEventListener("DOMContentLoaded", () => {
  const tags = document.querySelectorAll(".tag");
  const libros = document.querySelectorAll(".libro");

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  // Aplicar filtro desde la URL si existe
  if (filterParam) {
    tags.forEach(tag => {
      if (tag.dataset.filter === filterParam) {
        tag.classList.add("active");
      }
    });

    libros.forEach(libro => {
      const category = libro.dataset.category;
      libro.classList.toggle("hidden", !category.includes(filterParam));
    });
  }

  // Manejo de clics en las etiquetas
  tags.forEach(tag => {
    tag.addEventListener("click", () => {
      const isActive = tag.classList.contains("active");
      tags.forEach(t => t.classList.remove("active"));

      if (isActive) {
        // Si ya está activa, se reinicia el filtro (muestra todos)
        libros.forEach(libro => libro.classList.remove("hidden"));
      } else {
        tag.classList.add("active");
        const filter = tag.dataset.filter;

        libros.forEach(libro => {
          const category = libro.dataset.category;
          libro.classList.toggle("hidden", !category.includes(filter));
        });
      }
    });
  });
});

 // ========================================
//  2. Menu de Categorías
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const categorias = document.querySelectorAll('.categoria');

  categorias.forEach(categoria => {
    const header = categoria.querySelector('.categoria-header');
    const icono = categoria.querySelector('.icono');
    const subcategorias = categoria.querySelector('.subcategorias');

    header.addEventListener('click', () => {
      const isOpen = categoria.classList.contains('open');

      // Cerrar todos los demás
      document.querySelectorAll('.categoria').forEach(cat => {
        cat.classList.remove('open');
        cat.querySelector('.subcategorias').style.display = 'none';
        cat.querySelector('.icono').style.transform = 'rotate(0deg)';
      });

      // Si estaba cerrado, abrir este
      if (!isOpen) {
        categoria.classList.add('open');
        subcategorias.style.display = 'block';
        icono.style.transform = 'rotate(90deg)';
      }
    });
  });
});
