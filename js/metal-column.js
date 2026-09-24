/**
 * js/metal-column.js
 * ============================================================
 * Калькулятор расчёта колонны
 * ============================================================
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, getSteelProps)
 */

document.addEventListener('DOMContentLoaded', initColumn);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initColumn();
}

function initColumn() {
  // ============================================================
  // Ссылки на DOM-элементы
  // ============================================================
  const els = {
    steelGrade: document.getElementById('steelGrade'),
    H: document.getElementById('H'),
    HUnit: document.getElementById('HUnit'),
    N: document.getElementById('N'),
    NUnit: document.getElementById('NUnit'),
    M: document.getElementById('M'),
    MUnit: document.getElementById('MUnit'),
    lambda: document.getElementById('lambda'),
    rA: document.getElementById('rA'),
    rAUnit: document.getElementById('rAUnit'),
    rPhi: document.getElementById('rPhi'),
    rSigma: document.getElementById('rSigma'),
    rSigmaUnit: document.getElementById('rSigmaUnit'),
    rCheck: document.getElementById('rCheck'),
  };

  // ---- Константы стали ----
  const E = STEEL_CONSTANTS.E;

  // ============================================================
  // Конвертация единиц
  // ============================================================

  function toMeters(value, unit) {
    switch (unit) {
      case 'мм': return value / 1000;
      case 'см': return value / 100;
      case 'м': default: return value;
    }
  }

  function toN(value, unit) {
    switch (unit) {
      case 'кН': return value * 1000;
      case 'Н': default: return value;
    }
  }

  function toNm(value, unit) {
    switch (unit) {
      case 'Н·м': return value;
      case 'кН·м': default: return value * 1000;
    }
  }

  const fmt = (v, d = 4) =>
    (v === 0 ? "0" : (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2)
      ? v.toExponential(d - 1) : v.toFixed(d));

  // ============================================================
  // Коэффициент устойчивости (упрощённая таблица)
  // ============================================================
  function getStabilityFactor(lambdaVal, grade) {
    // Упрощённая интерполяция для С345, тип кривой «а»
    // Табличные значения из СП 16.13330.2017 Таб. Д.1
    const table = [
      { l: 10, phi: 0.978 },
      { l: 20, phi: 0.956 },
      { l: 30, phi: 0.932 },
      { l: 40, phi: 0.908 },
      { l: 50, phi: 0.880 },
      { l: 60, phi: 0.848 },
      { l: 70, phi: 0.812 },
      { l: 80, phi: 0.772 },
      { l: 90, phi: 0.728 },
      { l: 100, phi: 0.680 },
      { l: 110, phi: 0.630 },
      { l: 120, phi: 0.578 },
      { l: 130, phi: 0.526 },
      { l: 140, phi: 0.476 },
      { l: 150, phi: 0.428 },
      { l: 160, phi: 0.384 },
      { l: 170, phi: 0.344 },
      { l: 180, phi: 0.308 },
      { l: 190, phi: 0.276 },
      { l: 200, phi: 0.248 },
    ];

    if (lambdaVal <= 10) return 0.978;
    if (lambdaVal >= 200) return 0.248;

    for (let i = 0; i < table.length - 1; i++) {
      if (lambdaVal >= table[i].l && lambdaVal <= table[i + 1].l) {
        const t = (lambdaVal - table[i].l) / (table[i + 1].l - table[i].l);
        return table[i].phi + t * (table[i + 1].phi - table[i].phi);
      }
    }
    return 0.5;
  }

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    const H = Math.max(1e-3, toMeters(parseFloat(els.H.value) || 0, els.HUnit.value));
    const N = Math.max(0, toN(parseFloat(els.N.value) || 0, els.NUnit.value));
    const M = Math.max(0, toNm(parseFloat(els.M.value) || 0, els.MUnit.value));
    const lambdaVal = Math.max(10, parseFloat(els.lambda.value) || 100);

    const grade = els.steelGrade.value;
    const props = getSteelProps(grade, 20);
    const Ry = props ? props.Ry2 * 1e6 : 345e6; // Па
    const gammaC = 1.0;

    // Коэффициент устойчивости
    const phi = getStabilityFactor(lambdaVal, grade);

    // Требуемая площадь сечения
    const A = N / (Ry * gammaC * phi); // м²

    // Напряжение
    const sigma = N / (A * phi); // Па

    // Проверка условия
    const ok = sigma <= Ry * gammaC;

    // Вывод результатов
    els.rA.textContent = fmt(A * 1e4, 2); // см²
    els.rPhi.textContent = fmt(phi, 4);
    els.rSigma.textContent = fmt(sigma / 1e6, 2); // МПа
    els.rCheck.textContent = ok ? "✓ Выполнено" : "✗ Не выполнено";
    els.rCheck.style.color = ok ? 'var(--success)' : 'var(--danger)';
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.H, els.N, els.M, els.lambda].forEach(el => {
      if (el) el.addEventListener(ev, update);
    });
  });
  [els.HUnit, els.NUnit, els.MUnit].forEach(el => {
    if (el) el.addEventListener('change', update);
  });
  els.steelGrade.addEventListener('change', update);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
}
