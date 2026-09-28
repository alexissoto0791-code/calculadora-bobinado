// Pruebas de la calculadora de transformadores.
// Uso: node tests/run.js   (requiere Node.js 18 o superior, sin dependencias)
//
// Carga el JavaScript de index.html dentro de un DOM simulado y compara los
// resultados con valores esperados calculados aparte con las fórmulas del proyecto.

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/<script>\n?([\s\S]*)<\/script>/);
if (!m) { console.error('No se encontró el <script> en index.html'); process.exit(2); }
const code = m[1]
  .replace("var SUPABASE_URL = '';", "var SUPABASE_URL = 'https://demo.supabase.co';")
  .replace("var SUPABASE_KEY = '';", "var SUPABASE_KEY = 'clave-de-prueba';")
  .replace(/\}\)\(\);\s*$/, 'globalThis.__t = { calc: calc, calcN: calcN, validate: validate, awgArea: awgArea, guardarItem: guardarItem, filaSupabase: filaSupabase };\n})();');

// ---- DOM mínimo para que el script arranque ----
function El(id) {
  return { id, value: '', hidden: false, textContent: '', innerHTML: '', className: '', placeholder: '', disabled: false,
    checked: false, dataset: {}, style: {}, children: [], setAttribute() {}, replaceChildren() {}, appendChild() {},
    addEventListener() {}, closest() { return null; }, querySelector() { return El('q'); }, cloneNode() { return El('c'); }, select() {} };
}
const els = {};
global.document = {
  getElementById: id => els[id] || (els[id] = El(id)),
  querySelector: sel => (sel.includes('fases') ? { value: '3' } : sel.includes('modo') ? { value: 'espiras' } : El('q')),
  querySelectorAll: () => [], createElement: () => El('c'), body: { appendChild() {}, removeChild() {} }, addEventListener() {}
};
// Cliente de Supabase falso: registra las llamadas a insert() y puede simular un error.
const llamadas = [];
let simularError = false;
const clienteFalso = { from(tabla) { return { insert(fila) {
  llamadas.push({ tabla, fila });
  return Promise.resolve({ data: null, error: simularError ? { message: 'fallo simulado' } : null });
} }; } };
global.window = { scrollTo() {}, supabase: { createClient: () => clienteFalso } };
const almacen = {};
global.localStorage = { getItem: k => (k in almacen ? almacen[k] : null), setItem: (k, v) => { almacen[k] = v; } };
global.navigator = {};
(0, eval)(code);
const T = globalThis.__t;

const CASES = [
 {
  "name": "3F Δ-Y 75 kVA 13200/220, N=120",
  "input": {
   "kva": 75,
   "vp": 13200,
   "vs": 220,
   "n": 120
  },
  "expected": {
   "rt": 103.92304845413264,
   "n2": 46,
   "n1": 4900,
   "ip": 1.893939393939394,
   "is_": 196.82395540555422,
   "pri": "AWG 19",
   "sec": "2/0 AWG"
  }
 },
 {
  "name": "3F Y-Y 150 kVA 13200/220, N=200",
  "input": {
   "kva": 150,
   "vp": 13200,
   "vs": 220,
   "n": 200,
   "conexion": "YY"
  },
  "expected": {
   "rt": 60.00000000000001,
   "n2": 133,
   "n1": 8180,
   "ip": 6.560798513518474,
   "is_": 393.64791081110843,
   "pri": "AWG 13",
   "sec": "2 × 4/0 AWG"
  }
 },
 {
  "name": "3F Δ-Δ 45 kVA 4160/208, N=100",
  "input": {
   "kva": 45,
   "vp": 4160,
   "vs": 208,
   "n": 100,
   "conexion": "DD"
  },
  "expected": {
   "rt": 20.0,
   "n2": 200,
   "n1": 4100,
   "ip": 3.605769230769231,
   "is_": 72.11538461538461,
   "pri": "AWG 16",
   "sec": "AWG 3"
  }
 },
 {
  "name": "1F 25 kVA 13200/240, N=150",
  "input": {
   "fases": "1",
   "kva": 25,
   "vp": 13200,
   "vs": 240,
   "n": 150
  },
  "expected": {
   "rt": 55.0,
   "n2": 109,
   "n1": 6145,
   "ip": 1.893939393939394,
   "is_": 104.16666666666667,
   "pri": "AWG 19",
   "sec": "AWG 1"
  }
 },
 {
  "name": "3F Y-Δ 30 kVA 13200/220, N=90, J=2.5",
  "input": {
   "kva": 30,
   "vp": 13200,
   "vs": 220,
   "n": 90,
   "conexion": "YD",
   "j": 2.5
  },
  "expected": {
   "rt": 34.64101615137755,
   "n2": 104,
   "n1": 3693,
   "ip": 1.3121597027036949,
   "is_": 45.45454545454545,
   "pri": "AWG 19",
   "sec": "AWG 4"
  }
 },
 {
  "name": "Tap explícito de 150 espiras",
  "input": {
   "kva": 75,
   "vp": 13200,
   "vs": 220,
   "n": 120,
   "tap": 150
  },
  "expected": {
   "rt": 103.92304845413264,
   "n2": 46,
   "n1": 4930,
   "ip": 1.893939393939394,
   "is_": 196.82395540555422,
   "pri": "AWG 19",
   "sec": "2/0 AWG"
  }
 },
 {
  "name": "Núcleo: sección 115 cm², B 1.6 T",
  "input": {
   "kva": 75,
   "vp": 13200,
   "vs": 220,
   "modo": "nucleo",
   "sec": 115
  },
  "expected": {
   "rt": 103.92304845413264,
   "n2": 26,
   "n1": 2770,
   "ip": 1.893939393939394,
   "is_": 196.82395540555422,
   "pri": "AWG 19",
   "sec": "2/0 AWG"
  }
 },
 {
  "name": "Núcleo: voltios por espira 4.9 dados",
  "input": {
   "kva": 75,
   "vp": 13200,
   "vs": 220,
   "modo": "nucleo",
   "vt": 4.9
  },
  "expected": {
   "rt": 103.92304845413264,
   "n2": 26,
   "n1": 2770,
   "ip": 1.893939393939394,
   "is_": 196.82395540555422,
   "pri": "AWG 19",
   "sec": "2/0 AWG"
  }
 },
 {
  "name": "1000 kVA (requiere conductores en paralelo)",
  "input": {
   "kva": 1000,
   "vp": 13200,
   "vs": 220,
   "n": 1000
  },
  "expected": {
   "rt": 103.92304845413264,
   "n2": 385,
   "n1": 41010,
   "ip": 25.252525252525253,
   "is_": 2624.3194054073897,
   "pri": "AWG 7",
   "sec": "9 × 4/0 AWG"
  }
 },
 {
  "name": "3F Δ-Y 500 kVA 13200/440, paso 5 %",
  "input": {
   "kva": 500,
   "vp": 13200,
   "vs": 440,
   "n": 400,
   "pct": 5
  },
  "expected": {
   "rt": 51.96152422706632,
   "n2": 154,
   "n1": 8402,
   "ip": 12.626262626262626,
   "is_": 656.0798513518474,
   "pri": "AWG 10",
   "sec": "3 × 4/0 AWG"
  }
 }
];
const NCASES = [
 {
  "name": "Prueba: núcleo 4×5 cm, ventana 3×8, 150 esp, 0.35 A, auxiliar 10 esp / 7.5 V",
  "input": {
   "ca": 4,
   "cb": 5,
   "cww": 3,
   "chw": 8,
   "tnp": 150,
   "ti": 0.35,
   "tns": 10,
   "tvi": 7.5,
   "dvp": 110,
   "dvs": 24
  },
  "expected": {
   "ac": 19.0,
   "nrec": 144.88172382909224,
   "vttest": 0.75,
   "btest": 1.4817449027975342,
   "mmf": 52.5,
   "vtd": 0.75924,
   "np": 145,
   "ns": 32,
   "smax": 683.3159999999999,
   "ip": 6.2119636363636355,
   "is_": 28.471499999999995,
   "pri": "AWG 13",
   "sec": "AWG 6",
   "kureal": 0.33588879963790497,
   "i0": 0.3620689655172414,
   "i0pct": 5.828575096572678
  }
 },
 {
  "name": "Prueba: sin ventana ni auxiliar, 100 VA",
  "input": {
   "ca": 4,
   "cb": 5,
   "tnp": 150,
   "ti": 0.35,
   "dvp": 110,
   "dvs": 24,
   "dva": 100
  },
  "expected": {
   "ac": 19.0,
   "nrec": 144.88172382909224,
   "vttest": 0.7333333333333333,
   "btest": 1.4488172382909223,
   "mmf": 52.5,
   "vtd": 0.75924,
   "np": 145,
   "ns": 32,
   "smax": 302.45746691871466,
   "ip": 0.9090909090909091,
   "is_": 4.166666666666667,
   "pri": "AWG 21",
   "sec": "AWG 14",
   "i0": 0.3620689655172414,
   "i0pct": 39.827586206896555
  }
 },
 {
  "name": "Prueba: núcleo grande 6×8 cm, ventana 4×10, 120/12 V",
  "input": {
   "ca": 6,
   "cb": 8,
   "cww": 4,
   "chw": 10,
   "tnp": 100,
   "ti": 0.5,
   "dvp": 120,
   "dvs": 12,
   "dku": 0.35,
   "dj": 2.8
  },
  "expected": {
   "ac": 45.599999999999994,
   "nrec": 60.36738492878844,
   "vttest": 1.1,
   "btest": 0.9055107739318266,
   "mmf": 50.0,
   "vtd": 1.822176,
   "np": 66,
   "ns": 7,
   "smax": 3571.4649600000002,
   "ip": 29.762208,
   "is_": 297.62208000000004,
   "pri": "AWG 6",
   "sec": "4/0 AWG",
   "kureal": 0.4071129497107942,
   "i0": 0.7575757575757576,
   "i0pct": 2.545428610591518
  }
 }
];
const AWG_STD = {"-3": 107.2, "0": 53.49, "1": 42.41, "4": 21.15, "10": 5.261, "14": 2.081, "18": 0.823, "24": 0.2047, "30": 0.05067};

let pass = 0, fail = 0;
function check(name, campo, got, want, tol) {
  const ok = typeof want === 'string' ? got === want : Math.abs(got - want) <= (tol || 1e-6) * Math.max(1, Math.abs(want));
  if (ok) pass++; else { fail++; console.log(`  FALLA  ${name} -> ${campo}: obtuvo ${got}, esperaba ${want}`); }
}
const wl = w => (w.parallel > 1 ? w.parallel + ' × ' : '') + w.label;

console.log('Calcular');
CASES.forEach(c => {
  const x = Object.assign({ fases: '3', conexion: 'DY', modo: 'espiras', n: NaN, tapRaw: '', tap: NaN, sec: NaN, vt: NaN,
    b: 1.6, f: 60, pct: 2.5, j: 3, kva: NaN, vp: NaN, vs: NaN }, c.input);
  if ('tap' in c.input) x.tapRaw = String(c.input.tap);
  const r = T.calc(x), e = c.expected;
  check(c.name, 'RT', r.rt, e.rt); check(c.name, 'N2', r.n2, e.n2); check(c.name, 'N1', r.n1, e.n1);
  check(c.name, 'I primario', r.pri.i, e.ip); check(c.name, 'I secundario', r.sec.i, e.is_);
  check(c.name, 'calibre primario', wl(r.pri), e.pri); check(c.name, 'calibre secundario', wl(r.sec), e.sec);
  console.log('  ok  ' + c.name);
});

console.log('Prueba (núcleo desconocido)');
NCASES.forEach(c => {
  const x = Object.assign({ ca: NaN, cb: NaN, cfs: 0.95, cww: NaN, chw: NaN, tnp: NaN, tv: 110, ti: NaN, tf: 60, tns: NaN, tvi: NaN,
    dvp: NaN, dvs: NaN, dva: NaN, db: 1.5, dj: 2.5, dku: 0.3 }, c.input);
  const r = T.calcN(x), e = c.expected;
  check(c.name, 'sección neta', r.ac, e.ac); check(c.name, 'espiras de prueba', r.nRec, e.nrec);
  if (e.vttest !== undefined) { check(c.name, 'V/esp prueba', r.vtTest, e.vttest); check(c.name, 'B prueba', r.bTest, e.btest); }
  check(c.name, 'V/esp diseño', r.vtD, e.vtd); check(c.name, 'espiras primario', r.np, e.np); check(c.name, 'espiras secundario', r.ns, e.ns);
  check(c.name, 'potencia máxima', r.sMax, e.smax); check(c.name, 'I primario', r.ip, e.ip); check(c.name, 'I secundario', r.is, e.is_);
  check(c.name, 'calibre primario', wl(r.wp), e.pri); check(c.name, 'calibre secundario', wl(r.ws), e.sec);
  if (e.kureal !== undefined) check(c.name, 'uso de ventana', r.kuReal, e.kureal);
  if (e.i0 !== undefined) { check(c.name, 'corriente en vacío', r.i0, e.i0); check(c.name, '% en vacío', r.i0pct, e.i0pct); }
  console.log('  ok  ' + c.name);
});

console.log('Tabla AWG estándar (tolerancia 1 %)');
Object.keys(AWG_STD).forEach(n => check('AWG ' + n, 'sección mm²', T.awgArea(+n), AWG_STD[n], 0.01));

console.log('Validaciones');
const base = { fases: '3', conexion: 'DY', modo: 'espiras', n: 120, tapRaw: '', tap: NaN, sec: NaN, vt: NaN, b: 1.6, f: 60, pct: 2.5, j: 3, kva: 75, vp: 13200, vs: 220 };
check('sin potencia', 'vacío', T.validate(Object.assign({}, base, { kva: NaN })).empty ? 'si' : 'no', 'si');
check('paso 0', 'error', T.validate(Object.assign({}, base, { pct: 0 })).err ? 'si' : 'no', 'si');
check('datos completos', 'válido', (T.validate(base).empty || T.validate(base).err) ? 'no' : 'si', 'si');

(async () => {
  console.log('Supabase (cliente simulado)');
  const x1 = Object.assign({}, base);
  const item1 = { tipo: 'espiras', name: 'Prueba 75 kVA', date: Date.now(), x: x1, r: T.calc(x1) };
  const nombreEl = { value: 'algo' };
  let err = await T.guardarItem(item1, nombreEl);
  check('guardar ok', 'sin error', err === null ? 'si' : 'no', 'si');
  check('guardar ok', 'tabla', llamadas[0].tabla, 'disenos');
  check('guardar ok', 'tipo', llamadas[0].fila.tipo, 'espiras');
  check('guardar ok', 'nombre', llamadas[0].fila.nombre, 'Prueba 75 kVA');
  check('guardar ok', 'resultados.n2', llamadas[0].fila.resultados.n2, 46);
  check('guardar ok', 'datos.kva', llamadas[0].fila.datos.kva, 75);
  check('guardar ok', 'campo de nombre limpio', nombreEl.value, '');
  check('guardar ok', 'mensaje', els.toast.textContent, 'Diseño guardado en Supabase');
  check('guardar ok', 'copia local', JSON.parse(almacen['trafo-disenos-v1']).length, 1);
  console.log('  ok  guardado correcto');

  simularError = true;
  const item2 = { tipo: 'nucleo', name: 'Núcleo 2', date: Date.now(), x: x1, r: T.calc(x1) };
  err = await T.guardarItem(item2, { value: '' });
  check('error de red', 'devuelve error', err && err.message, 'fallo simulado');
  check('error de red', 'la copia local se conserva', JSON.parse(almacen['trafo-disenos-v1']).length, 2);
  check('error de red', 'mensaje', els.toast.textContent.startsWith('Guardado en este navegador. No se pudo enviar a Supabase') ? 'si' : 'no', 'si');
  check('fila', 'tipo por defecto', T.filaSupabase({ name: 'x', x: {}, r: {} }).tipo, 'espiras');
  console.log('  ok  error de Supabase no pierde el diseño');

  console.log(`\n${pass} comprobaciones correctas, ${fail} fallas`);
  process.exit(fail ? 1 : 0);
})();
