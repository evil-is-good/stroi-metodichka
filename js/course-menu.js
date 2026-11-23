"use strict";

// ============================================================
// Верхнее меню методички: выпадающий список «Этапы»
// ============================================================

(function () {
  function initCourseMenu() {
    const menu = document.querySelector('.course-menu');
    if (!menu) return;

    const dropdowns = Array.from(menu.querySelectorAll('.course-menu__dropdown'));

    if (dropdowns.length) {
      const close = (dropdown) => {
        const toggle = dropdown.querySelector('.course-menu__toggle');
        dropdown.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      };

      const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
          if (dropdown !== except) close(dropdown);
        });
      };

      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.course-menu__toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (event) => {
          event.stopPropagation();
          const isOpen = !dropdown.classList.contains('is-open');
          closeAll(dropdown);
          dropdown.classList.toggle('is-open', isOpen);
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        dropdown.querySelectorAll('.course-menu__menu a').forEach((link) => {
          link.addEventListener('click', () => close(dropdown));
        });
      });

      document.addEventListener('click', (event) => {
        if (event.target.closest && event.target.closest('.course-menu__dropdown')) return;
        closeAll();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const open = dropdowns.find((dropdown) => dropdown.classList.contains('is-open'));
        if (!open) return;
        close(open);
        const toggle = open.querySelector('.course-menu__toggle');
        if (toggle) toggle.focus();
      });
    }

    // Высота меню нужна 3D-странице: под ним располагается сцена.
    const syncHeight = () => {
      if (document.body.classList.contains('has-course-menu')) {
        document.documentElement.style.setProperty(
          '--course-menu-h',
          menu.offsetHeight + 'px'
        );
      }
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);

    if (window.ResizeObserver) {
      new ResizeObserver(syncHeight).observe(menu);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCourseMenu);
  } else {
    initCourseMenu();
  }
})();
