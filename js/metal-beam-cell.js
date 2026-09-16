/**
 * js/metal-beam-cell.js
 * ============================================================
 * Калькулятор расчёта стальной балочной клетки (настил)
 * ============================================================
 *
 * Поддерживает выбор единиц измерения для ввода и вывода.
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, STEELS, getSteelProps)
 *   - KaTeX (renderMathInElement) для обновления формул в заметке
 */

document.addEventListener('DOMContentLoaded', initBeamCell);

function initBeamCell() {
  const cv = document.getElementById('cv');
  if (!cv) return;

  const ctx = cv.getContext('2d');

  // ============================================================
  // Ссылки на DOM-элементы
  // ============================================================
  const els = {
    steelGrade: document.getElementById('steelGrade'),
    steelNote: document.getElementById('steelNote'),
    l: document.getElementById('l'),
    lUnit: document.getElementById('lUnit'),
    h: document.getElementById('h'),
    hUnit: document.getElementById('hUnit'),
    q: document.getElementById('q'),
    qUnit: document.getElementById('qUnit'),
    ky: document.getElementById('ky'),
    kyVal: document.getElementById('kyVal'),
    deflRatio: document.getElementById('deflRatio'),
    rU: document.getElementById('rU'),
    rD: document.getElementById('rD'),
    rS: document.getElementById('rS'),
    rSUnit: document.getElementById('rSUnit'),
    rW: document.getElementById('rW'),
    rWUnit: document.getElementById('rWUnit'),
    rM: document.getElementById('rM'),
    rMUnit: document.getElementById('rMUnit'),
    rSM: document.getElementById('rSM'),
    rSMUnit: document.getElementById('rSMUnit'),
    rS1: document.getElementById('rS1'),
    rS1Unit: document.getElementById('rS1Unit'),
    rS2: document.getElementById('rS2'),
    rS2Unit: document.getElementById('rS2Unit'),
  };

  // ---- Константы стали ----
  const E = STEEL_CONSTANTS.E;
  const NU = STEEL_CONSTANTS.NU;

  // ============================================================
  // Конвертация единиц
  // ============================================================

  /** Вход: длина → метры */
  function toMeters(value, unit) {
    switch (unit) {
      case 'мм': return value / 1000;
      case 'см': return value / 100;
      case 'м': default: return value;
    }
  }

  /** Вход: толщина → метры */
  function toMetersH(value, unit) {
    switch (unit) {
      case 'мм': return value / 1000;
      case 'см': return value / 100;
      case 'м': default: return value;
    }
  }

  /** Вход: нагрузка → Па */
  function toPascals(value, unit) {
    switch (unit) {
      case 'Н/см²': return value * 10000;  // 1 Н/см² = 10000 Па
      case 'кг/см²': return value * 98066.5; // 1 кг/см² ≈ 98066.5 Па
      case 'кПа': default: return value * 1000;
    }
  }

  /** Выход: прогиб (м) → выбранные единицы */
  function deflFromMeters(value, unit) {
    switch (unit) {
      case 'см': return value * 100;
      case 'м': return value;
      case 'мм': default: return value * 1000;
    }
  }

  /** Выход: момент (Н·м) → выбранные единицы */
  function momentFromNm(value, unit) {
    switch (unit) {
      case 'Н·мм': return value * 1000;
      case 'Н·м': return value;
      case 'кН·м': default: return value / 1000;
    }
  }

  /** Выход: распор (Н/м) → выбранные единицы */
  function thrustFromNPerM(value, unit) {
    switch (unit) {
      case 'Н/мм': return value / 1000;
      case 'Н/м': return value;
      case 'кН/м': default: return value / 1000;
    }
  }

  /** Выход: напряжение (Па) → выбранные единицы */
  function stressFromPa(value, unit) {
    switch (unit) {
      case 'кПа': return value / 1000;
      case 'Н/см²': return value / 10000;
      case 'МПа': default: return value / 1e6;
    }
  }

  // ============================================================
  // Математические функции
  // ============================================================

  function findU(E, h, l, q, nu, tol = 1e-8) {
    const D = E * Math.pow(h, 3) / (12.0 * (1.0 - Math.pow(nu, 2)));
    const p = q * Math.pow(l, 4) / (E * Math.pow(h, 4));
    const C = (27.0 * Math.pow(1.0 - Math.pow(nu, 2), 2) / 8.0) * Math.pow(p, 2);

    function f(u) {
      if (u < 0.5) {
        return Math.pow(u, 4) * (17.0 / 315.0
          - 124.0 * Math.pow(u, 2) / 2835.0
          + 1382.0 * Math.pow(u, 4) / 51975.0);
      }
      return (1.0 / 3.0
        - 2.0 / Math.pow(u, 2)
        + 5.0 * Math.tanh(u) / (2.0 * Math.pow(u, 3))
        - 1.0 / (2.0 * Math.pow(u, 2) * Math.pow(Math.cosh(u), 2)));
    }

    function F(u) {
      return Math.pow(u, 6) - C * f(u);
    }

    let a = 1e-8;
    let b = 12.0;

    if (F(a) >= 0) return 0.0;
    if (F(b) <= 0) return b;

    for (let i = 0; i < 200; i++) {
      const mid = (a + b) / 2.0;
      if (F(mid) > 0) {
        b = mid;
      } else {
        a = mid;
      }
      if ((b - a) < tol) break;
    }

    return (a + b) / 2.0;
  }

  function deflection(x, q, l, u, D) {
    if (u < 1e-6) {
      const t = x / l;
      return q * Math.pow(l, 4) / (24 * D) * (t - 2 * t * t * t + t * t * t * t);
    }
    const cu = Math.cosh(u);
    return (q * Math.pow(l, 4) / (16 * Math.pow(u, 4) * D)) *
      (Math.cosh(u * (1 - 2 * x / l)) / cu - 1) +
      (q * l * l * x / (8 * u * u * D)) * (l - x);
  }

  // ============================================================
  // Вспомогательные функции
  // ============================================================

  const fmt = (v, d = 4) =>
    (v === 0 ? "0" : (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2)
      ? v.toExponential(d - 1) : v.toFixed(d));

  function arrowHead(ctx, x, y, angle, size) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.6); ctx.lineTo(-size, size * 0.6);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function support(ctx, x, y) {
    ctx.fillStyle = "#334155"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 15); ctx.lineTo(x + 9, y + 15);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    for (let i = -1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 5 - 3 + 2, y + 15); ctx.lineTo(x + i * 5 - 8 + 2, y + 21);
      ctx.stroke();
    }
  }

  // ============================================================
  // Расчёт момента и напряжений
  // ============================================================
  function calcMomentStresses(q, l, h, S, u) {
    const M_max = (q * l * l / 8) * (1 - 1 / Math.cosh(u)) / (u * u / 2);
    const sigma_1 = S / h;
    const sigma_2 = 6 / (h * h) * M_max;
    const sigma_max = sigma_1 + sigma_2;
    return { M_max, sigma_1, sigma_2, sigma_max };
  }

  // ============================================================
  // Визуализация (canvas)
  // ============================================================
  function draw(ctx, W, H, l, h, q, ky) {
    ctx.clearRect(0, 0, W, H);

    const D = E * Math.pow(h, 3) / (12 * (1 - NU * NU));
    const u = findU(E, h, l, q, NU);
    const S = 4 * u * u * D / (l * l);

    const N = 400;
    const xs = [], ws = [];
    let wMax = 0;
    for (let i = 0; i <= N; i++) {
      const x = l * i / N;
      const w = deflection(x, q, l, u, D);
      xs.push(x); ws.push(w);
      if (w > wMax) wMax = w;
    }

    const padL = 80, padR = 80, padTop = 80, padBot = 80;
    const plotW = W - padL - padR;
    const sx = plotW / l;
    const axisY = padTop + (H - padTop - padBot) / 2;

    const X = x => padL + x * sx;
    const h_px = h * sx;
    const sy = ky * sx;
    const Y = w => axisY + w * sy;

    ctx.strokeStyle = "#eef2f7"; ctx.lineWidth = 1;
    const gridStep = l / 10;
    for (let gx = 0; gx <= 10; gx++) {
      const px = X(gx * gridStep);
      ctx.beginPath(); ctx.moveTo(px, padTop); ctx.lineTo(px, H - padBot); ctx.stroke();
    }

    ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.fillRect(X(0), axisY - h_px / 2, X(l) - X(0), h_px);
    ctx.strokeRect(X(0), axisY - h_px / 2, X(l) - X(0), h_px);

    ctx.setLineDash([6, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(0), axisY); ctx.lineTo(X(l), axisY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#ef4444"; ctx.fillStyle = "#ef4444"; ctx.lineWidth = 1.2;
    const nArr = 17;
    for (let i = 1; i < nArr; i++) {
      const x = l * i / nArr;
      const w = deflection(x, q, l, u, D);
      const x0 = X(x), y0 = axisY - h_px / 2 - 25;
      const y1 = Y(w);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
      arrowHead(ctx, x0, y1, Math.PI / 2, 5);
    }
    ctx.font = "13px system-ui"; ctx.textAlign = "center";
    ctx.fillText("q", X(l / 2), axisY - h_px / 2 - 30);

    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const px = X(xs[i]), py = Y(ws[i]);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(37,99,235,0.12)";
    ctx.beginPath();
    for (let i = 0; i <= N; i++) ctx.lineTo(X(xs[i]), Y(ws[i]) - h_px / 2);
    for (let i = N; i >= 0; i--) ctx.lineTo(X(xs[i]), Y(ws[i]) + h_px / 2);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = "rgba(37,99,235,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const px = X(xs[i]), py = Y(ws[i]) - h_px / 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const px = X(xs[i]), py = Y(ws[i]) + h_px / 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    support(ctx, X(0), axisY);
    support(ctx, X(l), axisY);

    ctx.strokeStyle = "#16a34a"; ctx.fillStyle = "#16a34a"; ctx.lineWidth = 2.5;
    const sLen = 46;
    ctx.beginPath(); ctx.moveTo(X(0), axisY); ctx.lineTo(X(0) - sLen, axisY); ctx.stroke();
    arrowHead(ctx, X(0) - sLen, axisY, Math.PI, 7);
    ctx.beginPath(); ctx.moveTo(X(l), axisY); ctx.lineTo(X(l) + sLen, axisY); ctx.stroke();
    arrowHead(ctx, X(l) + sLen, axisY, 0, 7);
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "right"; ctx.fillText("S", X(0) - sLen - 4, axisY + 5);
    ctx.textAlign = "left"; ctx.fillText("S", X(l) + sLen + 4, axisY + 5);

    const yDim = padTop + 20;
    ctx.strokeStyle = "#334155"; ctx.fillStyle = "#334155"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(0), yDim); ctx.lineTo(X(l), yDim); ctx.stroke();
    arrowHead(ctx, X(0), yDim, Math.PI, 5);
    arrowHead(ctx, X(l), yDim, 0, 5);
    ctx.textAlign = "center"; ctx.font = "13px system-ui";
    ctx.fillText("l = " + fmt(l, 3) + " м", X(l / 2), yDim - 8);

    const xm = l / 2, wm = deflection(xm, q, l, u, D);
    ctx.strokeStyle = "#2563eb"; ctx.fillStyle = "#2563eb"; ctx.lineWidth = 1.2;
    const ym = Y(wm);
    const yt = ym + 30;
    ctx.beginPath(); ctx.moveTo(X(xm), ym + (wm > 0 ? 2 : -2));
    ctx.lineTo(X(xm), yt - 4);
    ctx.stroke();
    arrowHead(ctx, X(xm), ym + 2, -Math.PI / 2, 5);
    ctx.textAlign = "center"; ctx.font = "13px system-ui";
    ctx.fillText("wₘₐₓ = " + fmt(wMax * 1000, 2) + " мм", X(xm), yt + 14);

    return { u, D, S, wMax, l, h, q };
  }

  // ============================================================
  // Обновление заметки о стали
  // ============================================================
  function updateSteelNote() {
    const grade = els.steelGrade.value;
    const hMm = parseFloat(els.h.value) || 0;
    const props = getSteelProps(grade, hMm);
    const s = STEELS[grade];

    if (props) {
      els.steelNote.innerHTML = '$E = 2.06 \\cdot 10^{11}$ Па, $\\nu = 0.3$ (сталь ' + s.name +
        ', R<sub>y</sub> = ' + (props.Ry1 || props.Ry2) + ' МПа) СП 16.13330.2017 Таб.В.3';
    } else {
      els.steelNote.innerHTML = '$E = 2.06 \\cdot 10^{11}$ Па, $\\nu = 0.3$ (сталь ' + s.name + ')';
    }
    if (window.renderMathInElement) {
      renderMathInElement(els.steelNote, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
    }
  }

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    // Вход: конвертация в СИ
    const l = Math.max(1e-3, toMeters(parseFloat(els.l.value) || 0, els.lUnit.value));
    const h = Math.max(1e-4, toMetersH(parseFloat(els.h.value) || 0, els.hUnit.value));
    const q = Math.max(0, toPascals(parseFloat(els.q.value) || 0, els.qUnit.value));
    const ky = Math.max(1, parseFloat(els.ky.value) || 10);
    const deflRatio = Math.max(10, parseFloat(els.deflRatio.value) || 150);
    els.kyVal.textContent = ky;

    const { u, D, S, wMax } = draw(ctx, cv.width, cv.height, l, h, q, ky);
    const { M_max, sigma_1, sigma_2, sigma_max } = calcMomentStresses(q, l, h, S, u);

    const wLimit = l / deflRatio;
    const exceedsDeflection = wMax > wLimit;

    // Выход: конвертация из СИ в выбранные единицы
    els.rU.textContent = fmt(u, 4);
    els.rD.textContent = fmt(D / 1000, 4);

    els.rW.textContent = fmt(deflFromMeters(wMax, els.rWUnit.value), 4);
    if (exceedsDeflection) {
      els.rW.style.color = 'var(--danger)';
      els.rW.classList.add('exceed');
    } else {
      els.rW.style.color = '';
      els.rW.classList.remove('exceed');
    }
    els.rW.title = exceedsDeflection ? 'Прогиб превышает допустимое значение l/' + deflRatio : '';

    els.rM.textContent = fmt(momentFromNm(M_max, els.rMUnit.value), 4);
    els.rS.textContent = fmt(thrustFromNPerM(S, els.rSUnit.value), 4);
    els.rSM.textContent = fmt(stressFromPa(sigma_max, els.rSMUnit.value), 4);
    els.rS1.textContent = fmt(stressFromPa(sigma_1, els.rS1Unit.value), 4);
    els.rS2.textContent = fmt(stressFromPa(sigma_2, els.rS2Unit.value), 4);
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.l, els.h, els.q, els.ky, els.deflRatio].forEach(el => el.addEventListener(ev, update));
  });
  // Смена единиц измерения
  [els.lUnit, els.hUnit, els.qUnit].forEach(el => el.addEventListener('change', update));
  [els.rWUnit, els.rMUnit, els.rSUnit, els.rSMUnit, els.rS1Unit, els.rS2Unit].forEach(el => el.addEventListener('change', update));

  els.steelGrade.addEventListener('change', () => {
    updateSteelNote();
    update();
  });
  els.h.addEventListener('change', updateSteelNote);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
  updateSteelNote();
}
