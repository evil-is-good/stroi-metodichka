/**
 * js/metal-floor-beam.js
 * ============================================================
 * Калькулятор расчёта балки настила
 * ============================================================
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, getSteelProps)
 */

document.addEventListener('DOMContentLoaded', initFloorBeam);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initFloorBeam();
}

function initFloorBeam() {
  // ============================================================
  // Ссылки на DOM-элементы
  // ============================================================
  const els = {
    steelGrade: document.getElementById('steelGrade'),
    l: document.getElementById('l'),
    lUnit: document.getElementById('lUnit'),
    a: document.getElementById('a'),
    aUnit: document.getElementById('aUnit'),
    qn: document.getElementById('qn'),
    qnUnit: document.getElementById('qnUnit'),
    q: document.getElementById('q'),
    qUnit: document.getElementById('qUnit'),
    rM: document.getElementById('rM'),
    rMUnit: document.getElementById('rMUnit'),
    rQ: document.getElementById('rQ'),
    rQUnit: document.getElementById('rQUnit'),
    rWx: document.getElementById('rWx'),
    rWxUnit: document.getElementById('rWxUnit'),
    rW: document.getElementById('rW'),
    rWUnit: document.getElementById('rWUnit'),
    rU: document.getElementById('rU'),
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

  function toPa(value, unit) {
    // кПа и кН/м² — одно и то же
    return value * 1000;
  }

  const fmt = (v, d = 4) =>
    (v === 0 ? "0" : (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2)
      ? v.toExponential(d - 1) : v.toFixed(d));

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    const l = Math.max(1e-3, toMeters(parseFloat(els.l.value) || 0, els.lUnit.value));
    const a = Math.max(0.1, toMeters(parseFloat(els.a.value) || 0, els.aUnit.value));
    const q = Math.max(0, toPa(parseFloat(els.q.value) || 0, els.qUnit.value));

    // Нагрузка на балку (линейная): q_l = q * a
    const qLin = q * a; // Н/м

    // Момент: M = qLin * l² / 8
    const Mmax = qLin * l * l / 8; // Н·м

    // Поперечная сила: Q = qLin * l / 2
    const Qmax = qLin * l / 2; // Н

    // Требуемый момент сопротивления
    const grade = els.steelGrade.value;
    const props = getSteelProps(grade, 20); // примерная толщина
    const Ry = props ? props.Ry2 * 1e6 : 345e6; // Па
    const gammaC = 1.0;
    const Wx = Mmax / (Ry * gammaC); // м³

    // Прогиб: w = 5 * qLin * l⁴ / (384 * E * Ix)
    // Для подбора — требуемый момент инерции
    const n0 = 250; // допустимый прогиб l/250
    const wLimit = l / n0;
    const IxReq = 5 * qLin * Math.pow(l, 4) / (384 * E * wLimit); // м⁴

    // Вывод результатов
    els.rM.textContent = fmt(Mmax / 1000, 4); // кН·м
    els.rQ.textContent = fmt(Qmax / 1000, 4); // кН
    els.rWx.textContent = fmt(Wx * 1e6, 2); // см³
    els.rW.textContent = "—";
    els.rU.textContent = "—";
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.l, els.a, els.qn, els.q].forEach(el => {
      if (el) el.addEventListener(ev, update);
    });
  });
  [els.lUnit, els.aUnit, els.qnUnit, els.qUnit].forEach(el => {
    if (el) el.addEventListener('change', update);
  });
  els.steelGrade.addEventListener('change', update);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
}
