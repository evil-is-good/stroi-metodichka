/**
 * js/metal-main-beam.js
 * ============================================================
 * Калькулятор расчёта главной балки
 * ============================================================
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, getSteelProps)
 */

document.addEventListener('DOMContentLoaded', initMainBeam);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initMainBeam();
}

function initMainBeam() {
  // ============================================================
  // Ссылки на DOM-элементы
  // ============================================================
  const els = {
    steelGrade: document.getElementById('steelGrade'),
    L: document.getElementById('L'),
    LUnit: document.getElementById('LUnit'),
    B: document.getElementById('B'),
    BUnit: document.getElementById('BUnit'),
    F: document.getElementById('F'),
    FUnit: document.getElementById('FUnit'),
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

  function toNPerM(value, unit) {
    switch (unit) {
      case 'Н/м': return value;
      case 'кН/м': default: return value * 1000;
    }
  }

  const fmt = (v, d = 4) =>
    (v === 0 ? "0" : (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2)
      ? v.toExponential(d - 1) : v.toFixed(d));

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    const L = Math.max(1e-3, toMeters(parseFloat(els.L.value) || 0, els.LUnit.value));
    const F = Math.max(0, toN(parseFloat(els.F.value) || 0, els.FUnit.value));
    const q = Math.max(0, toNPerM(parseFloat(els.q.value) || 0, els.qUnit.value));

    // Момент от сосредоточенной силы: M = F * L / 4
    const M_F = F * L / 4;

    // Момент от распределённой нагрузки: M = q * L² / 8
    const M_q = q * L * L / 8;

    // Полный момент
    const Mmax = M_F + M_q; // Н·м

    // Поперечная сила на опоре
    const Qmax = F / 2 + q * L / 2; // Н

    // Требуемый момент сопротивления
    const grade = els.steelGrade.value;
    const props = getSteelProps(grade, 20);
    const Ry = props ? props.Ry2 * 1e6 : 345e6; // Па
    const gammaC = 1.0;
    const Wx = Mmax / (Ry * gammaC); // м³

    // Вывод результатов
    els.rM.textContent = fmt(Mmax / 1000, 4); // кН·м
    els.rQ.textContent = fmt(Qmax / 1000, 4); // кН
    els.rWx.textContent = fmt(Wx * 1e6, 2); // см³
    els.rW.textContent = "—";
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.L, els.B, els.F, els.q].forEach(el => {
      if (el) el.addEventListener(ev, update);
    });
  });
  [els.LUnit, els.BUnit, els.FUnit, els.qUnit].forEach(el => {
    if (el) el.addEventListener('change', update);
  });
  els.steelGrade.addEventListener('change', update);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
}
