/**
 * js/metal-floor-beam.js
 * ============================================================
 * Калькулятор подбора прокатного двутавра для балки настила
 * ============================================================
 *
 * Методика — subjects/procedure/floor-beams-normal-type.html:
 *   1) погонные нагрузки на балку с учётом веса настила;
 *   2) первое приближение: C₁ = 1.1 → Wₓᵗʳ → двутавр по сортаменту;
 *   3) уточнение C₁ = C(αf) по табл. Е.1 СП 16.13330.2017, вес самой балки,
 *      проверки прочности (σ, τ) и жёсткости — принимается первый по возрастанию
 *      Wx профиль, который их проходит.
 *
 * Зависимости:
 *   - js/steels.js (STEEL_CONSTANTS, STEELS)
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
    tDeck: document.getElementById('tDeck'),
    tDeckUnit: document.getElementById('tDeckUnit'),
    qn: document.getElementById('qn'),
    qnUnit: document.getElementById('qnUnit'),
    q: document.getElementById('q'),
    qUnit: document.getElementById('qUnit'),
    qnLin: document.getElementById('qnLin'),
    qnLinUnit: document.getElementById('qnLinUnit'),
    qLin: document.getElementById('qLin'),
    qLinUnit: document.getElementById('qLinUnit'),
    gammaF: document.getElementById('gammaF'),
    gammaC: document.getElementById('gammaC'),
    rProfile: document.getElementById('rProfile'),
    rStatus: document.getElementById('rStatus'),
    rQTot: document.getElementById('rQTot'),
    rQTotUnit: document.getElementById('rQTotUnit'),
    rQnTot: document.getElementById('rQnTot'),
    rQnTotUnit: document.getElementById('rQnTotUnit'),
    rM: document.getElementById('rM'),
    rMUnit: document.getElementById('rMUnit'),
    rQ: document.getElementById('rQ'),
    rQUnit: document.getElementById('rQUnit'),
    rC1: document.getElementById('rC1'),
    rC1Note: document.getElementById('rC1Note'),
    rSigma: document.getElementById('rSigma'),
    rSigmaUnit: document.getElementById('rSigmaUnit'),
    rTau: document.getElementById('rTau'),
    rTauUnit: document.getElementById('rTauUnit'),
    rW: document.getElementById('rW'),
    rWUnit: document.getElementById('rWUnit'),
    rU: document.getElementById('rU'),
    rUNote: document.getElementById('rUNote'),
    rWx: document.getElementById('rWx'),
    rWxUnit: document.getElementById('rWxUnit'),
    rWxNote: document.getElementById('rWxNote'),
    profileRow: document.getElementById('profileRow'),
    checksBody: document.getElementById('checksBody'),
    rNeighbor: document.getElementById('rNeighbor'),
  };

  // ---- Константы ----
  const E = STEEL_CONSTANTS.E;   // модуль упругости, Па
  const RHO = 7850;              // плотность стали, кг/м³
  const G = 10;                  // ускорение свободного падения, м/с²
  const GAMMA_M = 1.025;         // коэффициент надёжности по материалу для проката (табл. 3 СП 16.13330.2017)
  const C1_START = 1.1;          // C₁ в первом приближении
  const RY_CASE = 1;             // вариант Ry в steels.js ([случай 1, случай 2] → Ry2)

  // Табл. Е.1 СП 16.13330.2017: коэффициент C для двутаврового сечения при τ = 0
  const C_TABLE = [[0.25, 1.19], [0.5, 1.12], [1.0, 1.07]];

  // ============================================================
  // Сортамент ГОСТ 35087-2024, таблица 1, тип Б — двутавры балочные нормальные
  // (subjects/norms/ibeam-assortment.html)
  // h, b, tw (стенка s), tf (полка t) — мм; mass — кг/м; Ix — см⁴; Wx, Sx — см³
  // ============================================================
  const IBEAMS_B = [
    { num: '10Б1', h: 100, b: 55, tw: 4.1, tf: 5.7, mass: 8.1, Ix: 171.01, Wx: 34.2, Sx: 19.7 },
    { num: '12Б1', h: 117.6, b: 64, tw: 3.8, tf: 5.1, mass: 8.7, Ix: 257.36, Wx: 43.8, Sx: 24.94 },
    { num: '12Б2', h: 120, b: 64, tw: 4.4, tf: 6.3, mass: 10.4, Ix: 317.75, Wx: 53, Sx: 30.36 },
    { num: '14Б1', h: 137.4, b: 73, tw: 3.8, tf: 5.6, mass: 10.5, Ix: 434.86, Wx: 63.3, Sx: 35.8 },
    { num: '14Б2', h: 140, b: 73, tw: 4.7, tf: 6.9, mass: 12.9, Ix: 541.22, Wx: 77.3, Sx: 44.17 },
    { num: '16Б1', h: 157, b: 82, tw: 4, tf: 5.9, mass: 12.7, Ix: 689.28, Wx: 87.8, Sx: 49.55 },
    { num: '16Б2', h: 160, b: 82, tw: 5, tf: 7.4, mass: 15.8, Ix: 869.29, Wx: 108.7, Sx: 61.93 },
    { num: '18Б1', h: 177, b: 91, tw: 4.3, tf: 6.5, mass: 15.4, Ix: 1062.74, Wx: 120.1, Sx: 67.66 },
    { num: '18Б2', h: 180, b: 91, tw: 5.3, tf: 8, mass: 18.8, Ix: 1316.96, Wx: 146.3, Sx: 83.21 },
    { num: '20Б1', h: 200, b: 100, tw: 5.5, tf: 8, mass: 21.3, Ix: 1844.26, Wx: 184.4, Sx: 104.73 },
    { num: '20Б2', h: 203, b: 101, tw: 6.5, tf: 9.5, mass: 25.3, Ix: 2218.49, Wx: 218.6, Sx: 124.99 },
    { num: '20Б3', h: 208, b: 102, tw: 8, tf: 12, mass: 31.6, Ix: 2852.62, Wx: 274.3, Sx: 158.46 },
    { num: '25Б1', h: 248, b: 124, tw: 5, tf: 8, mass: 25.7, Ix: 3537.11, Wx: 285.3, Sx: 159.68 },
    { num: '25Б2', h: 250, b: 125, tw: 6, tf: 9, mass: 29.6, Ix: 4051.73, Wx: 324.1, Sx: 182.93 },
    { num: '25Б3', h: 255, b: 126, tw: 7.5, tf: 11.5, mass: 37.4, Ix: 5238.16, Wx: 410.8, Sx: 233.88 },
    { num: '25Б4', h: 260, b: 127, tw: 9, tf: 14, mass: 45.3, Ix: 6481.01, Wx: 498.5, Sx: 286.25 },
    { num: '30Б1', h: 298, b: 149, tw: 5.5, tf: 8, mass: 32, Ix: 6318.22, Wx: 424, Sx: 237.53 },
    { num: '30Б2', h: 300, b: 150, tw: 6.5, tf: 9, mass: 36.7, Ix: 7209.26, Wx: 480.6, Sx: 271.06 },
    { num: '30Б3', h: 305, b: 151, tw: 8, tf: 11.5, mass: 46.1, Ix: 9254.92, Wx: 606.9, Sx: 344.37 },
    { num: '30Б4', h: 310, b: 152, tw: 9.5, tf: 14, mass: 55.6, Ix: 11381.41, Wx: 734.3, Sx: 419.4 },
    { num: '35Б1', h: 346, b: 174, tw: 6, tf: 9, mass: 41.4, Ix: 11094.49, Wx: 641.3, Sx: 358.09 },
    { num: '35Б2', h: 350, b: 175, tw: 7, tf: 11, mass: 49.6, Ix: 13559.01, Wx: 774.8, Sx: 433.96 },
    { num: '35Б3', h: 355, b: 176, tw: 8.5, tf: 13.5, mass: 60.5, Ix: 16797.02, Wx: 946.3, Sx: 533.54 },
    { num: '35Б4', h: 361, b: 177, tw: 10, tf: 16.5, mass: 72.9, Ix: 20719.71, Wx: 1147.9, Sx: 651.07 },
    { num: '40Б1', h: 396, b: 199, tw: 7, tf: 11, mass: 56.6, Ix: 20018.83, Wx: 1011.1, Sx: 563.93 },
    { num: '40Б2', h: 400, b: 200, tw: 8, tf: 13, mass: 66, Ix: 23704.43, Wx: 1185.2, Sx: 663.13 },
    { num: '40Б3', h: 406, b: 201, tw: 9.5, tf: 16, mass: 80.1, Ix: 29352.45, Wx: 1445.9, Sx: 813.38 },
    { num: '40Б4', h: 412, b: 202, tw: 11, tf: 19, mass: 94.3, Ix: 35196.83, Wx: 1708.6, Sx: 966.65 },
    { num: '45Б1', h: 446, b: 199, tw: 8, tf: 12, mass: 66.2, Ix: 28697.35, Wx: 1286.9, Sx: 725.06 },
    { num: '45Б2', h: 450, b: 200, tw: 9, tf: 14, mass: 76, Ix: 33450.76, Wx: 1486.7, Sx: 839.53 },
    { num: '45Б3', h: 456, b: 201, tw: 10.5, tf: 17, mass: 90.6, Ix: 40710.41, Wx: 1785.5, Sx: 1012.55 },
    { num: '45Б4', h: 462, b: 202, tw: 12, tf: 20, mass: 105.4, Ix: 48197.42, Wx: 2086.5, Sx: 1188.75 },
    { num: '50Б1', h: 492, b: 199, tw: 8.8, tf: 12, mass: 72.5, Ix: 36841.89, Wx: 1497.6, Sx: 853.45 },
    { num: '50Б2', h: 496, b: 199, tw: 9, tf: 14, mass: 79.5, Ix: 41869.08, Wx: 1688.3, Sx: 957.23 },
    { num: '50Б3', h: 500, b: 200, tw: 10, tf: 16, mass: 89.7, Ix: 47846.05, Wx: 1913.8, Sx: 1087.59 },
    { num: '50Б4', h: 508, b: 201, tw: 12, tf: 20, mass: 109.9, Ix: 59953.57, Wx: 2360.4, Sx: 1348.82 },
    { num: '50Б5', h: 516, b: 202, tw: 15, tf: 24, mass: 133.9, Ix: 73345.26, Wx: 2842.8, Sx: 1642.68 },
    { num: '55Б1', h: 543, b: 220, tw: 9.5, tf: 13.5, mass: 89, Ix: 55677.42, Wx: 2050.7, Sx: 1164.94 },
    { num: '55Б2', h: 547, b: 220, tw: 10, tf: 15.5, mass: 97.9, Ix: 62784.45, Wx: 2295.6, Sx: 1301.49 },
    { num: '55Б3', h: 553, b: 221, tw: 12, tf: 18.5, mass: 116.7, Ix: 75321.22, Wx: 2724.1, Sx: 1554.49 },
    { num: '55Б4', h: 560, b: 222, tw: 14, tf: 22, mass: 137.3, Ix: 89907.09, Wx: 3211, Sx: 1842.2 },
    { num: '60Б1', h: 596, b: 199, tw: 10, tf: 15, mass: 94.6, Ix: 68715.9, Wx: 2305.9, Sx: 1325.36 },
    { num: '60Б2', h: 600, b: 200, tw: 11, tf: 17, mass: 105.5, Ix: 77632.25, Wx: 2587.7, Sx: 1489.36 },
    { num: '60Б3', h: 604, b: 201, tw: 12.5, tf: 19, mass: 118.8, Ix: 87472.1, Wx: 2896.4, Sx: 1675.38 },
    { num: '60Б4', h: 612, b: 202, tw: 15, tf: 23, mass: 142.9, Ix: 106509.5, Wx: 3480.7, Sx: 2026.68 },
    { num: '70Б1', h: 691, b: 260, tw: 12, tf: 15.5, mass: 129.3, Ix: 125922.2, Wx: 3644.6, Sx: 2094.79 },
    { num: '70Б2', h: 697, b: 260, tw: 12.5, tf: 18.5, mass: 144.16, Ix: 145904.02, Wx: 4186.63, Sx: 2392.68 },
    { num: '70Б3', h: 702, b: 261, tw: 14.5, tf: 21, mass: 165.1, Ix: 167085.05, Wx: 4760.3, Sx: 2736.06 },
    { num: '70Б4', h: 710, b: 262, tw: 17, tf: 25, mass: 194.8, Ix: 199679.98, Wx: 5624.8, Sx: 3249.28 },
  ];

  // Профили по возрастанию Wx: в таблице сортамента Wx идёт не строго по порядку
  const BY_WX = IBEAMS_B.slice().sort((p1, p2) => p1.Wx - p2.Wx);

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

  function toNPerM(value, unit) {
    switch (unit) {
      case 'Н/м': return value;
      case 'кН/м': default: return value * 1000;
    }
  }

  function momentFromNm(value, unit) {
    switch (unit) {
      case 'Н·м': return value;
      case 'кН·м': default: return value / 1000;
    }
  }

  function forceFromN(value, unit) {
    switch (unit) {
      case 'Н': return value;
      case 'кН': default: return value / 1000;
    }
  }

  function lineLoadFromNPerM(value, unit) {
    switch (unit) {
      case 'Н/м': return value;
      case 'кН/м': default: return value / 1000;
    }
  }

  function sectionModulusFromCm3(value, unit) {
    switch (unit) {
      case 'мм³': return value * 1000;
      case 'см³': default: return value;
    }
  }

  function deflFromMeters(value, unit) {
    switch (unit) {
      case 'см': return value * 100;
      case 'мм': default: return value * 1000;
    }
  }

  function stressFromPa(value, unit) {
    switch (unit) {
      case 'кПа': return value / 1000;
      case 'Н/см²': return value / 10000;
      case 'МПа': default: return value / 1e6;
    }
  }

  const fmt = (v, d = 2) => v.toFixed(d);

  // ============================================================
  // Расчёт по методике
  // ============================================================

  // Линейная интерполяция по точкам [x, y]; за пределами таблицы — крайнее значение
  function interpolate(x, points) {
    if (x <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      if (x > points[i][0]) continue;
      const x0 = points[i - 1][0], y0 = points[i - 1][1];
      const x1 = points[i][0], y1 = points[i][1];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
    return points[points.length - 1][1];
  }

  // Предельный прогиб [f] = l/n₀ (СП 20.13330.2016): l < 1 м → 1/120; 1…3 м → 1/150; l > 3 м → 1/200
  function deflRatioLimit(l) {
    if (l < 1) return 120;
    if (l <= 3) return 150;
    return 200;
  }

  // R_y и R_s стали по толщине полки профиля (приложение В, табл. 2 и 3 СП 16.13330.2017).
  // Если толщина вне диапазонов марки — берётся ближайший диапазон.
  function steelStrength(grade, thickness) {
    const ranges = STEELS[grade].ranges;
    const gap = (range) => thickness < range.min ? range.min - thickness
      : thickness > range.max ? thickness - range.max : 0;
    const range = ranges.reduce((nearest, r) => (gap(r) < gap(nearest) ? r : nearest));

    return {
      Ry: range.Ry[RY_CASE] * 1e6,           // Па
      Rs: 0.58 * range.Run / GAMMA_M * 1e6   // Па
    };
  }

  // Проверки для профиля — шаги 7–13 методики
  function checkProfile(p, load) {
    // В середине пролёта τ = 0, поэтому C₁ = C
    const af = (p.b * p.tf) / (p.tw * (p.h - 2 * p.tf));
    const C1 = interpolate(af, C_TABLE);

    // Нагрузки с учётом собственного веса балки
    const qnTot = load.qnBeam + p.mass * G;              // Н/м
    const qTot = load.qBeam + p.mass * G * load.gammaF;  // Н/м

    const strength = steelStrength(load.grade, p.tf);
    const RyC = strength.Ry * load.gammaC;
    const RsC = strength.Rs * load.gammaC;

    const Mmax = qTot * load.l * load.l / 8;                                 // Н·м
    const Qmax = qTot * load.l / 2;                                          // Н
    const sigma = Mmax / (C1 * p.Wx * 1e-6);                                 // Па
    const tau = Qmax * p.Sx * 1e-6 / (p.Ix * 1e-8 * p.tw * 1e-3);            // Па
    const fMax = 5 * qnTot * Math.pow(load.l, 4) / (384 * E * p.Ix * 1e-8);  // м

    const n0 = deflRatioLimit(load.l);
    const okSigma = sigma <= RyC;
    const okTau = tau <= RsC;
    const okDefl = fMax <= load.l / n0;

    return {
      p: p,
      af: af,
      C1: C1,
      qnTot: qnTot,
      qTot: qTot,
      Mmax: Mmax,
      Qmax: Qmax,
      sigma: sigma,
      tau: tau,
      RyC: RyC,
      RsC: RsC,
      dSigma: (RyC - sigma) / RyC * 100,   // недонапряжение, %
      fMax: fMax,
      n0: n0,
      ratio: fMax > 0 ? load.l / fMax : 0, // l/f
      okSigma: okSigma,
      okTau: okTau,
      okDefl: okDefl,
      ok: okSigma && okTau && okDefl,
    };
  }

  // Подбор профиля — шаги 6–13 методики
  function selectProfile(load) {
    // Первое приближение: C₁ = 1.1, вес балки ещё не известен
    const M0 = load.qBeam * load.l * load.l / 8;   // Н·м
    const Wreq = (p) => M0 / (C1_START * steelStrength(load.grade, p.tf).Ry * load.gammaC);   // м³

    // Ближайшее значение Wx ≥ Wₓᵗʳ
    let first = BY_WX.findIndex((p) => p.Wx * 1e-6 >= Wreq(p));
    if (first < 0) first = BY_WX.length - 1;

    // Принимается первый по возрастанию Wx профиль, проходящий все проверки.
    // Проходящего нет (например, не хватает наибольшего профиля) — остаётся крупнейший
    const checks = BY_WX.map((p) => checkProfile(p, load));
    let index = checks.findIndex((check) => check.ok);
    if (index < 0) index = checks.length - 1;

    return { accepted: checks[index], index: index, first: first, Wreq: Wreq(BY_WX[first]), checks: checks };
  }

  // ============================================================
  // Вывод результатов
  // ============================================================
  function render(res) {
    const r = res.accepted;
    const p = r.p;
    const su = els.rSigmaUnit.value;
    const tu = els.rTauUnit.value;
    const s = (v) => fmt(stressFromPa(v, su));
    const t = (v) => fmt(stressFromPa(v, tu));

    // Относительный прогиб 1/(l/f); округление вниз, чтобы запись не расходилась с точным сравнением
    function relDefl(ratio) {
      return '1/' + Math.floor(ratio);
    }

    // Какие проверки не выполнены и на сколько
    function failed(check) {
      const list = [];
      if (!check.okSigma) list.push('σ = ' + s(check.sigma) + ' > R<sub>y</sub>γ<sub>c</sub> = ' + s(check.RyC) + ' ' + su);
      if (!check.okTau) list.push('τ = ' + t(check.tau) + ' > R<sub>s</sub>γ<sub>c</sub> = ' + t(check.RsC) + ' ' + tu);
      if (!check.okDefl) list.push('f/l = ' + relDefl(check.ratio) + ' > 1/' + check.n0);
      return list;
    }

    function verdict(ok, extra) {
      return '<span class="' + (ok ? 'check-ok' : 'check-fail') + '">' + (ok ? 'выполнена' : 'не выполнена') + (extra || '') + '</span>';
    }

    // Ячейки строки с подписями из шапки таблицы — по ним таблица разворачивается на узком экране
    function cells(body, values) {
      const heads = Array.from(body.closest('table').tHead.rows[0].cells).map((th) => th.textContent);
      return values.map((v, i) => '<td data-label="' + heads[i] + '">' + v + '</td>').join('');
    }

    // Принятый профиль
    els.rProfile.textContent = p.num;
    let status = r.ok
      ? '<span class="check-ok">Все проверки выполнены.</span>'
      : '<span class="check-fail">Не выполнены: ' + failed(r).join('; ') + '.</span>';
    if (res.index !== res.first) status += ' Первое приближение при C₁ = 1,1 давало ' + BY_WX[res.first].num + '.';
    els.rStatus.innerHTML = status;

    // Нагрузки и усилия
    els.rQTot.textContent = fmt(lineLoadFromNPerM(r.qTot, els.rQTotUnit.value), 3);
    els.rQnTot.textContent = fmt(lineLoadFromNPerM(r.qnTot, els.rQnTotUnit.value), 3);
    els.rM.textContent = fmt(momentFromNm(r.Mmax, els.rMUnit.value));
    els.rQ.textContent = fmt(forceFromN(r.Qmax, els.rQUnit.value));

    // Прочность
    els.rC1.textContent = fmt(r.C1, 3);
    els.rC1Note.textContent = 'первоначально 1,1 · αf = ' + fmt(r.af);
    els.rSigma.textContent = s(r.sigma);
    els.rTau.textContent = t(r.tau);
    els.rSigma.classList.toggle('exceed', !r.okSigma);
    els.rTau.classList.toggle('exceed', !r.okTau);

    // Жёсткость
    els.rW.textContent = fmt(deflFromMeters(r.fMax, els.rWUnit.value));
    els.rU.textContent = relDefl(r.ratio);
    els.rUNote.textContent = 'предельное значение 1/' + r.n0;
    els.rW.classList.toggle('exceed', !r.okDefl);
    els.rU.classList.toggle('exceed', !r.okDefl);

    // Первое приближение
    els.rWx.textContent = fmt(sectionModulusFromCm3(res.Wreq * 1e6, els.rWxUnit.value));
    els.rWxNote.textContent = 'C₁ = 1,1 в первом приближении → ' + BY_WX[res.first].num;

    // Строка сортамента
    const row = [p.num, fmt(p.h, 1), fmt(p.b, 1), fmt(p.tw, 1), fmt(p.tf, 1), fmt(p.mass), fmt(p.Ix), fmt(p.Wx), fmt(p.Sx)];
    els.profileRow.innerHTML = '<tr>' + cells(els.profileRow, row) + '</tr>';

    // Проверки
    const reserve = (r.okSigma ? ', недонапряжение ' : ', перенапряжение ') + fmt(Math.abs(r.dSigma)) + ' %';
    els.checksBody.innerHTML =
      '<tr>' + cells(els.checksBody, ['Прочность по нормальным напряжениям', 'σ = ' + s(r.sigma) + ' ' + su, 'R<sub>y</sub>γ<sub>c</sub> = ' + s(r.RyC) + ' ' + su, verdict(r.okSigma, reserve)]) + '</tr>' +
      '<tr>' + cells(els.checksBody, ['Прочность по касательным напряжениям', 'τ = ' + t(r.tau) + ' ' + tu, 'R<sub>s</sub>γ<sub>c</sub> = ' + t(r.RsC) + ' ' + tu, verdict(r.okTau)]) + '</tr>' +
      '<tr>' + cells(els.checksBody, ['Жёсткость', 'f/l = ' + relDefl(r.ratio), '[f/l] = 1/' + r.n0, verdict(r.okDefl)]) + '</tr>';

    // Почему не меньший профиль — или почему не хватает сортамента
    let note = '';
    if (!r.ok) {
      note = 'В сортаменте нет профиля, проходящего все проверки.';
    } else if (res.index > 0) {
      const prev = res.checks[res.index - 1];
      note = 'Ближайший меньший профиль ' + prev.p.num + ' не проходит: ' + failed(prev).join('; ') + '.';
    }
    els.rNeighbor.innerHTML = note;
  }

  // ============================================================
  // Главная функция обновления
  // ============================================================
  function update() {
    // Вход: конвертация в СИ
    const l = Math.max(1e-3, toMeters(parseFloat(els.l.value) || 0, els.lUnit.value));
    const a = Math.max(0.1, toMeters(parseFloat(els.a.value) || 0, els.aUnit.value));
    const tDeck = Math.max(0, toMeters(parseFloat(els.tDeck.value) || 0, els.tDeckUnit.value));
    const qn = Math.max(0, toPa(parseFloat(els.qn.value) || 0, els.qnUnit.value));
    const q = Math.max(0, toPa(parseFloat(els.q.value) || 0, els.qUnit.value));
    const qnLin = Math.max(0, toNPerM(parseFloat(els.qnLin.value) || 0, els.qnLinUnit.value));
    const qLin = Math.max(0, toNPerM(parseFloat(els.qLin.value) || 0, els.qLinUnit.value));
    const gammaF = Math.max(0, parseFloat(els.gammaF.value) || 0);
    const gammaC = Math.max(1e-9, parseFloat(els.gammaC.value) || 0);

    // Шаги 1–3: нагрузки на балку — с перекрытия и заданные напрямую.
    // Вес самой балки неизвестен — добавится после выбора профиля
    const gDeck = RHO * tDeck * G;   // нормативный вес настила, Па
    const load = {
      l: l,
      grade: els.steelGrade.value,
      gammaF: gammaF,
      gammaC: gammaC,
      qnBeam: (qn + gDeck) * a + qnLin,     // нормативная погонная нагрузка, Н/м
      qBeam: (q + gammaF * gDeck) * a + qLin  // расчётная погонная нагрузка, Н/м
    };

    render(selectProfile(load));
  }

  // ============================================================
  // Привязка событий
  // ============================================================
  ['input', 'change'].forEach(ev => {
    [els.l, els.a, els.tDeck, els.qn, els.q, els.qnLin, els.qLin, els.gammaF, els.gammaC].forEach(el => {
      if (el) el.addEventListener(ev, update);
    });
  });
  [els.lUnit, els.aUnit, els.tDeckUnit, els.qnUnit, els.qUnit, els.qnLinUnit, els.qLinUnit,
    els.rQTotUnit, els.rQnTotUnit, els.rMUnit, els.rQUnit, els.rSigmaUnit, els.rTauUnit,
    els.rWxUnit, els.rWUnit].forEach(el => {
    if (el) el.addEventListener('change', update);
  });
  els.steelGrade.addEventListener('change', update);

  // ============================================================
  // Инициализация
  // ============================================================
  update();
}
