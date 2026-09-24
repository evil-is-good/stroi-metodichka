/**
 * js/metal-connections.js
 * ============================================================
 * Калькулятор расчёта узлов (сварные швы)
 * ============================================================
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, getSteelProps)
 */

document.addEventListener('DOMContentLoaded', initConnections);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initConnections();
}

function initConnections() {
  // ============================================================
  // Ссылки на DOM-элементы
  // ============================================================
  const els = {
    steelGrade: document.getElementById('steelGrade'),
    electrode: document.getElementById('electrode'),
    Q: document.getElementById('Q'),
    QUnit: document.getElementById('QUnit'),
    tw: document.getElementById('tw'),
    twUnit: document.getElementById('twUnit'),
    tf: document.getElementById('tf'),
    tfUnit: document.getElementById('tfUnit'),
    h: document.getElementById('h'),
    hUnit: document.getElementById('hUnit'),
    kf: document.getElementById('kf'),
    kfUnit: document.getElementById('kfUnit'),
    rLw: document.getElementById('rLw'),
    rLwUnit: document.getElementById('rLwUnit'),
    rSigmaW: document.getElementById('rSigmaW'),
    rSigmaWUnit: document.getElementById('rSigmaWUnit'),
    rRwf: document.getElementById('rRwf'),
    rRwfUnit: document.getElementById('rRwfUnit'),
    rCheck: document.getElementById('rCheck'),
  };

  // ---- Константы стали ----
  const E = STEEL_CONSTANTS.E;

  // ============================================================
  // Конвертация единиц
  // ============================================================

  function toMm(value, unit) {
    switch (unit) {
      case 'см': return value * 10;
      case 'мм': default: return value;
    }
  }

  function toN(value, unit) {
    switch (unit) {
      case 'кН': return value * 1000;
      case 'Н': default: return value;
    }
  }

  const fmt = (v, d = 4) =>
    (v === 0 ? "0" : (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2)
      ? v.toExponential(d - 1) : v.toFixed(d));

  // ============================================================
  // Расчётное сопротивление сварного шва
  // ============================================================
  function getWeldResistance(electrode) {
    switch (electrode) {
      case 'E42': return 420e6; // Па
      case 'E46': return 460e6;
      case 'E50': return 500e6;
      case 'E55': return 550e6;
      default: return 460e6;
    }
  }

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    const Q = Math.max(0, toN(parseFloat(els.Q.value) || 0, els.QUnit.value));
    const tw = Math.max(1, toMm(parseFloat(els.tw.value) || 0, els.twUnit.value));
    const tf = Math.max(1, toMm(parseFloat(els.tf.value) || 0, els.tfUnit.value));
    const h = Math.max(10, toMm(parseFloat(els.h.value) || 0, els.hUnit.value));
    const kf = Math.max(1, toMm(parseFloat(els.kf.value) || 0, els.kfUnit.value));

    const electrode = els.electrode.value;
    const Rwf = getWeldResistance(electrode);
    const gammaC = 1.0;

    // Эффективная толщина шва
    const he = 0.7 * kf; // мм

    // Длина шва (приварка стенки к полке с двух сторон)
    const lw = h - 2 * tf; // мм

    // Напряжение в шве
    const sigmaW = Q / (2 * lw * he); // Па

    // Проверка условия
    const ok = sigmaW <= Rwf * gammaC;

    // Вывод результатов
    els.rLw.textContent = fmt(lw, 1); // мм
    els.rSigmaW.textContent = fmt(sigmaW / 1e6, 2); // МПа
    els.rRwf.textContent = fmt(Rwf / 1e6, 0); // МПа
    els.rCheck.textContent = ok ? "✓ Выполнено" : "✗ Не выполнено";
    els.rCheck.style.color = ok ? 'var(--success)' : 'var(--danger)';
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.Q, els.tw, els.tf, els.h, els.kf].forEach(el => {
      if (el) el.addEventListener(ev, update);
    });
  });
  [els.QUnit, els.twUnit, els.tfUnit, els.hUnit, els.kfUnit].forEach(el => {
    if (el) el.addEventListener('change', update);
  });
  els.steelGrade.addEventListener('change', update);
  els.electrode.addEventListener('change', update);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
}
