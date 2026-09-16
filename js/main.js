"use strict";

// ============================================================
// Навигация и анимации для сайта методических укаданий
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initTabs();
});

// ---- Анимация появления элементов ----
function initAnimations() {
  const items = document.querySelectorAll('.animate-in');
  items.forEach(el => {
    el.style.opacity = '0';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => observer.observe(el));
}

// ---- Табы на странице курсовой ----
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sections.forEach(sec => {
        sec.style.display = sec.dataset.section === target ? 'block' : 'none';
      });
    });
  });
}
