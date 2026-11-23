"use strict";

// ============================================================
// Сортамент двутавров: поиск профиля и сворачивание таблиц
// ============================================================

(function () {
  // Латинские буквы и частые транслитерации → обозначения ГОСТ
  const CHAR_MAP = {
    b: "б",
    w: "ш",
    k: "к",
    c: "с",
    y: "у",
    d: "д",
    s: "с",
    u: "у"
  };

  function normalize(value) {
    let text = String(value).toLowerCase().trim()
      .replace(/sh/g, "ш")
      .replace(/zh/g, "ж")
      .replace(/ch/g, "ч")
      .replace(/yu/g, "ю")
      .replace(/ya/g, "я");

    text = text.replace(/[a-z]/g, (char) => CHAR_MAP[char] || char);

    return text
      .replace(/\./g, ",")
      .replace(/[\s\-_]/g, "");
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function init() {
    const figures = Array.from(document.querySelectorAll(".reference-table--wide[id^='type-']"));
    const input = document.getElementById("ibeam-query");
    const result = document.getElementById("ibeam-result");
    const clearButton = document.querySelector("[data-search-clear]");
    const submitButton = document.querySelector("[data-search-submit]");
    const collapseAllButton = document.querySelector("[data-collapse-all]");
    const searchSection = document.querySelector(".ibeam-search");

    if (!figures.length || !input || !result || !searchSection) return;

    const suggestions = element("div", "ibeam-search__suggestions");
    suggestions.id = "ibeam-suggestions";
    suggestions.hidden = true;
    searchSection.append(suggestions);

    const rows = [];
    const byNumber = new Map();

    figures.forEach((figure) => {
      const type = figure.dataset.type || figure.id.replace("type-", "").toUpperCase();
      const titleNode = figure.querySelector(".reference-table__title");
      const title = titleNode ? titleNode.textContent.trim() : "";
      const table = figure.querySelector("table");
      if (!table) return;

      table.querySelectorAll("tbody tr").forEach((row) => {
        const numberNode = row.querySelector("th");
        if (!numberNode) return;

        const item = {
          num: numberNode.textContent.trim(),
          norm: normalize(numberNode.textContent),
          type,
          title,
          row,
          figure,
          table,
          cells: Array.from(row.children).slice(1).map((cell) => cell.textContent.trim())
        };

        rows.push(item);
        byNumber.set(item.norm, item);
      });
    });

    let activeMatch = null;
    let highlightTimer = null;

    function setCollapsed(figure, collapsed) {
      if (!figure) return;

      figure.classList.toggle("is-collapsed", collapsed);

      const toggle = figure.querySelector("[data-collapse-toggle]");
      const label = toggle ? toggle.querySelector(".reference-table__toggle-label") : null;
      const body = figure.querySelector(".reference-table__body");

      if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
      if (label) label.textContent = collapsed ? "Развернуть" : "Свернуть";

      if (body) {
        body.inert = collapsed;
        if (collapsed) {
          body.setAttribute("aria-hidden", "true");
        } else {
          body.removeAttribute("aria-hidden");
        }
      }
    }

    function updateCollapseAll() {
      if (!collapseAllButton) return;

      const allCollapsed = figures.every((figure) => figure.classList.contains("is-collapsed"));
      collapseAllButton.dataset.mode = allCollapsed ? "expand" : "collapse";
      collapseAllButton.textContent = allCollapsed
        ? "Развернуть все таблицы"
        : "Свернуть все таблицы";
    }

    function hideResult() {
      activeMatch = null;
      result.hidden = true;
      result.innerHTML = "";
    }

    function hideSuggestions() {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
    }

    function reveal(match) {
      setCollapsed(match.figure, false);
      updateCollapseAll();

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          match.figure.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });

      document.querySelectorAll("tr.is-highlighted").forEach((row) => {
        row.classList.remove("is-highlighted");
      });

      match.row.classList.add("is-highlighted");
      clearTimeout(highlightTimer);
      highlightTimer = window.setTimeout(() => {
        match.row.classList.remove("is-highlighted");
      }, 2800);
    }

    function showResult(match) {
      activeMatch = match;
      result.hidden = false;
      result.innerHTML = "";

      const card = element("div", "ibeam-result__card");

      const head = element("div", "ibeam-result__head");
      const titles = element("div", "ibeam-result__titles");
      titles.append(
        element("span", "ibeam-result__eyebrow", "Найден профиль · тип " + match.type)
      );

      const heading = element("h3", "ibeam-result__title", match.num);
      heading.append(element("span", undefined, match.title));
      titles.append(heading);

      const tools = element("div", "ibeam-result__tools");
      const gotoButton = element("button", "ibeam-result__goto", "Показать в таблице");
      gotoButton.type = "button";
      gotoButton.addEventListener("click", () => reveal(match));

      const closeButton = element("button", "ibeam-result__close", "×");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Закрыть результат");
      closeButton.addEventListener("click", hideResult);

      tools.append(gotoButton, closeButton);
      head.append(titles, tools);

      const scroll = element("div", "ibeam-result__scroll");
      scroll.tabIndex = 0;
      scroll.setAttribute("role", "region");
      scroll.setAttribute("aria-label", "Характеристики профиля " + match.num);

      const table = document.createElement("table");
      table.className = "spec-table spec-table--wide spec-table--ibeam";

      const thead = match.table.querySelector("thead");
      if (thead) table.append(thead.cloneNode(true));

      const body = document.createElement("tbody");
      const resultRow = match.row.cloneNode(true);
      resultRow.classList.remove("is-highlighted");
      body.append(resultRow);
      table.append(body);

      scroll.append(table);
      card.append(head, scroll);

      const hint = element(
        "p",
        "ibeam-result__hint",
        "Строку можно прокручивать по горизонтали →"
      );
      card.append(hint);

      result.append(card);
    }

    function searchMatches(query) {
      const starts = [];
      const contains = [];

      rows.forEach((row) => {
        if (row.norm.startsWith(query)) {
          starts.push(row);
        } else if (row.norm.includes(query)) {
          contains.push(row);
        }
      });

      return starts.concat(contains);
    }

    function renderSuggestions(matches) {
      suggestions.innerHTML = "";

      if (!matches.length) {
        suggestions.append(
          element(
            "p",
            "ibeam-search__empty",
            "Профиль не найден. Проверьте обозначение, например 30Ш2."
          )
        );
        suggestions.hidden = false;
        return;
      }

      const fragment = document.createDocumentFragment();

      matches.slice(0, 8).forEach((match) => {
        const button = element("button", "ibeam-suggestion");
        button.type = "button";
        button.append(
          element("b", undefined, match.num),
          element("span", undefined, match.type + " · " + match.cells[0] + "×" + match.cells[1] + " мм")
        );

        button.addEventListener("click", () => {
          input.value = match.num;
          clearButton.hidden = false;
          hideSuggestions();
          showResult(match);
          input.focus();
        });

        fragment.append(button);
      });

      suggestions.append(fragment);
      suggestions.hidden = false;
    }

    function updateSearch() {
      const raw = input.value;
      const query = normalize(raw);

      clearButton.hidden = raw.length === 0;

      if (!query) {
        hideResult();
        hideSuggestions();
        return;
      }

      const exact = byNumber.get(query);
      if (exact) {
        hideSuggestions();
        showResult(exact);
        return;
      }

      hideResult();
      renderSuggestions(searchMatches(query));
    }

    input.addEventListener("input", updateSearch);

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const query = normalize(input.value);
        if (!query) return;

        const exact = byNumber.get(query);
        if (exact) {
          input.value = exact.num;
          clearButton.hidden = false;
          hideSuggestions();
          showResult(exact);
          return;
        }

        const matches = searchMatches(query);
        if (matches.length === 1) {
          input.value = matches[0].num;
          clearButton.hidden = false;
          hideSuggestions();
          showResult(matches[0]);
        } else {
          renderSuggestions(matches);
          const first = suggestions.querySelector(".ibeam-suggestion");
          if (first) first.focus();
        }
      }

      if (event.key === "Escape") {
        input.value = "";
        clearSearch();
      }
    });

    function clearSearch() {
      input.value = "";
      clearButton.hidden = true;
      hideSuggestions();
      hideResult();
      input.focus();
    }

    if (clearButton) clearButton.addEventListener("click", clearSearch);

    if (submitButton) {
      submitButton.addEventListener("click", () => {
        const query = normalize(input.value);
        if (!query) {
          input.focus();
          return;
        }

        const exact = byNumber.get(query);
        if (exact) {
          input.value = exact.num;
          clearButton.hidden = false;
          hideSuggestions();
          showResult(exact);
          return;
        }

        const matches = searchMatches(query);
        if (matches.length === 1) {
          input.value = matches[0].num;
          clearButton.hidden = false;
          hideSuggestions();
          showResult(matches[0]);
        } else {
          renderSuggestions(matches);
        }
      });
    }

    figures.forEach((figure) => {
      const toggle = figure.querySelector("[data-collapse-toggle]");
      if (!toggle) return;

      toggle.addEventListener("click", () => {
        const collapsed = !figure.classList.contains("is-collapsed");
        setCollapsed(figure, collapsed);
        updateCollapseAll();
      });
    });

    if (collapseAllButton) {
      collapseAllButton.addEventListener("click", () => {
        const expand = collapseAllButton.dataset.mode === "expand";
        const root = document.documentElement;

        root.classList.add("no-collapse-transition");
        figures.forEach((figure) => setCollapsed(figure, !expand));
        void root.offsetHeight;
        window.requestAnimationFrame(() => root.classList.remove("no-collapse-transition"));

        updateCollapseAll();
      });
    }

    document.querySelectorAll("a[href^='#type-']").forEach((link) => {
      link.addEventListener("click", () => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          setCollapsed(target, false);
          updateCollapseAll();
        }
      });
    });

    function expandFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      const target = document.getElementById(id);
      if (target && target.classList.contains("reference-table--wide")) {
        setCollapsed(target, false);
        updateCollapseAll();
      }
    }

    window.addEventListener("hashchange", expandFromHash);
    expandFromHash();
    updateCollapseAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
