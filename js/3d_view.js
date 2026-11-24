/* ==========================================================
СОРТАМЕНТЫ ДВУТАВРОВ
========================================================== */
const SORT = {
g8239: {
10:{h:100,b:55,tw:4.5,tf:7.2,m:8.59}, 12:{h:120,b:64,tw:4.8,tf:7.3,m:10.4},
14:{h:140,b:73,tw:4.9,tf:7.5,m:12.3}, 16:{h:160,b:81,tw:5.0,tf:7.8,m:14.2},
18:{h:180,b:90,tw:5.1,tf:8.1,m:16.3}, 20:{h:200,b:100,tw:5.2,tf:8.5,m:18.4},
22:{h:220,b:110,tw:5.4,tf:8.7,m:21.0},24:{h:240,b:115,tw:5.6,tf:9.5,m:24.0},
27:{h:270,b:125,tw:6.0,tf:9.8,m:28.1},30:{h:300,b:135,tw:6.5,tf:10.2,m:31.8},
33:{h:330,b:140,tw:7.0,tf:11.2,m:36.5},36:{h:360,b:145,tw:7.5,tf:12.3,m:41.9},
40:{h:400,b:155,tw:8.3,tf:13.0,m:48.3},45:{h:450,b:160,tw:9.0,tf:14.2,m:57.0},
50:{h:500,b:170,tw:10.0,tf:15.2,m:65.2},55:{h:550,b:180,tw:10.5,tf:16.5,m:76.1},
60:{h:600,b:190,tw:11.5,tf:17.8,m:86.9}
},
g26020: {
'10Б1':{h:100,b:55,tw:4.1,tf:5.7,m:8.1},   '12Б1':{h:120,b:64,tw:4.4,tf:6.3,m:10.4},
'14Б1':{h:140,b:73,tw:4.7,tf:6.9,m:12.6},  '16Б1':{h:160,b:81,tw:5.0,tf:7.4,m:14.8},
'18Б1':{h:180,b:90,tw:5.3,tf:8.0,m:17.4},  '20Б1':{h:200,b:100,tw:5.5,tf:8.0,m:21.3},
'24Б1':{h:240,b:125,tw:5.5,tf:8.5,m:25.9}, '27Б1':{h:270,b:125,tw:6.0,tf:9.0,m:29.9},
'30Б1':{h:300,b:150,tw:6.5,tf:9.5,m:37.1}, '35Б1':{h:350,b:175,tw:7.0,tf:10.0,m:46.9},
'40Б1':{h:400,b:180,tw:8.0,tf:11.0,m:55.1},'45Б1':{h:450,b:185,tw:8.5,tf:12.0,m:63.4},
'50Б1':{h:500,b:190,tw:9.5,tf:13.0,m:74.3},'55Б1':{h:550,b:200,tw:10.0,tf:13.5,m:82.6},
'60Б1':{h:600,b:210,tw:10.5,tf:14.0,m:92.6},'70Б1':{h:700,b:250,tw:13.0,tf:17.0,m:125.5},
'80Б1':{h:800,b:280,tw:14.0,tf:18.0,m:145.5},'90Б1':{h:900,b:300,tw:15.0,tf:20.0,m:171.5},
'100Б1':{h:1000,b:320,tw:16.5,tf:23.0,m:211.0}
}
};
const GOST_NAME = {g8239:'ГОСТ 8239-89', g26020:'ГОСТ 26020-83'};
const RHO = 7850, FBASE = 0.40, PGAP = 0.02;
/* ================= ОГОЛОВОК КОЛОННЫ (опирание главных балок сверху) =================
   Оголовок — плита, вертикальное ребро под ней (в плоскости опорных рёбер балок,
   проходит сквозь стенку колонны, трапецией широким основанием к плите) и диафрагма
   под ребром. Все размеры — в метрах. Значения можно менять вручную: зависящие от них
   величины (отметка верха колонны, длина анкерных болтов, масса) пересчитаются сами. */
const HEAD = {
plateT:   0.025, /* толщина плиты оголовка */
outX:     0.050, /* свес плиты за полки колонны вдоль пролёта, с каждой стороны */
outZ:     0.040, /* свес плиты поперёк пролёта — за больший из размеров «полка колонны / пояс балки», с каждой стороны */
ribT:     0.014, /* толщина вертикального ребра оголовка */
ribH:     0.5,   /* высота ребра — доля высоты сечения колонны H; в расчёте назначается по требуемой длине швов крепления ребра к стенке */
ribHmin:  0.120, /* минимальная высота ребра */
ribGap:   0.080, /* отступ низа ребра от низа колонны: на короткой колонне ребро укорачивается, а если меньше ribGap — ребра и диафрагмы нет */
ribFit:   0.020, /* ширина ребра по плите: шире опорного ребра балки на ribFit, уже полки колонны на ribFit, до края плиты — 2·ribFit */
ribTaper: 0.6,   /* трапеция: ширина ребра внизу = ribTaper · ширина вверху */
diaT:     0.012, /* толщина диафрагмы; её длина вдоль полок отдельно не задаётся — выступ над стенкой равен выступу низа трапеции */
diaGap:   0.02  /* зазор диафрагмы до полок колонны: между полками — всегда, по кромкам — только если низ трапеции длиннее полки */
};
/* ================= ОПОРНЫЙ СТОЛИК (примыкание главных балок к колонне сбоку) =================
   К полке колонны приварена вертикальная пластина. Её нижняя часть — столик, на который
   торцевой пластиной опирается балка; верхняя часть стоит за торцевой пластиной, сквозь
   неё и полку колонны проходят монтажные болты (гайки внутри колонны).
   Все размеры — в метрах. Значения можно менять вручную: зависящие от них величины
   (положение балки, длина болтов, масса) пересчитаются сами. */
const TABLE = {
plateT:   0.030, /* толщина приваренной пластины (в методичке — 20…40 мм) */
overZ:    0.020, /* столик шире торцевой пластины балки на overZ с каждой стороны (в методичке — 15…20 мм) */
height:    0.55, /* высота столика — доля высоты балки H; в расчёте назначается из требуемой длины швов крепления столика к полке */
heightMin: 0.150, /* минимальная высота столика */
gapBase:   0.050, /* столик не доходит до низа колонны на эту величину — на короткой колонне столик ниже */
rowPitch:  0.38  /* шаг рядов монтажных болтов по высоте стенки */
};
/* ================= СЦЕНА ================= */
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1319);
scene.fog = new THREE.Fog(0x0e1319, 45, 190);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 900);
scene.add(camera);
scene.add(new THREE.HemisphereLight(0xd8e6ff, 0x33281d, 0.6));
const key = new THREE.DirectionalLight(0xfff2dd, 1.05);
key.castShadow = true; key.shadow.mapSize.set(2048,2048); key.shadow.bias = -0.0006;
scene.add(key);
const fill = new THREE.DirectionalLight(0x8fb3ff, 0.22);
fill.position.set(-14, 9, -16); scene.add(fill);
const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 64),
new THREE.MeshStandardMaterial({color:0x1a212a, roughness:0.96}));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(160, 80, 0x31404f, 0x222c36);
grid.position.y = 0.012; scene.add(grid);
(function compass(){
const cnv = document.createElement('canvas'); cnv.width = cnv.height = 128;
const g = cnv.getContext('2d');
g.strokeStyle='rgba(255,255,255,.5)'; g.lineWidth=3;
g.beginPath(); g.arc(64,64,50,0,7); g.stroke();
g.fillStyle='#e04a17'; g.beginPath(); g.moveTo(64,20); g.lineTo(76,72); g.lineTo(64,62); g.lineTo(52,72); g.closePath(); g.fill();
g.fillStyle='rgba(255,255,255,.65)'; g.beginPath(); g.moveTo(64,108); g.lineTo(76,56); g.lineTo(64,66); g.lineTo(52,56); g.closePath(); g.fill();
g.font='bold 20px monospace'; g.fillStyle='#fff'; g.textAlign='center'; g.fillText('X', 112, 70);
const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7),
new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cnv), transparent:true, depthWrite:false}));
m.rotation.x = -Math.PI/2; m.position.set(-11, 0.02, -9); scene.add(m);
})();
const dust = (function(){
const n = 340, pos = new Float32Array(n*3);
for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-.5)*60; pos[i*3+1]=Math.random()*11+0.3; pos[i*3+2]=(Math.random()-.5)*60; }
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
const p = new THREE.Points(geo, new THREE.PointsMaterial({color:0xaebdd0, size:0.045, transparent:true, opacity:0.38, depthWrite:false}));
scene.add(p); return p;
})();
const MAT = {
col:  new THREE.MeshStandardMaterial({color:0x5f7386, roughness:0.5,  metalness:0.45}),
gir:  new THREE.MeshStandardMaterial({color:0x93a7b6, roughness:0.42, metalness:0.5}),
sec:  new THREE.MeshStandardMaterial({color:0x7e93a4, roughness:0.4,  metalness:0.55}),
dn:   new THREE.MeshStandardMaterial({color:0xb9c2c9, roughness:0.38, metalness:0.55}),
deck: new THREE.MeshStandardMaterial({color:0x46525c, roughness:0.62, metalness:0.28}),
conc: new THREE.MeshStandardMaterial({color:0x8d8779, roughness:0.95}),
grout:new THREE.MeshStandardMaterial({color:0xa9a294, roughness:0.92}),
plate:new THREE.MeshStandardMaterial({color:0x55606a, roughness:0.5,  metalness:0.6}),
trav: new THREE.MeshStandardMaterial({color:0x6a7683, roughness:0.45, metalness:0.55}),
bolt: new THREE.MeshStandardMaterial({color:0x2f363d, roughness:0.45, metalness:0.7})
};
const DIM = new THREE.LineBasicMaterial({color:0xff8a3d, transparent:true, opacity:0.95});
const geoCache = new Map();
function iBeamGeo(H, B, tw, tf){
const k = [H,B,tw,tf].join('|');
if(geoCache.has(k)) return geoCache.get(k);
const s = new THREE.Shape();
s.moveTo(-B/2,0); s.lineTo(B/2,0); s.lineTo(B/2,tf); s.lineTo(tw/2,tf);
s.lineTo(tw/2,H-tf); s.lineTo(B/2,H-tf); s.lineTo(B/2,H); s.lineTo(-B/2,H);
s.lineTo(-B/2,H-tf); s.lineTo(-tw/2,H-tf); s.lineTo(-tw/2,tf); s.lineTo(-B/2,tf);
s.closePath();
const g = new THREE.ExtrudeGeometry(s, {depth:1, bevelEnabled:false});
geoCache.set(k,g); return g;
}
/* Трапециевидная траверса: шире вверху, уже внизу, с отверстием для удаления воды */
function travGeo(bw, tw, h, t, holeR, holeY){
const k = 'trav|'+[bw,tw,h,t,holeR,holeY].join('|');
if(geoCache.has(k)) return geoCache.get(k);
const s = new THREE.Shape();
s.moveTo(-bw/2,0); s.lineTo(bw/2,0); s.lineTo(tw/2,h); s.lineTo(-tw/2,h); s.closePath();
if(holeR > 0){
const hole = new THREE.Path();
hole.absarc(0, holeY, holeR, 0, Math.PI*2, true);
s.holes.push(hole);
}
const g = new THREE.ExtrudeGeometry(s, {depth:t, bevelEnabled:false, curveSegments:20});
geoCache.set(k,g); return g;
}
function beam(profile, mat, len){
const m = new THREE.Mesh(iBeamGeo(profile.H, profile.B, profile.tw, profile.tf), mat);
m.scale.z = len; m.castShadow = true; m.receiveShadow = true; return m;
}
function box(w,h,d,mat){
const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
m.castShadow = true; m.receiveShadow = true; return m;
}
function cyl(r0,r1,h,mat,seg){
const m = new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,seg||16), mat);
m.castShadow = true; m.receiveShadow = true; return m;
}
function mergeGeos(parts){
const geos = parts.map(([g,m])=>{ const q = g.toNonIndexed(); g.dispose(); if(m) q.applyMatrix4(m); return q; });
const n = geos.reduce((s,q)=> s + q.attributes.position.count, 0);
const pos = new Float32Array(n*3), nor = new Float32Array(n*3);
let o = 0;
for(const q of geos){
pos.set(q.attributes.position.array, o); nor.set(q.attributes.normal.array, o);
o += q.attributes.position.array.length; q.dispose();
}
const out = new THREE.BufferGeometry();
out.setAttribute('position', new THREE.BufferAttribute(pos,3));
out.setAttribute('normal', new THREE.BufferAttribute(nor,3));
return out;
}
/* Болт с шестигранной головкой, гайкой и шайбами, слитый в одну геометрию (один меш на болт).
   Ось Y: опорная плоскость головки в y = 0, гайка — на пакете толщиной grip */
function boltGeo(d, grip){
const k = 'bolt|'+d+'|'+grip;
if(geoCache.has(k)) return geoCache.get(k);
const hex = 0.866*d, headH = 0.625*d, nutH = 0.8*d, washT = 0.2*d, washR = 0.9*d;
const shank = grip + washT + nutH + 0.006;
const up = y => new THREE.Matrix4().makeTranslation(0, y, 0);
const g = mergeGeos([
[new THREE.CylinderGeometry(hex, hex, headH, 6), up(-headH/2)],
[new THREE.CylinderGeometry(washR, washR, washT, 20), up(washT/2)],
[new THREE.CylinderGeometry(d/2, d/2, shank, 14), up(shank/2)],
[new THREE.CylinderGeometry(washR, washR, washT, 20), up(grip + washT/2)],
[new THREE.CylinderGeometry(hex, hex, nutH, 6), up(grip + washT + nutH/2)]
]);
geoCache.set(k, g); return g;
}
function boltMass(d, grip){
const hex = 0.866*d, headH = 0.625*d, nutH = 0.8*d, washT = 0.2*d, washR = 0.9*d;
return (Math.PI*d*d/4*(grip + washT + nutH + 0.006) + 2.598*hex*hex*(headH + nutH) + 2*Math.PI*washR*washR*washT)*RHO;
}
/* Болт, проходящий через ребро рядом со стенкой балки: диаметр и вылет оси от стенки.
   Ось — между швом крепления стенки и кромкой ребра (расстояние до кромки ≥ 1,5d);
   если места нет — диаметр уменьшается, для совсем узкого ребра болты не ставятся */
function boltBesideWeb(ribHalf, twHalf, dMax){
for(let d = dMax; d >= 0.010; d -= 0.004){
const hr = 0.866*d, lo = twHalf + 0.008 + hr, hi = ribHalf - 1.5*d - hr;
if(hi >= lo) return {d: d, z: (lo + hi)/2};
}
return null;
}
function makeLabel(text, wWorld, color){
const cnv = document.createElement('canvas'), g = cnv.getContext('2d');
g.font = '600 46px "IBM Plex Mono", monospace';
cnv.width = Math.ceil(g.measureText(text).width) + 34; cnv.height = 62;
const c2 = cnv.getContext('2d');
c2.font = '600 46px "IBM Plex Mono", monospace';
c2.fillStyle = color || '#ffb36b';
c2.shadowColor = 'rgba(0,0,0,.7)'; c2.shadowBlur = 8;
c2.textBaseline = 'middle'; c2.fillText(text, 14, 33);
const sp = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cnv), transparent:true, depthWrite:false}));
sp.scale.set(wWorld * (cnv.width/cnv.height), wWorld, 1);
return sp;
}
function ln(a,b){ return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), DIM); }
/* ================= ВВОД ================= */
const $ = id => document.getElementById(id);
const clamp = (v,a,b)=> Math.min(b, Math.max(a, v));
function num(id, dflt){ const v = parseFloat($(id).value); return isNaN(v) ? dflt : v; }
function gv(name){ return document.querySelector('input[name="'+name+'"]:checked').value; }
const DEF = {spanG:9, stepG:3, countG:3, nAlong:2, elevDeck:4.2, colHw:300, colBf:260, colTf:14, colTw:9,
girHw:500, girBf:240, girTf:16, girTw:10, dnSel:'18', dnStep:1.5, scSel:'20', scStep:3, deckT:8};
function fillSelect(selId, gostKey){
const sel = $(selId), prev = sel.value, tbl = SORT[gostKey];
const pref = (gostKey === 'g8239') ? '№ ' : '';
let h = '';
for(const k in tbl){
h += '<option value="'+k+'">' + pref + k + ' · h=' + tbl[k].h + ' · b=' + tbl[k].b + '</option>';
}
sel.innerHTML = h;
sel.value = (tbl[prev]) ? prev : Object.keys(tbl)[Math.min(4, Object.keys(tbl).length-1)];
}
function rolledProfile(gostKey, id){
const d = SORT[gostKey][id];
return {H:d.h/1000, B:d.b/1000, tw:d.tw/1000, tf:d.tf/1000, m:d.m, id:id, gost:gostKey,
mm:{h:d.h, b:d.b, s:d.tw, t:d.tf}};
}
function readParams(){
const p = {
cell: gv('cell'), joint: gv('jointBeam'), base: gv('jointBase'), jointDN: gv('jointDN'),
span: clamp(num('spanG',9), 3, 24),
step: clamp(num('stepG',3), 1.2, 9),
count: clamp(Math.round(num('countG',3)), 2, 8),
nAlong: clamp(Math.round(num('nAlong',2)), 1, 6),
elev: clamp(num('elevDeck',4.2), 1, 12),
dnStep: clamp(num('dnStep',1.5), 0.5, 4),
scStep: clamp(num('scStep',3),  1, 6),
deck: clamp(num('deckT',8), 4, 25)/1000
};
const sec = (pre)=>({
hw: clamp(num(pre+'Hw',300), 80, 2000)/1000,
bf: clamp(num(pre+'Bf',260), 80, 1200)/1000,
tf: clamp(num(pre+'Tf',14), 4, 80)/1000,
tw: clamp(num(pre+'Tw',9), 4, 60)/1000
});
p.col = sec('col'); p.gir = sec('gir');
[p.col,p.gir].forEach(s=>{ s.H = s.hw + 2*s.tf; s.B = s.bf; s.A = s.hw*s.tw + 2*s.bf*s.tf;
s.mm = {h:Math.round(s.H*1000), b:Math.round(s.B*1000), s:Math.round(s.tw*1000), t:Math.round(s.tf*1000)}; });
p.dn = rolledProfile(gv('dnGost'), $('dnSel').value);
p.sc = rolledProfile(gv('scGost'), $('scSel').value);
return p;
}
/* ================= ОРБИТА ================= */
const orbit = {
theta:0.85, phi:1.03, r:20, gT:0.85, gP:1.03, gR:20,
target:new THREE.Vector3(), gTarget:new THREE.Vector3(0,2,0), auto:false,
update(dt){
const k = 1 - Math.exp(-dt*7);
if(this.auto) this.gT += dt*0.1;
this.theta += (this.gT-this.theta)*k;
this.phi   += (this.gP-this.phi)*k;
this.r     += (this.gR-this.r)*k;
this.target.lerp(this.gTarget, k);
const sp = Math.sin(this.phi);
camera.position.set(
this.target.x + this.r*sp*Math.sin(this.theta),
this.target.y + this.r*Math.cos(this.phi),
this.target.z + this.r*sp*Math.cos(this.theta));
camera.lookAt(this.target);
},
pan(dx,dy){
const dist = this.gR * Math.tan(camera.fov*Math.PI/360);
const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix,0);
const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix,1);
this.gTarget.addScaledVector(right, -2*dx*dist/canvas.clientHeight)
.addScaledVector(up,    2*dy*dist/canvas.clientHeight);
}
};
let drag = null, lastPinch = 0;
canvas.addEventListener('contextmenu', e=>e.preventDefault());
canvas.addEventListener('pointerdown', e=>{
canvas.setPointerCapture(e.pointerId);
drag = {x:e.clientX, y:e.clientY, b:e.button, sx:e.clientX, sy:e.clientY, moved:false};
});
canvas.addEventListener('pointermove', e=>{
if(!drag){
canvas.classList.toggle('is-pickable', !!pickElementAt(e.clientX, e.clientY));
return;
}
const dx = e.clientX-drag.x, dy = e.clientY-drag.y;
drag.x = e.clientX; drag.y = e.clientY;
if(Math.hypot(e.clientX-drag.sx, e.clientY-drag.sy) > 5) drag.moved = true;
if(drag.b===2 || e.shiftKey || drag.b===1){ orbit.pan(dx,dy); }
else{
orbit.gT -= dx*2*Math.PI/canvas.clientHeight;
orbit.gP  = clamp(orbit.gP - dy*2*Math.PI/canvas.clientHeight, 0.09, 1.53);
}
});
canvas.addEventListener('pointerup', e=>{
const d = drag; drag = null;
if(!d) return;
if(d.b === 0 && !d.moved){
const el = pickElementAt(e.clientX, e.clientY);
togglePick(el, e.shiftKey || e.ctrlKey || e.metaKey);
}
});
canvas.addEventListener('pointercancel', ()=>{ drag = null; });
canvas.addEventListener('wheel', e=>{ e.preventDefault(); orbit.gR = clamp(orbit.gR * Math.pow(0.95, -e.deltaY/53), 3, 320); },{passive:false});
canvas.addEventListener('touchstart', e=>{ if(e.touches.length===2) lastPinch = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); },{passive:true});
canvas.addEventListener('touchmove', e=>{
if(e.touches.length===2){
const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
if(lastPinch>0) orbit.gR = clamp(orbit.gR * lastPinch/d, 3, 320);
lastPinch = d; drag = null;
}
},{passive:true});
canvas.addEventListener('dblclick', ()=>{ clearSelection(); fitCamera(); });
let model = new THREE.Group(); scene.add(model);
const groups = {}, vis = {deck:true, dn:true, sec:true, gir:true, col:true, found:true, dims:true};
function fitCamera(){
const b = new THREE.Box3().setFromObject(model);
if(b.isEmpty()) return;
const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
orbit.gTarget.copy(c); orbit.gTarget.y = Math.max(c.y*0.9, 0.6);
orbit.gR = Math.max((Math.max(s.x,s.y,s.z)/2)/Math.tan(camera.fov*Math.PI/360) * 1.32, 5);
}
function setView(v){
if(v==='iso'){ orbit.gT=0.85; orbit.gP=1.02; }
else if(v==='top'){ orbit.gT=0.001; orbit.gP=0.10; }
else if(v==='front'){ orbit.gT=0.0; orbit.gP=1.50; }
else { orbit.gT=Math.PI/2; orbit.gP=1.50; }
fitCamera();
}
/* ================= ВЫБОР И СКРЫТИЕ ЭЛЕМЕНТОВ ================= */
let pickElements = new Map(), pickSeq = 0;
const selectedEls = new Set(), hiddenEls = new Map(), fadedEls = new Map();
const pickGroup = new THREE.Group(); scene.add(pickGroup);
const pickRay = new THREE.Raycaster();
const pickNdc = new THREE.Vector2();
function newPickElement(label){
const el = {id: ++pickSeq, label, objects: []};
pickElements.set(el.id, el);
return el;
}
function attachPick(el, obj){
if(!el) return obj;
obj.userData.pickId = el.id;
el.objects.push(obj);
return obj;
}
function isChainVisible(obj){
while(obj && obj !== scene){
if(!obj.visible) return false;
obj = obj.parent;
}
return true;
}
function pickElementAt(clientX, clientY){
const r = canvas.getBoundingClientRect();
if(r.width < 2 || r.height < 2) return null;
pickNdc.x = ((clientX - r.left) / r.width) * 2 - 1;
pickNdc.y = -((clientY - r.top) / r.height) * 2 + 1;
pickRay.setFromCamera(pickNdc, camera);
const hits = pickRay.intersectObject(model, true);
for(const h of hits){
const id = h.object.userData.pickId;
if(id == null) continue;
const el = pickElements.get(id);
if(el && el.objects.some(o=>o.visible) && isChainVisible(h.object)) return el;
}
return null;
}
function ensurePickMaterial(o){
if(o.userData.pickBaseMat) return;
o.userData.pickBaseMat = o.material;
o.material = o.material.clone();
}
function clearPickHelpers(){
model.traverse(o=>{
if(o.userData.pickBaseCast !== undefined){
o.castShadow = o.userData.pickBaseCast;
delete o.userData.pickBaseCast;
}
if(o.userData.pickBaseMat){
if(o.material !== o.userData.pickBaseMat){
o.material.dispose();
o.material = o.userData.pickBaseMat;
}
delete o.userData.pickBaseMat;
}
});
while(pickGroup.children.length){
const h = pickGroup.children[0];
pickGroup.remove(h);
if(h.geometry) h.geometry.dispose();
if(h.material) h.material.dispose();
}
}
function rebuildPickHelpers(){
clearPickHelpers();
for(const el of fadedEls.values()){
el.objects.forEach(o=>{
ensurePickMaterial(o);
o.material.transparent = true;
o.material.opacity = 0.40;
o.material.depthWrite = false;
o.material.needsUpdate = true;
if(o.userData.pickBaseCast === undefined) o.userData.pickBaseCast = o.castShadow;
o.castShadow = false;
});
}
if(!selectedEls.size) return;
for(const id of selectedEls){
const el = pickElements.get(id);
if(!el) continue;
const box = new THREE.Box3();
el.objects.forEach(o=>{
if(!isChainVisible(o)) return;
box.expandByObject(o);
ensurePickMaterial(o);
o.material.emissive = new THREE.Color(0xff5a1f);
o.material.emissiveIntensity = 0.45;
});
if(box.isEmpty()) continue;
const helper = new THREE.Box3Helper(box.clone(), 0xffb36b);
helper.material.depthTest = false;
helper.material.transparent = true;
helper.material.opacity = 0.95;
helper.renderOrder = 999;
pickGroup.add(helper);
}
}
function selectionLabel(){
const count = {};
for(const id of selectedEls){
const el = pickElements.get(id);
if(el) count[el.label] = (count[el.label] || 0) + 1;
}
const labels = Object.keys(count).map(k=> count[k] > 1 ? k + ' × ' + count[k] : k);
if(!labels.length) return '';
return labels.slice(0, 2).join(', ') + (labels.length > 2 ? ' +' + (labels.length - 2) : '');
}
function updateSelBar(){
const bar = $('selBar');
if(!bar) return;
const hasSel = selectedEls.size > 0;
const hasHidden = hiddenEls.size > 0;
const hasFaded = fadedEls.size > 0;
bar.hidden = !hasSel && !hasHidden && !hasFaded;
bar.classList.toggle('no-sel', !hasSel);
$('selCount').textContent = String(selectedEls.size);
const label = hasSel ? selectionLabel() : '';
$('selName').textContent = label;
$('selName').title = label;
$('selHiddenRow').hidden = !hasHidden;
$('selHiddenCount').textContent = String(hiddenEls.size);
$('selFadedRow').hidden = !hasFaded;
$('selFadedCount').textContent = String(fadedEls.size);
$('selHide').disabled = !hasSel;
const allFaded = hasSel && [...selectedEls].every(id=>fadedEls.has(id));
const fadeBtn = $('selFade');
fadeBtn.textContent = allFaded ? 'Сделать непрозрачными' : 'Полупрозрачные';
fadeBtn.setAttribute('aria-pressed', String(allFaded));
fadeBtn.disabled = !hasSel;
fadeBtn.title = allFaded
? 'Вернуть выбранным элементам непрозрачность'
: 'Сделать выбранные элементы полупрозрачными';
}
function clearSelection(update){
selectedEls.clear();
rebuildPickHelpers();
if(update !== false) updateSelBar();
}
function togglePick(el, additive){
if(!el){ if(!additive) clearSelection(); return; }
if(additive){
if(selectedEls.has(el.id)) selectedEls.delete(el.id);
else selectedEls.add(el.id);
}else if(selectedEls.size === 1 && selectedEls.has(el.id)){
selectedEls.clear();
}else{
selectedEls.clear();
selectedEls.add(el.id);
}
rebuildPickHelpers();
updateSelBar();
}
function hideSelected(){
if(!selectedEls.size) return;
for(const id of selectedEls){
const el = pickElements.get(id);
if(!el) continue;
el.objects.forEach(o=>{ o.visible = false; });
hiddenEls.set(id, el);
}
selectedEls.clear();
rebuildPickHelpers();
updateSelBar();
}
function restoreHidden(){
hiddenEls.forEach(el=> el.objects.forEach(o=>{ o.visible = true; }));
hiddenEls.clear();
updateSelBar();
}
function fadeSelected(){
if(!selectedEls.size) return;
const allFaded = [...selectedEls].every(id=>fadedEls.has(id));
if(allFaded){
selectedEls.forEach(id=>fadedEls.delete(id));
}else{
selectedEls.forEach(id=>{
const el = pickElements.get(id);
if(el) fadedEls.set(id, el);
});
}
rebuildPickHelpers();
updateSelBar();
}
function restoreFaded(){
if(!fadedEls.size) return;
fadedEls.clear();
rebuildPickHelpers();
updateSelBar();
}
function resetPickState(){
pickElements = new Map();
pickSeq = 0;
selectedEls.clear();
hiddenEls.clear();
fadedEls.clear();
clearPickHelpers();
updateSelBar();
}
/* ================= СХЕМА СЕЧЕНИЯ ================= */
function ar(x,y,d){
const s = 4.5;
if(d==='u') return 'M'+x+' '+y+' l'+(-s*0.5)+' '+s+' h'+s+' z';
if(d==='d') return 'M'+x+' '+y+' l'+(-s*0.5)+' '+(-s)+' h'+s+' z';
if(d==='l') return 'M'+x+' '+y+' l'+s+' '+(-s*0.5)+' v'+s+' z';
return 'M'+x+' '+y+' l'+(-s)+' '+(-s*0.5)+' v'+s+' z';
}
function secSVG(W,H,P,rolled){
const h=P.h, b=P.b, s=P.s, t=P.t;
const L=28, R=20, T=8, B=24;
const k = Math.min((W-L-R)/b, (H-T-B)/h);
const bw=b*k, hh=h*k, sw=Math.max(1.6,s*k), tk=Math.max(2.0,t*k);
const cx=L+(W-L-R)/2, cy=T+(H-T-B)/2;
const x0=cx-bw/2, x1=cx+bw/2, y0=cy-hh/2, y1=cy+hh/2;
const slope = rolled ? 0.16 : 0;
const it = tk + (bw-sw)/2*slope;
const d = 'M'+x0+' '+y0+' L'+x1+' '+y0+' L'+x1+' '+(y0+tk)+' L'+(cx+sw/2)+' '+(y0+it)+
' L'+(cx+sw/2)+' '+(y1-it)+' L'+x1+' '+(y1-tk)+' L'+x1+' '+y1+' L'+x0+' '+y1+
' L'+x0+' '+(y1-tk)+' L'+(cx-sw/2)+' '+(y1-it)+' L'+(cx-sw/2)+' '+(y0+it)+
' L'+x0+' '+(y0+tk)+' Z';
const dc = '#39444f', F = 'font-family="IBM Plex Mono, monospace"';
let g = '<path d="'+d+'" fill="#7f8c95" stroke="#141c26" stroke-width="1.2" stroke-linejoin="round"/>';
g += '<line x1="'+(x0-2)+'" y1="'+y0+'" x2="12" y2="'+y0+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="'+(x0-2)+'" y1="'+y1+'" x2="12" y2="'+y1+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="14" y1="'+y0+'" x2="14" y2="'+y1+'" stroke="'+dc+'" stroke-width=".8"/>';
g += '<path d="'+ar(14,y0,'u')+'" fill="'+dc+'"/><path d="'+ar(14,y1,'d')+'" fill="'+dc+'"/>';
g += '<text x="9" y="'+cy+'" font-size="9" font-weight="600" fill="'+dc+'" text-anchor="middle" transform="rotate(-90 9 '+cy+')" '+F+'>h</text>';
g += '<text x="21" y="'+cy+'" font-size="7.5" fill="'+dc+'" text-anchor="middle" transform="rotate(-90 21 '+cy+')" '+F+'>='+h+'</text>';
const yb = H-10;
g += '<line x1="'+x0+'" y1="'+(y1+2)+'" x2="'+x0+'" y2="'+(yb+3)+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="'+x1+'" y1="'+(y1+2)+'" x2="'+x1+'" y2="'+(yb+3)+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="'+x0+'" y1="'+yb+'" x2="'+x1+'" y2="'+yb+'" stroke="'+dc+'" stroke-width=".8"/>';
g += '<path d="'+ar(x0,yb,'l')+'" fill="'+dc+'"/><path d="'+ar(x1,yb,'r')+'" fill="'+dc+'"/>';
g += '<text x="'+cx+'" y="'+(yb-3)+'" font-size="9" font-weight="600" fill="'+dc+'" text-anchor="middle" '+F+'>b</text>';
g += '<text x="'+cx+'" y="'+(H-1)+'" font-size="7.5" fill="'+dc+'" text-anchor="middle" '+F+'>='+b+'</text>';
const ym = cy;
g += '<line x1="'+(cx-sw/2-14)+'" y1="'+ym+'" x2="'+(cx-sw/2)+'" y2="'+ym+'" stroke="'+dc+'" stroke-width=".8"/>';
g += '<line x1="'+(cx+sw/2)+'" y1="'+ym+'" x2="'+(cx+sw/2+14)+'" y2="'+ym+'" stroke="'+dc+'" stroke-width=".8"/>';
g += '<path d="'+ar(cx-sw/2,ym,'r')+'" fill="'+dc+'"/><path d="'+ar(cx+sw/2,ym,'l')+'" fill="'+dc+'"/>';
g += '<text x="'+(cx+sw/2+16)+'" y="'+(ym+3)+'" font-size="9" font-weight="600" fill="'+dc+'" '+F+'>s</text>';
const xd = x0 + bw*0.26;
g += '<line x1="'+(xd-4)+'" y1="'+(y1-tk)+'" x2="'+(xd+4)+'" y2="'+(y1-tk)+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="'+(xd-4)+'" y1="'+y1+'" x2="'+(xd+4)+'" y2="'+y1+'" stroke="'+dc+'" stroke-width=".7"/>';
g += '<line x1="'+xd+'" y1="'+(y1-tk)+'" x2="'+xd+'" y2="'+y1+'" stroke="'+dc+'" stroke-width=".8"/>';
g += '<path d="'+ar(xd,y1-tk,'u')+'" fill="'+dc+'"/><path d="'+ar(xd,y1,'d')+'" fill="'+dc+'"/>';
g += '<text x="'+(xd-4)+'" y="'+(y1-tk/2)+'" font-size="8" font-weight="600" fill="'+dc+'" text-anchor="middle" transform="rotate(-90 '+(xd-4)+' '+(y1-tk/2)+')" '+F+'>t</text>';
return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+g+'</svg>';
}
function drawPreviews(p){
$('svgCol').innerHTML = secSVG(150,118, p.col.mm, false);
$('svgGir').innerHTML = secSVG(150,118, p.gir.mm, false);
$('svgDN').innerHTML  = secSVG(150,118, p.dn.mm, true);
$('svgSec').innerHTML = secSVG(150,118, p.sc.mm, true);
const mA = (p.col.hw*p.col.tw + 2*p.col.bf*p.col.tf)*1e-6*7850;
const gA = (p.gir.hw*p.gir.tw + 2*p.gir.bf*p.gir.tf)*1e-6*7850;
$('metaCol').innerHTML = 'сварной двутавр<br>h=<b>'+p.col.mm.h+'</b> b=<b>'+p.col.mm.b+'</b> s=<b>'+p.col.mm.s+'</b> t=<b>'+p.col.mm.t+'</b><br>A=<b>'+((p.col.hw*p.col.tw+2*p.col.bf*p.col.tf)/100).toFixed(1)+' см²</b> · <b>'+mA.toFixed(1)+' кг/м</b>';
$('metaGir').innerHTML = 'сварной двутавр<br>h=<b>'+p.gir.mm.h+'</b> b=<b>'+p.gir.mm.b+'</b> s=<b>'+p.gir.mm.s+'</b> t=<b>'+p.gir.mm.t+'</b><br>A=<b>'+((p.gir.hw*p.gir.tw+2*p.gir.bf*p.gir.tf)/100).toFixed(1)+' см²</b> · <b>'+gA.toFixed(1)+' кг/м</b>';
$('metaDN').innerHTML  = GOST_NAME[p.dn.gost]+', '+p.dn.id+'<br>h=<b>'+p.dn.mm.h+'</b> b=<b>'+p.dn.mm.b+'</b> s=<b>'+p.dn.mm.s+'</b> t=<b>'+p.dn.mm.t+'</b><br>масса <b>'+p.dn.m+' кг/м</b>';
$('metaSec').innerHTML = GOST_NAME[p.sc.gost]+', '+p.sc.id+'<br>h=<b>'+p.sc.mm.h+'</b> b=<b>'+p.sc.mm.b+'</b> s=<b>'+p.sc.mm.s+'</b> t=<b>'+p.sc.mm.t+'</b><br>масса <b>'+p.sc.m+' кг/м</b>';
}
/* ================= ПОСТРОЕНИЕ МОДЕЛИ ================= */
function clearModel(){
model.traverse(o=>{ if(o.geometry && o.geometry.dispose && !geoCache.has(o.geometry)) o.geometry.dispose(); });
while(model.children.length) model.remove(model.children[0]);
}
function linePos(a, b, step){
const r = [a];
for(let x=a+step; x < b-0.05; x+=step) r.push(x);
r.push(b); return r;
}
function build(){
resetPickState();
clearModel();
const p = readParams();
const warns = [];
const complex = (p.cell === 'complex');
const L = p.span, nX = p.nAlong, LT = L*nX;
const sg = p.step, ng = p.count, td = p.deck;
const Hg = p.gir.H, Hdn = p.dn.H, Hsc = p.sc.H;
/* Колонна развёрнута на 90°: высота сечения H идёт вдоль X (пролёт),
   ширина полки B — вдоль Z. Полугабариты колонны в плане: */
const secH = p.col.H, secB = p.col.B;
const colHX = secH/2, colHZ = secB/2;
const z0 = -(ng-1)*sg/2, zMax = (ng-1)*sg/2;
const xs = []; for(let j=0;j<=nX;j++) xs.push(-LT/2 + j*L);
const dnTop = p.elev - td;
let girTop, secTop = null;
if(complex){ secTop = dnTop - Hdn; girTop = secTop - Hsc; }
else if(p.jointDN === 'top'){ girTop = dnTop - Hdn; }
else { girTop = dnTop; }
const girBot = girTop - Hg;
const topJoint = (p.joint === 'top');
/* При опирании сверху балка стоит на торцевых опорных рёбрах, а они — на плите
   оголовка (размеры оголовка — HEAD в начале файла): между нижним поясом балки
   и плитой остаётся выступ ребра ribProtrusion. endRibT — толщина опорного ребра балки. */
const ribProtrusion = 0.020, endRibT = 0.020;
/* ширина торцевого ребра — на 10 мм уже пояса балки с каждой стороны */
const ribW = Math.max(p.gir.B - 0.02, 0.10);
const colTop = topJoint ? girBot - HEAD.plateT - ribProtrusion : girTop;
const colH = colTop - FBASE;
if(colH < 0.15) warns.push('Отметка верха настила слишком мала — колонны не помещаются. Увеличьте отметку или уменьшите высоты сечений.');
if(!complex && p.jointDN === 'side' && sg - p.gir.B < 0.15)
warns.push('Шаг главных балок меньше ширины их полки — балкам настила нет места между поясками.');
const gDeck=new THREE.Group(), gDN=new THREE.Group(), gSec=new THREE.Group(),
gGir=new THREE.Group(), gCol=new THREE.Group(), gFound=new THREE.Group(), gDims=new THREE.Group();
groups.deck=gDeck; groups.dn=gDN; groups.sec=gSec; groups.gir=gGir; groups.col=gCol; groups.found=gFound; groups.dims=gDims;
let mCol = 0, nCol = 0, mBase = 0;
for(const x of xs) for(let i=0;i<ng;i++){
const z = z0 + i*sg;
if(colH > 0.01){
const elCol = newPickElement('Колонна');
const c = beam(p.col, MAT.col, colH);
/* поворот на 90° вокруг вертикальной оси: H вдоль X, B вдоль Z */
c.rotation.order = 'YXZ';
c.rotation.set(-Math.PI/2, Math.PI/2, 0);
c.position.set(x + colHX, FBASE, z);
gCol.add(attachPick(elCol, c)); nCol++; mCol += colH * p.col.A * RHO;
if(topJoint){
const elHead = newPickElement('Оголовок колонны');
/* плита — сечение колонны со свесами outX / outZ */
const headW = secH + 2*HEAD.outX;
const headD = Math.max(secB, p.gir.B) + 2*HEAD.outZ;
const head = box(headW, HEAD.plateT, headD, MAT.plate);
head.position.set(x, colTop + HEAD.plateT/2, z);
gCol.add(attachPick(elHead, head));
mCol += headW * HEAD.plateT * headD * RHO;
/* ребро — трапеция широким основанием к плите, проходит сквозь стенку колонны.
   Ширина по плите — по ribFit (см. HEAD), высота — ribH·H колонны, но не менее
   ribHmin; на короткой колонне укорачивается, чтобы до низа осталось ribGap */
const hRibH = Math.min(Math.max(secH*HEAD.ribH, HEAD.ribHmin), colH - HEAD.ribGap);
if(hRibH >= HEAD.ribGap){
const hRibW = Math.min(headD - 2*HEAD.ribFit, Math.max(ribW + HEAD.ribFit, secB - HEAD.ribFit));
/* travGeo(ширина внизу, ширина вверху, высота, толщина) */
const hRib = new THREE.Mesh(travGeo(hRibW*HEAD.ribTaper, hRibW, hRibH, HEAD.ribT, 0, 0), MAT.trav);
hRib.castShadow = true; hRib.receiveShadow = true;
/* плоскость трапеции — Y-Z (толщина вдоль X), верх — вровень с низом плиты */
hRib.rotation.set(0, Math.PI/2, 0);
hRib.position.set(x - HEAD.ribT/2, colTop - hRibH, z);
gCol.add(attachPick(elHead, hRib));
/* диафрагма — на всю ширину между полками колонны (с зазором diaGap); её выступ над
   поверхностью стенки равен выступу низа трапеции, поэтому длина вдоль полок —
   в низ трапеции (но не длиннее самих полок, с зазором diaGap) */
const diaW = Math.max(secH - 2*p.col.tf - HEAD.diaGap, 0.02);
const diaD = Math.min(hRibW*HEAD.ribTaper, Math.max(secB - HEAD.diaGap, 0.02));
const dia = box(diaW, HEAD.diaT, diaD, MAT.trav);
dia.position.set(x, colTop - hRibH - HEAD.diaT/2, z);
gCol.add(attachPick(elHead, dia));
mCol += ((1 + HEAD.ribTaper)/2*hRibW*hRibH*HEAD.ribT + diaW*diaD*HEAD.diaT)*RHO;
}
}
}
if(p.base === 'fixed'){
/* ===== ЖЁСТКАЯ БАЗА С ТРАВЕРСАМИ (не поворачивается) =====
   фундамент (2 ступени) → подливка → опорная плита; колонна доходит до плиты;
   две трапециевидные траверсы ПЕРПЕНДИКУЛЯРНО полкам колонны;
   сверху планки с анкерными болтами (двойные гайки) */
const elFound  = newPickElement('Фундамент');
const elBase   = newPickElement('База колонны');
const elTrav   = newPickElement('Траверсы');
const elAnchor = newPickElement('Анкерные болты');
const plateT = 0.050, groutT = 0.030, pedH = 0.12;
const footH  = FBASE - plateT - groutT - pedH;
const travH  = clamp(secH*1.0, 0.24, 0.40);
const travTopW = secH + 0.34;
const travBotW = secH + 0.02;
const travT  = 0.020;
const capT = 0.020, capW = 0.12;
const plateW = travTopW - 0.24;
const plateD = Math.max(secB + 0.28, 0.54);
const capD = plateD;
const pedW = plateW + 0.22, pedD = plateD + 0.22;
const footW = pedW + 0.34;
const plateBot = FBASE - plateT;
const foot = box(footW, footH, footW, MAT.conc);
foot.position.set(x, footH/2, z); gFound.add(attachPick(elFound, foot));
const ped = box(pedW, pedH, pedD, MAT.conc);
ped.position.set(x, footH + pedH/2, z); gFound.add(attachPick(elFound, ped));
const grout = box(plateW + 0.04, groutT, plateD + 0.04, MAT.grout);
grout.position.set(x, footH + pedH + groutT/2, z); gFound.add(attachPick(elFound, grout));
const plate = box(plateW, plateT, plateD, MAT.plate);
plate.position.set(x, plateBot + plateT/2, z); gFound.add(attachPick(elBase, plate));
/* траверсы — пластины в плоскости X-Y (перпендикулярно полкам, которые теперь в плоскости Y-Z) */
const capX = travTopW/2 - capW/2;
for(const sz of [-1,1]){
const tv = new THREE.Mesh(travGeo(travBotW, travTopW, travH, travT, 0.028, 0.07), MAT.trav);
tv.castShadow = true; tv.receiveShadow = true;
tv.position.set(x, FBASE, z + sz*(secB/2 + travT/2) - travT/2);
gFound.add(attachPick(elTrav, tv));
}
for(const sx of [-1,1]){
const cap = box(capW, capT, capD, MAT.plate);
cap.position.set(x + sx*capX, FBASE + travH + capT/2, z);
gFound.add(attachPick(elTrav, cap));
}
const bx0 = capX, bz0 = capD/2 - 0.18;
const rodR = 0.014, rodBot = 0.06;
const washerH = 0.008, nutH = 0.026;
const capTop = FBASE + travH + capT;
const rodTop = capTop + washerH + 2*nutH + 0.035;
for(const sx of [-1,1]) for(const sz of [-1,1]){
const bx = x + sx*bx0, bz = z + sz*bz0;
const rod = cyl(rodR, rodR, rodTop - rodBot, MAT.bolt, 12);
rod.position.set(bx, (rodBot + rodTop)/2, bz); gFound.add(attachPick(elAnchor, rod));
const leg = cyl(rodR, rodR, 0.12, MAT.bolt, 12); leg.rotation.z = Math.PI/2;
leg.position.set(bx - sx*0.06, rodBot, bz); gFound.add(attachPick(elAnchor, leg));
const hook = cyl(rodR, rodR, 0.05, MAT.bolt, 12);
hook.position.set(bx - sx*0.12, rodBot + 0.025, bz); gFound.add(attachPick(elAnchor, hook));
const washer = cyl(0.042, 0.042, washerH, MAT.bolt, 20);
washer.position.set(bx, capTop + washerH/2, bz); gFound.add(attachPick(elAnchor, washer));
for(let k=0;k<2;k++){
const nut = cyl(0.032, 0.032, nutH, MAT.bolt, 6);
nut.position.set(bx, capTop + washerH + nutH/2 + k*(nutH + 0.003), bz);
gFound.add(attachPick(elAnchor, nut));
}
}
const travArea = (travBotW + travTopW)/2*travH - Math.PI*0.028*0.028;
const boltVol = 4*(Math.PI*rodR*rodR*(rodTop - rodBot) + 2*Math.PI*0.032*0.032*nutH + Math.PI*0.042*0.042*washerH);
mBase += (plateW*plateD*plateT + 2*travArea*travT + 2*capW*capD*capT + boltVol)*RHO;
}else{
/* Шарнирная база: фундамент → подколонник → подливка → плита → анкеры */
const elFound = newPickElement('Фундамент');
const elBase = newPickElement('База колонны');
  const plateW = Math.max(secH + 0.30, 0.48);
   const plateD = Math.max(secB + 0.30, 0.48);
   const plateT = 0.055, groutT = 0.025, pedH = 0.10;
   const pedW = plateW + 0.30, pedD = plateD + 0.30;
   const footH = FBASE - plateT - groutT - pedH;
   const footW = Math.max(pedW + 0.42, 1.20);
   const foot = box(footW, footH, footW, MAT.conc);
   foot.position.set(x, footH/2, z); gFound.add(attachPick(elFound, foot));
   const ped = box(pedW, pedH, pedD, MAT.conc);
   ped.position.set(x, footH + pedH/2, z); gFound.add(attachPick(elFound, ped));
   const grout = box(plateW + 0.04, groutT, plateD + 0.04, MAT.grout);
   grout.position.set(x, footH + pedH + groutT/2, z); gFound.add(attachPick(elFound, grout));
   const plate = box(plateW, plateT, plateD, MAT.plate);
   plate.position.set(x, FBASE - plateT/2, z); gFound.add(attachPick(elBase, plate));
   const ax = plateW/2 - 0.075, az = plateD/2 - 0.075;
   const rodR = 0.012, rodBot = 0.10;
   const washerH = 0.006, nutH = 0.022;
   const rodTop = FBASE + washerH + 2*nutH + 0.03;
   for(const sx of [-1,1]) for(const sz of [-1,1]){
     const bx = x + sx*ax, bz = z + sz*az;
     const rod = cyl(rodR, rodR, rodTop - rodBot, MAT.bolt, 12);
     rod.position.set(bx, (rodBot + rodTop)/2, bz);
     gFound.add(attachPick(elBase, rod));
     const leg = cyl(rodR, rodR, 0.10, MAT.bolt, 12);
     leg.rotation.z = Math.PI/2;
     leg.position.set(bx - sx*0.05, rodBot, bz);
     gFound.add(attachPick(elBase, leg));
     const hook = cyl(rodR, rodR, 0.045, MAT.bolt, 12);
     hook.position.set(bx - sx*0.10, rodBot + 0.0225, bz);
     gFound.add(attachPick(elBase, hook));
     const washer = cyl(0.036, 0.036, washerH, MAT.bolt, 20);
     washer.position.set(bx, FBASE + washerH/2, bz);
     gFound.add(attachPick(elBase, washer));
     for(let k=0;k<2;k++){
       const nut = cyl(0.028, 0.028, nutH, MAT.bolt, 6);
       nut.position.set(bx, FBASE + washerH + nutH/2 + k*(nutH + 0.002), bz);
       gFound.add(attachPick(elBase, nut));
     }
   }
 }
}
let mGir = 0, nGir = 0;
const posX = linePos(-LT/2, LT/2, complex ? p.scStep : p.dnStep);
const posZ = linePos(z0, zMax, p.dnStep);
const girLen = (p.joint === 'top') ? L : L - 2*colHX;
const sideJoint = !topJoint;
/* Отправочный элемент главной балки — тело и торцевые опорные пластины (рёбра), выступающие
   под нижний пояс на ribProtrusion, а над верхний пояс — если на него ничего не опирается.
   Наружная грань пластины — на оси колонны (опирание сверху) либо на пластине, приваренной
   к полке колонны (примыкание сбоку): от неё тело балки отступает на inset + endRibT */
const inset = sideJoint ? TABLE.plateT : 0;
/* над верхним поясом не должно быть опирающихся конструкций — там пластину срезают заподлицо
   с поясом; настил лежит прямо на поясах при сопряжении балок настила сбоку */
const topHalf = complex ? p.sc.B/2 : (p.jointDN === 'top' ? p.dn.B/2 : Infinity);
const ribUpAt = x => (topHalf === Infinity || posX.some(px=> Math.abs(px - x) < topHalf + 0.01)) ? 0 : ribProtrusion;
/* ряды болтов между полками балки: крайние — на расстоянии edge от внутренней грани полки,
   промежуточные — равномерно между ними */
const rowYs = (n, span, edge) => Array.from({length:n}, (_,k)=> girBot + p.gir.tf + edge + (n > 1 ? span*k/(n-1) : span/2));
/* Опирание сверху: рёбра смежных балок стянуты монтажными болтами; нижний пояс каждого конца
   балки крепится к плите оголовка двумя болтами рядом с ребром (головка на поясе, гайка под плитой). */
const jBolt = topJoint ? boltBesideWeb(ribW/2, p.gir.tw/2, endRibT) : null;
/* гайки должны поместиться под плитой между полками колонны */
const anchorMax = (secH - 2*p.col.tf)/2 - 0.024 - endRibT;
const aBolt = (topJoint && anchorMax >= 0.032) ? boltBesideWeb(p.gir.B/2, p.gir.tw/2, 0.024) : null;
const gripA = p.gir.tf + ribProtrusion + HEAD.plateT, anchorOff = clamp(anchorMax, 0.032, 0.05);
const edgeM = jBolt ? Math.max(2*jBolt.d, 0.06) : 0;
const rowSpan = p.gir.hw - 2*edgeM;
const nRow = (jBolt && rowSpan > 0.05) ? clamp(Math.round(rowSpan/0.19) + 1, 1, 7) : 0;
/* Примыкание сбоку: монтажные болты сквозь торцевую пластину, пластину столика и полку
   колонны — рядом со стенкой, ось болта не выходит за полку колонны, гайка — внутри колонны */
const sBolt = sideJoint ? boltBesideWeb(Math.min(ribW, secB)/2, p.gir.tw/2, endRibT) : null;
const gripS = endRibT + TABLE.plateT + p.col.tf;
const edgeS = sBolt ? Math.max(2*sBolt.d, 0.06) : 0;
const rowSpanS = p.gir.hw - 2*edgeS;
const nRowS = (sBolt && rowSpanS > 0.05) ? clamp(Math.round(rowSpanS/TABLE.rowPitch) + 1, 1, 5) : 0;
/* столик: высота — доля высоты балки, на короткой колонне меньше; ширина — не шире полки колонны */
const tabH = Math.max(Math.min(Math.max(TABLE.height*Hg, TABLE.heightMin), colH - ribProtrusion - TABLE.gapBase), 0.05);
const tabW = Math.max(Math.min(ribW + 2*TABLE.overZ, secB - 0.002), 0.02);
for(let i=0;i<ng;i++){
const z = z0 + i*sg;
for(let j=0;j<nX;j++){
const xStart = (p.joint === 'top') ? xs[j] : xs[j] + colHX;
const elGir = newPickElement('Главная балка');
const bodyLen = girLen - 2*(inset + endRibT);
const m = beam(p.gir, MAT.gir, bodyLen);
m.rotation.y = Math.PI/2;
m.position.set(xStart + inset + endRibT, girBot, z);
gGir.add(attachPick(elGir, m)); nGir++; mGir += bodyLen * p.gir.A * RHO;
for(const [ex, dir] of [[xStart, 1], [xStart + girLen, -1]]){
/* торцевая опорная пластина: наружная грань — на оси колонны (сверху)
   или на пластине столика (сбоку) */
const ribH = Hg + ribProtrusion + ribUpAt(ex);
const rib = box(endRibT, ribH, ribW, MAT.plate);
rib.position.set(ex + dir*(inset + endRibT/2), girBot - ribProtrusion + ribH/2, z);
gGir.add(attachPick(newPickElement('Опорное ребро'), rib));
mGir += endRibT * ribH * ribW * RHO;
if(topJoint){
/* крепление нижнего пояса к плите оголовка: по болту с каждой стороны стенки,
   ось — на anchorOff от внутренней грани ребра */
if(aBolt){
const elA = newPickElement('Анкерные болты оголовка');
for(const sz of [-1,1]){
const b = new THREE.Mesh(boltGeo(aBolt.d, gripA), MAT.bolt);
b.castShadow = true; b.receiveShadow = true;
b.rotation.z = Math.PI;
b.position.set(ex + dir*(endRibT + anchorOff), girBot + p.gir.tf, z + sz*aBolt.z);
gGir.add(attachPick(elA, b));
}
mGir += 2*boltMass(aBolt.d, gripA);
}
}else{
/* пластина, приваренная к полке колонны: нижняя часть — столик под торцевой пластиной
   (шире неё на overZ), верхняя — за торцевой пластиной, до верха колонны */
const tT = TABLE.plateT, hUp = Hg + ribProtrusion;
const elTab = newPickElement('Опорный столик');
const tabUp = box(tT, hUp, ribW, MAT.trav);
tabUp.position.set(ex + dir*tT/2, girBot - ribProtrusion + hUp/2, z);
const tab = box(tT, tabH, tabW, MAT.trav);
tab.position.set(ex + dir*tT/2, girBot - ribProtrusion - tabH/2, z);
gCol.add(attachPick(elTab, tabUp), attachPick(elTab, tab));
mCol += tT*(hUp*ribW + tabH*tabW)*RHO;
/* монтажные болты: головка на внутренней грани торцевой пластины, гайка — внутри колонны */
if(nRowS){
const elM = newPickElement('Монтажные болты');
for(const y of rowYs(nRowS, rowSpanS, edgeS)) for(const sz of [-1,1]){
const b = new THREE.Mesh(boltGeo(sBolt.d, gripS), MAT.bolt);
b.castShadow = true; b.receiveShadow = true;
b.rotation.z = dir*Math.PI/2;
b.position.set(ex + dir*(tT + endRibT), y, z + sz*sBolt.z);
gGir.add(attachPick(elM, b));
}
mGir += 2*nRowS*boltMass(sBolt.d, gripS);
}
}
}
/* монтажные болты между рёбрами смежных балок — только над промежуточными колоннами */
if(topJoint && j > 0 && nRow){
const elM = newPickElement('Монтажные болты');
for(const y of rowYs(nRow, rowSpan, edgeM)) for(const sz of [-1,1]){
const b = new THREE.Mesh(boltGeo(jBolt.d, 2*endRibT), MAT.bolt);
b.castShadow = true; b.receiveShadow = true;
b.rotation.z = -Math.PI/2;
b.position.set(xStart - endRibT, y, z + sz*jBolt.z);
gGir.add(attachPick(elM, b));
}
mGir += 2*nRow*boltMass(jBolt.d, 2*endRibT);
}
}
}
let mDN = 0, nDN = 0, mSec = 0, nSec = 0;
if(complex){
const secLen = zMax - z0;
for(const x of posX){
const m = beam(p.sc, MAT.sec, secLen);
m.position.set(x, secTop - Hsc, z0);
gSec.add(attachPick(newPickElement('Второстепенная балка'), m)); nSec++;
}
mSec = nSec * secLen * p.sc.m;
for(const z of posZ){
const m = beam(p.dn, MAT.dn, LT);
m.rotation.y = Math.PI/2;
m.position.set(-LT/2, dnTop - Hdn, z);
gDN.add(attachPick(newPickElement('Балка настила'), m)); nDN++;
}
mDN = nDN * LT * p.dn.m;
}else if(p.jointDN === 'side'){
const segLen = sg - p.gir.B;
if(segLen >= 0.05){
for(let i=0;i<ng-1;i++){
const a = z0 + i*sg + p.gir.B/2;
for(const x of posX){
const m = beam(p.dn, MAT.dn, segLen);
m.position.set(x, dnTop - Hdn, a);
gDN.add(attachPick(newPickElement('Балка настила'), m)); nDN++;
}
}
mDN = nDN * segLen * p.dn.m;
}else warns.push('Между поясками главных балок нет места балкам настила — увеличьте шаг главных балок.');
}else{
const fullLen = zMax - z0;
for(const x of posX){
const m = beam(p.dn, MAT.dn, fullLen);
m.position.set(x, dnTop - Hdn, z0);
gDN.add(attachPick(newPickElement('Балка настила'), m)); nDN++;
}
mDN = nDN * fullLen * p.dn.m;
}
let mDeck = 0, nPanel = 0;
if(complex){
for(let k=0;k<posZ.length-1;k++){
const d = posZ[k+1] - posZ[k] - PGAP;
if(d <= 0.05) continue;
const pnl = box(LT, td, d, MAT.deck);
pnl.position.set(0, p.elev - td/2, (posZ[k]+posZ[k+1])/2);
gDeck.add(attachPick(newPickElement('Лист настила'), pnl)); nPanel++; mDeck += LT * d * td * RHO;
}
}else{
const deckW = zMax - z0;
for(let k=0;k<posX.length-1;k++){
const w = posX[k+1] - posX[k] - PGAP;
if(w <= 0.05) continue;
const pnl = box(w, td, deckW, MAT.deck);
pnl.position.set((posX[k]+posX[k+1])/2, p.elev - td/2, 0);
gDeck.add(attachPick(newPickElement('Лист настила'), pnl)); nPanel++; mDeck += w * deckW * td * RHO;
}
}
const y0 = 0.06, zoff = z0 - 1.15;
gDims.add(ln(new THREE.Vector3(xs[0],y0,zoff), new THREE.Vector3(xs[1],y0,zoff)));
gDims.add(ln(new THREE.Vector3(xs[0],0.03,z0), new THREE.Vector3(xs[0],y0,zoff-0.15)));
gDims.add(ln(new THREE.Vector3(xs[1],0.03,z0), new THREE.Vector3(xs[1],y0,zoff-0.15)));
gDims.add(ln(new THREE.Vector3(xs[0]-0.09,y0,zoff), new THREE.Vector3(xs[0]+0.09,y0,zoff)));
gDims.add(ln(new THREE.Vector3(xs[1]-0.09,y0,zoff), new THREE.Vector3(xs[1]+0.09,y0,zoff)));
const lbl1 = makeLabel(String(Math.round(L*1000)), 0.62); lbl1.position.set(xs[0]+L/2, 0.38, zoff-0.3); gDims.add(lbl1);
if(nX > 1){
const zoff2 = zoff - 0.95;
gDims.add(ln(new THREE.Vector3(xs[0],y0,zoff2), new THREE.Vector3(xs[nX],y0,zoff2)));
gDims.add(ln(new THREE.Vector3(xs[nX],0.03,z0), new THREE.Vector3(xs[nX],y0,zoff2-0.15)));
gDims.add(ln(new THREE.Vector3(xs[0]-0.09,y0,zoff2), new THREE.Vector3(xs[0]+0.09,y0,zoff2)));
gDims.add(ln(new THREE.Vector3(xs[nX]-0.09,y0,zoff2), new THREE.Vector3(xs[nX]+0.09,y0,zoff2)));
const lblT = makeLabel(nX+'×'+Math.round(L*1000)+' = '+Math.round(LT*1000), 0.62);
lblT.position.set(0, 0.38, zoff2-0.3); gDims.add(lblT);
}
const xoff = -LT/2 - 1.15;
if(ng > 1){
gDims.add(ln(new THREE.Vector3(xoff,y0,z0), new THREE.Vector3(xoff,y0,z0+sg)));
gDims.add(ln(new THREE.Vector3(-LT/2-colHX-0.02,0.03,z0), new THREE.Vector3(xoff-0.15,y0,z0)));
gDims.add(ln(new THREE.Vector3(-LT/2-colHX-0.02,0.03,z0+sg), new THREE.Vector3(xoff-0.15,y0,z0+sg)));
gDims.add(ln(new THREE.Vector3(xoff,y0,z0-0.09), new THREE.Vector3(xoff,y0,z0+0.09)));
gDims.add(ln(new THREE.Vector3(xoff,y0,z0+sg-0.09), new THREE.Vector3(xoff,y0,z0+sg+0.09)));
const lbl2 = makeLabel(String(Math.round(sg*1000)), 0.5); lbl2.position.set(xoff-0.28, 0.34, z0+sg/2); gDims.add(lbl2);
}
if(colH > 0.01){
const hx = xs[0] - 0.85, hz = z0 - 0.85;
gDims.add(ln(new THREE.Vector3(hx, FBASE, hz), new THREE.Vector3(hx, colTop, hz)));
gDims.add(ln(new THREE.Vector3(hx-0.12, FBASE, hz), new THREE.Vector3(hx+0.12, FBASE, hz)));
gDims.add(ln(new THREE.Vector3(hx-0.12, colTop, hz), new THREE.Vector3(hx+0.12, colTop, hz)));
gDims.add(ln(new THREE.Vector3(xs[0]-colHX-0.02, FBASE, z0-colHZ-0.02), new THREE.Vector3(hx+0.15, FBASE, hz)));
gDims.add(ln(new THREE.Vector3(xs[0]-colHX-0.02, colTop, z0-colHZ-0.02), new THREE.Vector3(hx+0.15, colTop, hz)));
const lblH = makeLabel('H кол='+Math.round(colH*1000), 0.55, '#ffd9a0');
lblH.position.set(hx-0.55, (FBASE+colTop)/2, hz-0.35); gDims.add(lblH);
}
const edgeX = -LT/2, edgeZ = zMax;
gDims.add(ln(new THREE.Vector3(edgeX, p.elev, edgeZ), new THREE.Vector3(edgeX-0.55, p.elev+0.5, edgeZ+0.35)));
const lbl3 = makeLabel('▽ +'+p.elev.toFixed(3), 0.55, '#ffd9a0');
lbl3.position.set(edgeX-1.15, p.elev+0.68, edgeZ+0.6); gDims.add(lbl3);
[gDeck,gDN,gSec,gGir,gCol,gFound,gDims].forEach(g=> model.add(g));
for(const k in groups) groups[k].visible = vis[k];
$('chipSec').classList.toggle('disabled', !complex);
const bs = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
const ext = Math.max(bs.x, bs.z)*0.7 + 3;
key.position.set(bs.x*0.5+8, Math.max(bs.y*1.6, 9), bs.z*0.4+10);
const sc = key.shadow.camera;
sc.left=-ext; sc.right=ext; sc.top=ext; sc.bottom=-ext; sc.near=1; sc.far=200;
sc.updateProjectionMatrix();
scene.fog.near = Math.max(30, ext*1.6); scene.fog.far = scene.fog.near*4.5;
updateStats(p, {mCol, mGir, mSec, mDN, mDeck, mBase, nCol, nGir, nSec, nDN, nPanel, nFound:nCol,
total: mCol+mGir+mSec+mDN+mDeck+mBase, girTop, girBot, colH, complex, nX, LT, warns});
}
/* ================= ВЫВОД ================= */
function fmtMass(kg){ return kg >= 1000 ? (kg/1000).toFixed(2)+' т' : Math.round(kg)+' кг'; }
function setStat(el, txt){
if(el.textContent !== txt){ el.textContent = txt; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
}
function updateStats(p, s){
setStat($('stMass'), fmtMass(s.total));
$('stMassSub').textContent = 'балки '+fmtMass(s.mCol+s.mGir+s.mSec+s.mDN)+(s.mBase>0?' · базы '+fmtMass(s.mBase):'')+' · настил '+fmtMass(s.mDeck);
setStat($('stCount'), String(s.nCol + s.nGir + s.nSec + s.nDN));
$('stCountSub').textContent = 'кол '+s.nCol+' · гл '+s.nGir+' · вт '+s.nSec+' · б.н '+s.nDN;
setStat($('stColH'), Math.round(s.colH*1000)+' мм');
$('stColHSub').textContent = p.joint==='top'
? 'от обреза фундамента до оголовка колонны'
: 'от обреза фундамента до верха гл. балки';
const cells = [
['Тип клетки', s.complex ? 'усложнённый' : 'нормальный'],
['Отметка В. настила', '+'+p.elev.toFixed(3)+' м'],
['Пролёт гл. балки', p.span.toFixed(2)+' м'],
['Верх гл. балки', '+'+s.girTop.toFixed(3)+' м'],
['Шаг гл. балок', p.step.toFixed(2)+' м'],
['Низ гл. балки', '+'+Math.max(s.girBot,0).toFixed(3)+' м'],
['Балка—колонна', p.joint==='top'  ? 'сверху' : 'сбоку, столик'],
['База колонны', p.base==='fixed' ? 'заделка, траверсы' : 'шарнир'],
['Б. настила—главная', s.complex ? 'этажно (3 яруса)' : (p.jointDN==='top' ? 'сверху' : 'сбоку')],
['Высота колонны', Math.round(s.colH*1000)+' мм'],
['hd:КОЛИЧЕСТВО ЭЛЕМЕНТОВ',''],
['Колонны', s.nCol+' шт · '+fmtMass(s.mCol)],
['Фундаменты', s.nFound+' шт'],
['Базы колонн', p.base==='fixed' ? ('траверсы · '+fmtMass(s.mBase)) : 'шарнирные'],
['Главные балки', s.nGir+' шт · '+fmtMass(s.mGir)],
['Второстепенные', s.complex ? (p.sc.id+' · '+s.nSec+' шт · '+fmtMass(s.mSec)) : '— не применяются'],
['Балки настила', p.dn.id+' · '+s.nDN+' шт · '+fmtMass(s.mDN)],
['Листы настила', s.nPanel+' шт · '+fmtMass(s.mDeck)],
['hd:РАЗМЕРЫ ПЛАНА',''],
['Вдоль пролёта', s.nX+' × '+p.span.toFixed(1)+' = '+s.LT.toFixed(1)+' м'],
['Поперёк (шаг)', p.count+' × '+p.step.toFixed(1)+' м']
];
$('stGrid').innerHTML = cells.map(c=> c[0].startsWith('hd:')
? '<div class="stCell hd">'+c[0].slice(3)+'</div>'
: '<div class="stCell"><span>'+c[0]+'</span><b>'+c[1]+'</b></div>').join('');
setStat($('stSum'), fmtMass(s.total));
const st = $('status');
if(s.warns && s.warns.length){ st.textContent = '⚠ ' + s.warns[0]; st.classList.add('err'); }
else{ st.textContent = 'ЛКМ — вращение · клик по элементу — выбрать · ПКМ — панорама · 2×клик — вписать'; st.classList.remove('err'); }
}
/* ================= КОМПОНОВКИ ИНТЕРФЕЙСА ================= */
let layoutMode = 'board';
function setLayout(mode){
layoutMode = mode;
const app = $('app'), chips = $('chips'), cards = $('cards'), stamp = $('stamp'), btn = $('layoutBtn');
const panelEl = $('panel');
panelEl.classList.add('no-anim');
app.classList.toggle('board', mode==='board');
app.classList.toggle('panel', mode==='panel');
if(mode==='board') setPanelCollapsed(false);
if(mode==='board'){
$('chipsHost').appendChild(chips);
$('ctrlFoot').appendChild(btn);
app.appendChild(cards);
app.appendChild(stamp);
btn.textContent = '⊟ Компоновка: боковая панель';
}else{
$('stage').appendChild(chips);
$('stage').appendChild(cards);
$('stage').appendChild(stamp);
$('stage').appendChild(btn);
btn.textContent = '⊞ Компоновка: чертёжный лист';
}
requestAnimationFrame(()=>{
panelEl.classList.remove('no-anim');
resize();
});
}
$('layoutBtn').addEventListener('click', ()=> setLayout(layoutMode==='board' ? 'panel' : 'board'));
/* ================= СВОРАЧИВАНИЕ БОКОВОЙ ПАНЕЛИ ================= */
const panelAside = $('panel');
const panelToggle = $('pToggle');
function setPanelCollapsed(collapsed){
panelAside.classList.toggle('is-collapsed', collapsed);
panelToggle.setAttribute('aria-expanded', String(!collapsed));
const label = collapsed ? 'Развернуть панель' : 'Свернуть панель';
panelToggle.title = label;
panelToggle.setAttribute('aria-label', label);
requestAnimationFrame(resize);
}
panelToggle.addEventListener('click', ()=> setPanelCollapsed(!panelAside.classList.contains('is-collapsed')));
/* ================= СВОРАЧИВАНИЕ ПАНЕЛИ МАССЫ ================= */
const stampAside = $('stamp');
const stampToggle = $('stampToggle');
function setStampCollapsed(collapsed){
stampAside.classList.toggle('is-collapsed', collapsed);
stampToggle.setAttribute('aria-expanded', String(!collapsed));
const label = collapsed ? 'Развернуть панель массы' : 'Свернуть панель массы';
stampToggle.title = label;
stampToggle.setAttribute('aria-label', label);
}
stampToggle.addEventListener('click', ()=> setStampCollapsed(!stampAside.classList.contains('is-collapsed')));
document.querySelectorAll('.cbtn').forEach(b=> b.addEventListener('click', ()=> setView(b.dataset.view)));
$('selHide').addEventListener('click', hideSelected);
$('selFade').addEventListener('click', fadeSelected);
$('selRestoreFade').addEventListener('click', restoreFaded);
$('selClear').addEventListener('click', ()=> clearSelection());
$('selRestore').addEventListener('click', restoreHidden);
document.addEventListener('keydown', e=>{
if(/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
if(e.key === 'Escape'){ clearSelection(); return; }
if((e.key === 'Delete' || e.key === 'Backspace') && selectedEls.size){
e.preventDefault();
hideSelected();
}
});
/* ================= СОБЫТИЯ ================= */
function setCellUI(){
const complex = gv('cell') === 'complex';
$('secBlock').classList.toggle('off', !complex);
$('jointDNwrap').classList.toggle('off', complex);
}
let debT = null;
function requestBuild(){
setCellUI();
drawPreviews(readParams());
clearTimeout(debT);
debT = setTimeout(()=>{ build(); }, 150);
}
document.querySelectorAll('#panel input, #panel select').forEach(el=>{
el.addEventListener('input', requestBuild);
el.addEventListener('change', requestBuild);
});
document.querySelectorAll('input[name="dnGost"]').forEach(r=> r.addEventListener('change', ()=> fillSelect('dnSel', gv('dnGost'))));
document.querySelectorAll('input[name="scGost"]').forEach(r=> r.addEventListener('change', ()=> fillSelect('scSel', gv('scGost'))));
$('resetBtn').addEventListener('click', ()=>{
for(const k in DEF) $(k).value = DEF[k];
document.querySelector('input[name="cell"][value="normal"]').checked = true;
document.querySelector('input[name="jointBeam"][value="side"]').checked = true;
document.querySelector('input[name="jointBase"][value="hinge"]').checked = true;
document.querySelector('input[name="jointDN"][value="side"]').checked = true;
document.querySelector('input[name="dnGost"][value="g8239"]').checked = true;
document.querySelector('input[name="scGost"][value="g8239"]').checked = true;
fillSelect('dnSel','g8239'); fillSelect('scSel','g8239');
$('dnSel').value = '18'; $('scSel').value = '20';
requestBuild();
});
document.querySelectorAll('.chip[data-l]').forEach(ch=>{
ch.addEventListener('click', ()=>{
clearSelection();
ch.classList.toggle('on');
vis[ch.dataset.l] = ch.classList.contains('on');
if(groups[ch.dataset.l]) groups[ch.dataset.l].visible = vis[ch.dataset.l];
});
});
$('autoChip').addEventListener('click', function(){ this.classList.toggle('on'); orbit.auto = this.classList.contains('on'); });
$('fitChip').addEventListener('click', ()=> fitCamera());
$('panelBtn').addEventListener('click', ()=> $('panel').classList.toggle('open'));
canvas.addEventListener('pointerdown', ()=> $('panel').classList.remove('open'));
function resize(){
const st = $('stage'), w = st.clientWidth, h = st.clientHeight;
if(w < 2 || h < 2) return;
renderer.setSize(w, h, false);
camera.aspect = w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe($('stage'));
window.addEventListener('resize', resize);
const clock = new THREE.Clock();
(function loop(){
requestAnimationFrame(loop);
const dt = Math.min(clock.getDelta(), 0.05);
orbit.update(dt);
dust.rotation.y += dt*0.006;
dust.position.y = Math.sin(performance.now()*0.0002)*0.25;
renderer.render(scene, camera);
})();
/* старт: компоновка по умолчанию — чертёжный лист */
fillSelect('dnSel','g8239'); $('dnSel').value='18';
fillSelect('scSel','g8239'); $('scSel').value='20';
setCellUI();
drawPreviews(readParams());
setLayout('board');
build();
fitCamera();
resize();