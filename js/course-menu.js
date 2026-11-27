"use strict";

// ============================================================
// Верхнее меню методички — единый источник для всех страниц
// ============================================================
// Чтобы изменить меню, отредактируйте MENU_HTML ниже.
// В data-path указывается путь от корня сайта; готовые href
// и активные пункты подставляются автоматически.

(function () {
  const MENU_HTML = `
  <div class="course-menu__inner">
    <a class="course-menu__brand" data-path="subjects/calcs/metal-beam-cell.html" aria-label="Обзор курсовой работы">
      <span class="course-menu__code">КМ-01</span>
      <span class="course-menu__name">Стальная балочная клетка</span>
    </a>
    <nav class="course-menu__nav" aria-label="Меню методички">
      <a class="course-menu__link" data-path="subjects/3d_view.html">Сборка</a>
      <a class="course-menu__link" data-path="subjects/what_to_do.html">А что делать?</a>

      <div class="course-menu__dropdown">
        <button class="course-menu__link course-menu__toggle" type="button" aria-expanded="false" aria-controls="procedureMenu" aria-haspopup="true">
          Этапы <span class="course-menu__chev" aria-hidden="true">▾</span>
        </button>
        <div class="course-menu__menu course-menu__menu--stages" id="procedureMenu">
          <div class="course-menu__menu-head">Порядок расчёта</div>

          <div class="course-menu__menu-head course-menu__menu-head--group">1. Перекрытие</div>
          <a class="course-menu__item" data-path="subjects/procedure/beam-cell-normal-type.html">
            <span class="course-menu__item-num">1.1</span>
            <span class="course-menu__item-text"><b>Настил балочной клетки</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/deck-normal-type.html">
            <span class="course-menu__item-num">1.2</span>
            <span class="course-menu__item-text"><b>Компоновка нормального типа</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/deck-welds.html">
            <span class="course-menu__item-num">1.3</span>
            <span class="course-menu__item-text"><b>Швы настила</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/floor-beams-normal-type.html">
            <span class="course-menu__item-num">1.4</span>
            <span class="course-menu__item-text"><b>Балки настила</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/beam-cell-complex-type.html">
            <span class="course-menu__item-num">1.5</span>
            <span class="course-menu__item-text"><b>Усложнённый тип</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/floor-beams-complex-type.html">
            <span class="course-menu__item-num">1.6</span>
            <span class="course-menu__item-text"><b>Балки настила (усложн.)</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/aux-beams.html">
            <span class="course-menu__item-num">1.7</span>
            <span class="course-menu__item-text"><b>Вспомогательные балки</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/comparison.html">
            <span class="course-menu__item-num">1.8</span>
            <span class="course-menu__item-text"><b>Сравнение вариантов</b></span>
          </a>

          <div class="course-menu__menu-head course-menu__menu-head--group">2. Главная балка</div>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-section.html">
            <span class="course-menu__item-num">2.1</span>
            <span class="course-menu__item-text"><b>Сечение главной балки</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-checks.html">
            <span class="course-menu__item-num">2.2</span>
            <span class="course-menu__item-text"><b>Проверочный расчёт</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-variable.html">
            <span class="course-menu__item-num">2.3</span>
            <span class="course-menu__item-text"><b>Балка переменного сечения</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-stability.html">
            <span class="course-menu__item-num">2.4</span>
            <span class="course-menu__item-text"><b>Общая устойчивость</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-reduced-stress.html">
            <span class="course-menu__item-num">2.5</span>
            <span class="course-menu__item-text"><b>Приведённые напряжения</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-web-stability.html">
            <span class="course-menu__item-num">2.6</span>
            <span class="course-menu__item-text"><b>Местная устойчивость стенки</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/stiffener.html">
            <span class="course-menu__item-num">2.7</span>
            <span class="course-menu__item-text"><b>Рёбра жёсткости</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/bearing-stiffener.html">
            <span class="course-menu__item-num">2.8</span>
            <span class="course-menu__item-text"><b>Опорные рёбра</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/main-beam-flange-welds.html">
            <span class="course-menu__item-num">2.9</span>
            <span class="course-menu__item-text"><b>Швы поясов балки</b></span>
          </a>

          <div class="course-menu__menu-head course-menu__menu-head--group">3. Колонна</div>
          <a class="course-menu__item" data-path="subjects/procedure/column-length.html">
            <span class="course-menu__item-num">3.1</span>
            <span class="course-menu__item-text"><b>Длина колонны</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/column-section.html">
            <span class="course-menu__item-num">3.2</span>
            <span class="course-menu__item-text"><b>Сечение стержня колонны</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/column-flange-welds.html">
            <span class="course-menu__item-num">3.3</span>
            <span class="course-menu__item-text"><b>Швы поясов колонны</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/column-cap.html">
            <span class="course-menu__item-num">3.4</span>
            <span class="course-menu__item-text"><b>Оголовок колонны</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/column-base.html">
            <span class="course-menu__item-num">3.5</span>
            <span class="course-menu__item-text"><b>База колонны</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/column-base-traverse.html">
            <span class="course-menu__item-num">3.6</span>
            <span class="course-menu__item-text"><b>Траверса</b></span>
          </a>
          <a class="course-menu__item" data-path="subjects/procedure/traverse-welds.html">
            <span class="course-menu__item-num">3.7</span>
            <span class="course-menu__item-text"><b>Швы траверсы</b></span>
          </a>

          <a class="course-menu__menu-foot" data-path="subjects/procedure/index.html">Все этапы <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <div class="course-menu__dropdown">
        <button class="course-menu__link course-menu__toggle" type="button" aria-expanded="false" aria-controls="stagesMenu" aria-haspopup="true">
          Калькуляторы <span class="course-menu__chev" aria-hidden="true">▾</span>
        </button>
        <div class="course-menu__menu" id="stagesMenu">
          <div class="course-menu__menu-head">Калькуляторы</div>
          <a class="course-menu__item" data-path="subjects/calcs/metal-deck.html">
            <span class="course-menu__item-num">01</span>
            <span class="course-menu__item-text"><b>Настил</b><small>толщина и пролёт</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/calcs/metal-floor-beam.html">
            <span class="course-menu__item-num">02</span>
            <span class="course-menu__item-text"><b>Балка настила</b><small>подбор сечения</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/calcs/metal-main-beam.html">
            <span class="course-menu__item-num">03</span>
            <span class="course-menu__item-text"><b>Главная балка</b><small>нагрузки и сечение</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/calcs/metal-column.html">
            <span class="course-menu__item-num">04</span>
            <span class="course-menu__item-text"><b>Колонна</b><small>устойчивость</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/calcs/metal-connections.html">
            <span class="course-menu__item-num">05</span>
            <span class="course-menu__item-text"><b>Узлы</b><small>сварка и болты</small></span>
          </a>
          <a class="course-menu__menu-foot" data-path="subjects/calcs/metal-beam-cell.html">Все калькуляторы <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <div class="course-menu__dropdown">
        <button class="course-menu__link course-menu__toggle" type="button" aria-expanded="false" aria-controls="normsMenu" aria-haspopup="true">
          Нормы <span class="course-menu__chev" aria-hidden="true">▾</span>
        </button>
        <div class="course-menu__menu" id="normsMenu">
          <div class="course-menu__menu-head">СП и ГОСТ</div>
          <a class="course-menu__item" data-path="subjects/norms/sp_16_13330_7-3.html">
            <span class="course-menu__item-num">7.3</span>
            <span class="course-menu__item-text"><b>Устойчивость стенок</b><small>СП 16.13330.2017</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/sp_16_13330_14-1-7-8.html">
            <span class="course-menu__item-num">14</span>
            <span class="course-menu__item-text"><b>Угловые швы</b><small>пп. 14.1.7–14.1.8</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/sp_16_13330_v.html">
            <span class="course-menu__item-num">В</span>
            <span class="course-menu__item-text"><b>Сопротивления стали</b><small>приложение В</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/sp_16_13330_g.html">
            <span class="course-menu__item-num">Г</span>
            <span class="course-menu__item-text"><b>Материалы соединений</b><small>приложение Г</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/sp_16_13330_d.html">
            <span class="course-menu__item-num">Д</span>
            <span class="course-menu__item-text"><b>Коэффициенты φ</b><small>приложение Д</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/gost_82-70.html">
            <span class="course-menu__item-num">82</span>
            <span class="course-menu__item-text"><b>Широкополосный прокат</b><small>ГОСТ 82-70</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/norms/steel-properties.html">
            <span class="course-menu__item-num">С</span>
            <span class="course-menu__item-text"><b>Свойства стали</b><small>характеристики</small></span>
          </a>
        </div>
      </div>

      <div class="course-menu__dropdown">
        <button class="course-menu__link course-menu__toggle" type="button" aria-expanded="false" aria-controls="moreMenu" aria-haspopup="true">
          Прочее <span class="course-menu__chev" aria-hidden="true">▾</span>
        </button>
        <div class="course-menu__menu" id="moreMenu">
          <div class="course-menu__menu-head">Дополнительно</div>
          <a class="course-menu__item" data-path="subjects/etc/first_grout.html">
            <span class="course-menu__item-num">01</span>
            <span class="course-menu__item-text"><b>Первая группа</b><small>предельные состояния</small></span>
          </a>
          <a class="course-menu__item" data-path="subjects/etc/second_group.html">
            <span class="course-menu__item-num">02</span>
            <span class="course-menu__item-text"><b>Вторая группа</b><small>предельные состояния</small></span>
          </a>
        </div>
      </div>
    </nav>

  </div>
`;

  // Страницы раздела «А что делать?»
  const WTD_PAGES = new Set([
    "what_to_do.html",
    "first_grout.html",
    "second_group.html",
    "steel-properties.html",
    "ibeam-assortment.html",
  ]);

  // Страницы калькуляторов
  const CALC_PAGES = new Set([
    "metal-deck.html",
    "metal-floor-beam.html",
    "metal-main-beam.html",
    "metal-column.html",
    "metal-connections.html",
  ]);

  // Нормативные документы, для которых активна кнопка «Нормы»
  const NORMS_PAGES = new Set([
    "gost_103-76.html",
    "gost_82-70.html",
    "sp_16_13330_7-3.html",
    "sp_16_13330_14-1-7-8.html",
    "sp_16_13330_v.html",
    "sp_16_13330_g.html",
    "sp_16_13330_d.html",
  ]);

  function siteRoot() {
    const loc = new URL(window.location.href);
    const index = loc.pathname.indexOf("/subjects/");
    const rootPath = index >= 0
      ? loc.pathname.slice(0, index + 1)
      : loc.pathname.slice(0, loc.pathname.lastIndexOf("/") + 1);
    return { loc, root: new URL(rootPath, loc.href) };
  }

  function renderMenu() {
    const mount = document.querySelector("[data-course-menu]");
    if (!mount) return null;

    const { loc, root } = siteRoot();
    const absoluteUrl = (path) => new URL(path, root).href;
    const absolutePath = (path) => new URL(path, root).pathname;

    mount.innerHTML = MENU_HTML;

    if (mount.classList.contains("course-menu--fixed")) {
      document.body.classList.add("has-course-menu");
    }

    const links = Array.from(mount.querySelectorAll("[data-path]"));
    links.forEach((link) => {
      const path = link.getAttribute("data-path");
      link.setAttribute("href", absoluteUrl(path));
      link.setAttribute("data-target-path", absolutePath(path));
    });

    const page = decodeURIComponent(loc.pathname.split("/").pop() || "");

    const markLink = (link) => {
      link.classList.add("course-menu__link--active");
      link.setAttribute("aria-current", "page");
    };

    const markItem = (item) => {
      item.classList.add("course-menu__item--active");
      item.setAttribute("aria-current", "page");
    };

    const findLink = (path) =>
      links.find((link) => link.getAttribute("data-path") === path);

    // Точное совпадение со страницей
    links.forEach((link) => {
      if (link.getAttribute("data-target-path") !== loc.pathname) return;
      if (link.classList.contains("course-menu__item")) {
        markItem(link);
      } else if (link.classList.contains("course-menu__link")) {
        markLink(link);
      }
    });

    // Подразделы «А что делать?»
    if (WTD_PAGES.has(page)) {
      const link = findLink("subjects/what_to_do.html");
      if (link) markLink(link);
    }

    // Активная кнопка «Калькуляторы»
    if (CALC_PAGES.has(page) || page === "metal-beam-cell.html") {
      const toggle = mount.querySelector('[aria-controls="stagesMenu"]');
      if (toggle) toggle.classList.add("course-menu__link--active");
    }

    // Активная кнопка «Нормы»
    if (NORMS_PAGES.has(page)) {
      const toggle = mount.querySelector('[aria-controls="normsMenu"]');
      if (toggle) toggle.classList.add("course-menu__link--active");
    }

    // Активная кнопка «Этапы» на оглавлении порядка расчёта
    if (page === "index.html" && loc.pathname.indexOf("/subjects/procedure/") >= 0) {
      const toggle = mount.querySelector('[aria-controls="procedureMenu"]');
      if (toggle) toggle.classList.add("course-menu__link--active");
    }

    return mount;
  }

  function initCourseMenu(menu) {
    const dropdowns = Array.from(menu.querySelectorAll(".course-menu__dropdown"));

    if (dropdowns.length) {
      const close = (dropdown) => {
        const toggle = dropdown.querySelector(".course-menu__toggle");
        dropdown.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      };

      const closeAll = (except) => {
        dropdowns.forEach((dropdown) => {
          if (dropdown !== except) close(dropdown);
        });
      };

      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".course-menu__toggle");
        if (!toggle) return;

        toggle.addEventListener("click", (event) => {
          event.stopPropagation();
          const isOpen = !dropdown.classList.contains("is-open");
          closeAll(dropdown);
          dropdown.classList.toggle("is-open", isOpen);
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        dropdown.querySelectorAll(".course-menu__menu a").forEach((link) => {
          link.addEventListener("click", () => close(dropdown));
        });
      });

      document.addEventListener("click", (event) => {
        if (event.target.closest && event.target.closest(".course-menu__dropdown")) return;
        closeAll();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const open = dropdowns.find((dropdown) => dropdown.classList.contains("is-open"));
        if (!open) return;
        close(open);
        const toggle = open.querySelector(".course-menu__toggle");
        if (toggle) toggle.focus();
      });
    }

    // Высота меню нужна 3D-странице: под ним располагается сцена.
    const syncHeight = () => {
      if (document.body.classList.contains("has-course-menu")) {
        document.documentElement.style.setProperty(
          "--course-menu-h",
          menu.offsetHeight + "px"
        );
      }
    };

    syncHeight();
    window.addEventListener("resize", syncHeight);

    if (window.ResizeObserver) {
      new ResizeObserver(syncHeight).observe(menu);
    }
  }

  function boot() {
    const menu = renderMenu();
    if (menu) initCourseMenu(menu);
  }

  if (document.querySelector("[data-course-menu]")) {
    boot();
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
