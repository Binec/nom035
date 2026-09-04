import React, { useState, useMemo } from "react";

/* ============================================================
   TOKENS
   Paleta: papel clínico + tinta índigo + acento ámbar
   Tipografía: Newsreader (display, tono "documento oficial") + Inter (UI) + IBM Plex Mono (datos)
   Firma: el "medidor de riesgo" (semáforo NOM-035) reutilizado en toda la app
============================================================ */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const STYLES = `
:root{
  --ink:#161B33;
  --ink-soft:#4A5072;
  --paper:#F7F6F2;
  --surface:#FFFFFF;
  --line:#E4E2DA;
  --accent:#B5722A;
  --accent-soft:#F1E3D2;
  --teal:#1F5C56;
  --teal-soft:#DCEAE8;
  --r-nulo:#3F8F55;
  --r-bajo:#8AAE3E;
  --r-medio:#D9A231;
  --r-alto:#D9722E;
  --r-muyalto:#C1402F;
}
.n035{ font-family:'Inter',sans-serif; color:var(--ink); background:var(--paper); min-height:100vh; }
.n035 .disp{ font-family:'Newsreader',serif; }
.n035 .mono{ font-family:'IBM Plex Mono',monospace; letter-spacing:.02em; }
.n035 .card{ background:var(--surface); border:1px solid var(--line); border-radius:4px; }
.n035 .btn-primary{ background:var(--ink); color:#fff; border-radius:3px; transition:background .15s ease; }
.n035 .btn-primary:hover{ background:var(--teal); }
.n035 .btn-secondary{ background:transparent; color:var(--ink); border:1px solid var(--line); border-radius:3px; }
.n035 .btn-secondary:hover{ border-color:var(--ink); }
.n035 .accent-bar{ background:var(--accent); }
.n035 .field{ border:1px solid var(--line); border-radius:3px; background:#fff; }
.n035 .field:focus{ outline:2px solid var(--teal); outline-offset:1px; }
.n035 .likert-opt{ border:1px solid var(--line); border-radius:3px; cursor:pointer; transition:all .12s ease; }
.n035 .likert-opt:hover{ border-color:var(--ink-soft); }
.n035 .likert-opt.sel{ background:var(--ink); color:#fff; border-color:var(--ink); }
.n035 .gauge-track{ background:#EDEBE3; border-radius:99px; overflow:hidden; }
.n035 .badge{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.06em; padding:2px 8px; border-radius:99px; }
.n035 .row-hover:hover{ background:#F1EFE8; }
.n035 ::selection{ background:var(--accent-soft); }
`;

/* ---------------- Data: cuestionarios ---------------- */

const ATS_ITEMS = [
  { id: "a1", text: "¿Ha sufrido o presenciado un accidente grave que puso en riesgo su vida o integridad física durante o con motivo de su trabajo?" },
  { id: "a2", text: "¿Ha sido víctima de un asalto, secuestro o amenaza grave con arma durante su jornada laboral?" },
  { id: "a3", text: "¿Ha presenciado la muerte de alguna persona en su centro de trabajo?" },
  { id: "a4", text: "¿Ha sufrido un accidente de trabajo que le haya provocado una lesión grave o la pérdida de un miembro?" },
  { id: "a5", text: "¿Recuerda con frecuencia, en contra de su voluntad, alguno de estos acontecimientos?" },
  { id: "a6", text: "¿Ha tenido pesadillas relacionadas con ese acontecimiento?" },
  { id: "a7", text: "¿Evita hablar o pensar en lo ocurrido?" },
  { id: "a8", text: "¿Evita lugares o situaciones que le recuerden el acontecimiento?" },
  { id: "a9", text: "¿Se ha sentido nervioso(a), en alerta o se sobresalta con facilidad desde entonces?" },
  { id: "a10", text: "¿Ha tenido dificultad para dormir o concentrarse a raíz de lo vivido?" },
];

const CATEGORIES = [
  {
    id: "ambiente",
    label: "Ambiente de trabajo",
    items: [
      { t: "En mi trabajo estoy expuesto(a) a un ambiente físico peligroso (ruido, calor, sustancias, etc.)", positive: false },
      { t: "Mi lugar de trabajo cuenta con condiciones de higiene y seguridad adecuadas.", positive: true },
      { t: "He tenido que trabajar en instalaciones inseguras o en mal estado.", positive: false },
      { t: "Los equipos y herramientas que utilizo están en buen estado.", positive: true },
      { t: "Estoy expuesto(a) a riesgos que pueden dañar mi salud física.", positive: false },
      { t: "Cuento con el equipo de protección necesario para realizar mi trabajo.", positive: true },
    ],
  },
  {
    id: "actividad",
    label: "Factores propios de la actividad",
    items: [
      { t: "Mi trabajo me exige un nivel de concentración muy alto durante toda la jornada.", positive: false },
      { t: "Tengo cargas de trabajo excesivas.", positive: false },
      { t: "Puedo decidir cuánto trabajo realizo durante mi jornada.", positive: true },
      { t: "Mis responsabilidades en el trabajo son claras.", positive: true },
      { t: "Se me exige trabajar muy rápido.", positive: false },
      { t: "Tengo la posibilidad de tomar pausas cuando lo necesito.", positive: true },
    ],
  },
  {
    id: "tiempo",
    label: "Organización del tiempo de trabajo",
    items: [
      { t: "Mi jornada de trabajo se extiende más allá del horario establecido.", positive: false },
      { t: "Puedo tomar mis alimentos en un horario adecuado.", positive: true },
      { t: "Mis descansos y vacaciones se respetan.", positive: true },
      { t: "El trabajo interfiere con mi tiempo en familia.", positive: false },
      { t: "Trabajo en fines de semana o días de descanso con frecuencia.", positive: false },
      { t: "Mi horario de trabajo me permite conciliar mi vida personal.", positive: true },
    ],
  },
  {
    id: "liderazgo",
    label: "Liderazgo y relaciones en el trabajo",
    items: [
      { t: "Mi jefe(a) me trata con respeto.", positive: true },
      { t: "He sido víctima de malos tratos, humillaciones o burlas en mi trabajo.", positive: false },
      { t: "Recibo apoyo de mis compañeros(as) cuando lo necesito.", positive: true },
      { t: "Existe favoritismo o trato desigual entre compañeros(as).", positive: false },
      { t: "Mi jefe(a) toma en cuenta mi opinión.", positive: true },
      { t: "He presenciado o sufrido actos de violencia laboral (acoso, hostigamiento).", positive: false },
    ],
  },
];

const CATEGORY_ENTORNO = {
  id: "entorno",
  label: "Entorno organizacional",
  items: [
    { t: "Recibo información clara sobre cómo se evalúa mi desempeño.", positive: true },
    { t: "Siento que mi trabajo es reconocido.", positive: true },
    { t: "Me siento parte importante de esta organización.", positive: true },
    { t: "Mi puesto de trabajo es estable.", positive: true },
    { t: "Recibo la capacitación necesaria para realizar bien mi trabajo.", positive: true },
    { t: "Siento incertidumbre sobre la permanencia de mi empleo.", positive: false },
  ],
};

function getCategoriesForGuide(guide) {
  return guide === "III" ? [...CATEGORIES, CATEGORY_ENTORNO] : CATEGORIES;
}

const LIKERT = [
  { v: 0, label: "Nunca" },
  { v: 1, label: "Casi nunca" },
  { v: 2, label: "Algunas veces" },
  { v: 3, label: "Casi siempre" },
  { v: 4, label: "Siempre" },
];

function riskLevel(pct) {
  if (pct <= 20) return { label: "Nulo", color: "var(--r-nulo)" };
  if (pct <= 40) return { label: "Bajo", color: "var(--r-bajo)" };
  if (pct <= 60) return { label: "Medio", color: "var(--r-medio)" };
  if (pct <= 80) return { label: "Alto", color: "var(--r-alto)" };
  return { label: "Muy alto", color: "var(--r-muyalto)" };
}

const RECOMMENDATIONS = {
  Nulo: "No se identifican acciones adicionales; se recomienda mantener las medidas de prevención vigentes.",
  Bajo: "Se sugiere reforzar la difusión de la política de prevención de riesgos psicosociales.",
  Medio: "Se recomienda revisar la política de prevención, realizar campañas de sensibilización y evaluaciones específicas por categoría.",
  Alto: "Se requiere un análisis a profundidad por categoría y dominio, y diseñar un programa de intervención.",
  "Muy alto": "Se requiere ejecutar de inmediato un programa de intervención con evaluaciones específicas y seguimiento cercano.",
};

/* ---------------- Gauge (elemento de firma) ---------------- */
function RiskGauge({ pct, size = "md", showLabel = true }) {
  const { label, color } = riskLevel(pct);
  const h = size === "sm" ? 6 : size === "lg" ? 14 : 9;
  return (
    <div className="w-full">
      <div className="gauge-track w-full" style={{ height: h }}>
        <div style={{ width: `${Math.min(100, Math.max(2, pct))}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s ease" }} />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{pct.toFixed(0)}%</span>
          <span className="badge" style={{ background: color, color: "#fff" }}>{label}</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Header con navegación por módulos ---------------- */
function HeaderNav({ items, activeId, onSelect, userName, roleLabel, onLogout }) {
  return (
    <div className="px-6 md:px-10 py-3.5" style={{ background: "var(--ink)", color: "#fff" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 8, height: 8, borderRadius: 99 }} className="accent-bar" />
          <div>
            <div className="disp" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.1 }}>NOM-035</div>
            <div className="mono" style={{ fontSize: 9.5, color: "#8E93BC" }}>{roleLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:inline" style={{ color: "#C7CBE6" }}>{userName}</span>
          <button onClick={onLogout} className="text-xs px-3 py-1.5"
            style={{ border: "1px solid #3A4070", borderRadius: 3, color: "#fff", background: "transparent" }}>
            Salir
          </button>
        </div>
      </div>
      <nav className="flex gap-1 mt-3 -mx-1 overflow-x-auto">
        {items.map((it) => (
          <button key={it.id} onClick={() => onSelect(it.id)}
            className="px-3.5 py-2 text-sm whitespace-nowrap flex items-center gap-2 shrink-0"
            style={{
              borderRadius: 4,
              background: activeId === it.id ? "rgba(255,255,255,.1)" : "transparent",
              borderBottom: activeId === it.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeId === it.id ? "#fff" : "#B9BEDD",
            }}>
            <span>{it.label}</span>
            {it.badge > 0 && (
              <span className="badge" style={{ background: "var(--r-medio)", color: "#fff" }}>{it.badge}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ---------------- Login ---------------- */
function LoginScreen({ onLogin, users }) {
  const [role, setRole] = useState("colaborador");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const pool = role === "admin" ? [users.admin] : users.employees;
    const found = pool.find((u) => u.username === username.trim() && u.password === password);
    if (!found) { setError("Usuario o contraseña incorrectos."); return; }
    setError("");
    onLogin(role, found);
  }

  return (
    <div className="n035 min-h-screen flex items-center justify-center px-4" style={{
      backgroundImage: "radial-gradient(circle at 15% 10%, #FFFFFF 0%, var(--paper) 55%)"
    }}>
      <div className="w-full max-w-4xl grid md:grid-cols-5 card overflow-hidden">
        <div className="md:col-span-2 p-8 flex flex-col justify-between" style={{ background: "var(--ink)", color: "#fff" }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: "#B9BEDD" }}>NOM-035-STPS-2018</div>
            <h1 className="disp mt-3" style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 600 }}>
              Factores de riesgo psicosocial
            </h1>
            <p className="mt-4" style={{ fontSize: 14, color: "#C7CBE6", lineHeight: 1.6 }}>
              Identificación, análisis y prevención del riesgo psicosocial en el centro de trabajo. Prototipo funcional para aplicar cuestionarios y visualizar resultados.
            </p>
          </div>
          <div className="mt-10 pt-6" style={{ borderTop: "1px solid #333A63" }}>
            <div className="mono" style={{ fontSize: 10, color: "#8E93BC", lineHeight: 1.8 }}>
              GUÍA I · Acontecimientos traumáticos severos<br />
              GUÍA II · Centros de trabajo 16–50<br />
              GUÍA III · Centros de trabajo 50+
            </div>
          </div>
        </div>

        <div className="md:col-span-3 p-8">
          <div className="flex gap-1 mb-6" style={{ background: "#EDEBE3", borderRadius: 4, padding: 3 }}>
            {["colaborador", "admin"].map((r) => (
              <button key={r} onClick={() => { setRole(r); setError(""); }}
                className="flex-1 py-2 text-sm font-medium"
                style={{ borderRadius: 3, background: role === r ? "#fff" : "transparent", boxShadow: role === r ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>
                {r === "admin" ? "Recursos Humanos" : "Colaborador"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Usuario</label>
              <input className="field w-full mt-1 px-3 py-2 text-sm" value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="usuario" />
            </div>
            <div>
              <label className="text-sm font-medium">Contraseña</label>
              <input type="password" className="field w-full mt-1 px-3 py-2 text-sm" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="••••••••" />
            </div>
            {error && <div style={{ color: "var(--r-muyalto)", fontSize: 13 }}>{error}</div>}
            <button className="btn-primary w-full py-2.5 text-sm font-medium mt-2" onClick={submit}>Iniciar sesión</button>
          </div>

          <div className="mt-6 p-3 mono" style={{ fontSize: 11, background: "var(--teal-soft)", borderRadius: 4, color: "var(--teal)", lineHeight: 1.7 }}>
            Demo — RH: admin / admin2026<br />
            Demo — Colaborador: ana.lopez / demo123
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Header compartido ---------------- */
function TopBar({ nombre, subtitle, onLogout, onBack }) {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4" style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="btn-secondary text-xs px-2.5 py-1.5 mr-1">← Panel</button>
        )}
        <div style={{ width: 8, height: 8, borderRadius: 99 }} className="accent-bar" />
        <div>
          <div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>NOM-035 · Plataforma</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: "var(--ink-soft)" }}>{nombre}</span>
        <button onClick={onLogout} className="btn-secondary text-xs px-3 py-1.5">Salir</button>
      </div>
    </div>
  );
}

/* ---------------- Buzón de quejas ---------------- */
const COMPLAINT_CATEGORIES = ["Ambiente de trabajo", "Liderazgo y relaciones", "Violencia laboral", "Organización del tiempo", "Otro"];

const COMPLAINT_STATUS_COLOR = {
  "Recibida": "var(--teal)",
  "En revisión": "var(--r-medio)",
  "Resuelta": "var(--r-nulo)",
};

function ComplaintForm({ onSubmit, onCancel }) {
  const [categoria, setCategoria] = useState(COMPLAINT_CATEGORIES[0]);
  const [texto, setTexto] = useState("");
  const [anonima, setAnonima] = useState(false);

  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">Nueva queja o reporte</div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium" style={{ color: "var(--ink-soft)" }}>Categoría</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {COMPLAINT_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategoria(c)}
                className={`likert-opt px-3 py-1.5 text-xs ${categoria === c ? "sel" : ""}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: "var(--ink-soft)" }}>Describa la situación</label>
          <textarea className="field w-full mt-1.5 px-3 py-2 text-sm" rows={4}
            placeholder="Describa qué ocurrió, cuándo y quiénes estuvieron involucrados…"
            value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} />
          Enviar de forma anónima
        </label>
        <div className="flex gap-2 pt-1">
          <button className="btn-secondary px-4 py-2 text-sm font-medium" onClick={onCancel}>Cancelar</button>
          <button disabled={!texto.trim()} className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-40"
            onClick={() => onSubmit({ categoria, texto: texto.trim(), anonima })}>
            Enviar queja
          </button>
        </div>
      </div>
    </div>
  );
}

function ComplaintsInbox({ user, complaints, onAddComplaint }) {
  const [showForm, setShowForm] = useState(false);
  const mine = complaints.filter((c) => c.employeeId === user.id).sort((a, b) => b.fecha - a.fecha);

  function submit(data) {
    onAddComplaint(data);
    setShowForm(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="disp" style={{ fontSize: 24, fontWeight: 600 }}>Buzón de quejas</h2>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Reporte situaciones de violencia laboral, malos tratos o cualquier factor de riesgo psicosocial.</p>
        </div>
        {!showForm && <button className="btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap" onClick={() => setShowForm(true)}>Nueva queja</button>}
      </div>

      {showForm && <div className="mb-6"><ComplaintForm onSubmit={submit} onCancel={() => setShowForm(false)} /></div>}

      {mine.length === 0 && !showForm && (
        <div className="card p-8 text-center" style={{ color: "var(--ink-soft)" }}>
          <p className="text-sm">Aún no ha enviado ninguna queja.</p>
        </div>
      )}

      <div className="space-y-3">
        {mine.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{c.categoria}</span>
              <span className="badge" style={{ background: COMPLAINT_STATUS_COLOR[c.estatus], color: "#fff" }}>{c.estatus}</span>
            </div>
            <p className="text-sm leading-relaxed">{c.texto}</p>
            <div className="mono mt-2" style={{ fontSize: 10, color: "var(--ink-soft)" }}>
              {new Date(c.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
              {c.anonima && " · enviada de forma anónima"}
            </div>
            {c.respuesta && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--teal)" }}>RESPUESTA DE RH</div>
                <p className="text-sm mt-1">{c.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeHub({ user, activeId, onSelect, hasResults, results, guide, complaints, onAddComplaint, onFinishEvaluacion, onLogout }) {
  const pendingComplaints = complaints.filter((c) => c.employeeId === user.id && c.estatus !== "Resuelta").length;

  const items = [
    { id: "home", label: "Inicio" },
    { id: "evaluacion", label: "Evaluación NOM-035" },
    { id: "buzon", label: "Buzón de quejas", badge: pendingComplaints },
  ];

  return (
    <div className="n035 min-h-screen">
      <HeaderNav items={items} activeId={activeId} onSelect={onSelect} userName={user.nombre} roleLabel="Colaborador" onLogout={onLogout} />
      <main>
        {activeId === "buzon" ? (
          <ComplaintsInbox user={user} complaints={complaints} onAddComplaint={onAddComplaint} />
        ) : activeId === "evaluacion" ? (
          hasResults ? (
            <EmployeeResults user={user} results={results} onBack={() => onSelect("home")} />
          ) : (
            <EmployeeFlow user={user} guide={guide} onFinish={onFinishEvaluacion} onBack={() => onSelect("home")} />
          )
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-10">
            <h2 className="disp" style={{ fontSize: 24, fontWeight: 600 }}>Hola, {user.nombre.split(" ")[0]}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Elija un módulo del menú superior para continuar.</p>

            <div className="grid sm:grid-cols-2 gap-4 mt-7">
              <button onClick={() => onSelect("evaluacion")} className="card p-5 text-left row-hover">
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>EVALUACIÓN</div>
                <div className="disp mt-1" style={{ fontSize: 18, fontWeight: 600 }}>NOM-035</div>
                <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>
                  {hasResults ? "Ya completó su evaluación. Vea su resultado." : "Aún no ha respondido su cuestionario."}
                </p>
                <div className="badge mt-3 inline-block" style={{ background: hasResults ? "var(--teal-soft)" : "var(--accent-soft)", color: hasResults ? "var(--teal)" : "var(--accent)" }}>
                  {hasResults ? "Completado" : "Pendiente"}
                </div>
              </button>

              <button onClick={() => onSelect("buzon")} className="card p-5 text-left row-hover">
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>BUZÓN</div>
                <div className="disp mt-1" style={{ fontSize: 18, fontWeight: 600 }}>Quejas y reportes</div>
                <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>Reporte violencia laboral, malos tratos u otras situaciones de riesgo.</p>
                {pendingComplaints > 0 && (
                  <div className="badge mt-3 inline-block" style={{ background: "var(--r-medio)", color: "#fff" }}>{pendingComplaints} en seguimiento</div>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Flujo Colaborador ---------------- */
function EmployeeFlow({ user, guide, onFinish, onBack }) {
  const [step, setStep] = useState("consent"); // consent -> ats -> questionnaire -> done
  const [atsAnswers, setAtsAnswers] = useState({});
  const [needsReferral, setNeedsReferral] = useState(false);
  const [answers, setAnswers] = useState({});
  const [catIndex, setCatIndex] = useState(0);

  const categories = getCategoriesForGuide(guide);
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const answeredCount = Object.keys(answers).length;

  function submitATS() {
    const positive = ATS_ITEMS.some((it) => atsAnswers[it.id] === true);
    setNeedsReferral(positive);
    setStep("ats-result");
  }

  function selectAnswer(catId, idx, value) {
    setAnswers((a) => ({ ...a, [`${catId}-${idx}`]: value }));
  }

  function computeResults() {
    const perCategory = categories.map((cat) => {
      let sum = 0;
      cat.items.forEach((it, idx) => {
        const v = answers[`${cat.id}-${idx}`] ?? 0;
        sum += it.positive ? 4 - v : v;
      });
      const max = cat.items.length * 4;
      return { id: cat.id, label: cat.label, pct: (sum / max) * 100 };
    });
    const totalPct = perCategory.reduce((s, c) => s + c.pct, 0) / perCategory.length;
    return { perCategory, totalPct, needsReferral, guide };
  }

  if (step === "consent") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-14">
        <button onClick={onBack} className="mono mb-6" style={{ fontSize: 11, color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer" }}>← Volver al panel</button>
        <h2 className="disp" style={{ fontSize: 26, fontWeight: 600 }}>Antes de comenzar</h2>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Este cuestionario tiene fines exclusivamente de mejora del ambiente de trabajo. Sus respuestas son confidenciales y no existen respuestas correctas o incorrectas — responda con la mayor sinceridad posible, pensando en su situación durante los últimos meses.
        </p>
        <div className="card p-4 mt-6" style={{ background: "var(--accent-soft)", border: "none" }}>
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            Guía aplicable a su centro de trabajo: <strong>Guía {guide}</strong> ({guide === "III" ? "50 o más trabajadores" : "16 a 50 trabajadores"}).
          </p>
        </div>
        <button className="btn-primary px-5 py-2.5 text-sm font-medium mt-8" onClick={() => setStep("ats")}>Comenzar cuestionario</button>
      </div>
    );
  }

  if (step === "ats") {
    const allAnswered = ATS_ITEMS.every((it) => atsAnswers[it.id] !== undefined);
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Sección I — Acontecimientos traumáticos severos</h2>
        <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>Responda si ha vivido o presenciado, durante o con motivo de su trabajo, alguna de las siguientes situaciones.</p>
        <div className="space-y-3 mt-6">
          {ATS_ITEMS.map((it) => (
            <div key={it.id} className="card p-4">
              <p className="text-sm mb-3">{it.text}</p>
              <div className="flex gap-2">
                {[{ v: true, l: "Sí" }, { v: false, l: "No" }].map((opt) => (
                  <button key={String(opt.v)}
                    className={`likert-opt px-4 py-1.5 text-sm ${atsAnswers[it.id] === opt.v ? "sel" : ""}`}
                    onClick={() => setAtsAnswers((a) => ({ ...a, [it.id]: opt.v }))}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button disabled={!allAnswered} onClick={submitATS}
          className="btn-primary px-5 py-2.5 text-sm font-medium mt-8 disabled:opacity-40">
          Continuar
        </button>
      </div>
    );
  }

  if (step === "ats-result") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-14">
        {needsReferral ? (
          <div className="card p-6" style={{ borderLeft: "4px solid var(--r-muyalto)" }}>
            <h3 className="disp" style={{ fontSize: 19, fontWeight: 600, color: "var(--r-muyalto)" }}>Canalización recomendada</h3>
            <p className="text-sm mt-3 leading-relaxed">
              Sus respuestas indican posible exposición a un acontecimiento traumático severo. Se le canalizará de forma inmediata con la instancia médica o psicológica correspondiente para valoración clínica. Esto no afecta la continuidad de su evaluación.
            </p>
          </div>
        ) : (
          <div className="card p-6" style={{ borderLeft: "4px solid var(--r-nulo)" }}>
            <h3 className="disp" style={{ fontSize: 19, fontWeight: 600 }}>Sin indicios de acontecimientos traumáticos severos</h3>
            <p className="text-sm mt-3" style={{ color: "var(--ink-soft)" }}>Continuemos con el cuestionario de factores de riesgo psicosocial.</p>
          </div>
        )}
        <button className="btn-primary px-5 py-2.5 text-sm font-medium mt-8" onClick={() => setStep("questionnaire")}>
          Continuar a Guía {guide}
        </button>
      </div>
    );
  }

  if (step === "questionnaire") {
    const cat = categories[catIndex];
    const catAnswered = cat.items.every((_, idx) => answers[`${cat.id}-${idx}`] !== undefined);
    const isLast = catIndex === categories.length - 1;
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
        <div className="flex items-center justify-between mb-2">
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>CATEGORÍA {catIndex + 1} / {categories.length}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{answeredCount}/{totalItems} respondidas</span>
        </div>
        <div className="gauge-track w-full mb-6" style={{ height: 4 }}>
          <div style={{ width: `${(answeredCount / totalItems) * 100}%`, height: "100%", background: "var(--accent)" }} />
        </div>
        <h2 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>{cat.label}</h2>

        <div className="space-y-4 mt-6">
          {cat.items.map((it, idx) => (
            <div key={idx} className="card p-4">
              <p className="text-sm mb-3">{it.t}</p>
              <div className="grid grid-cols-5 gap-1.5">
                {LIKERT.map((opt) => (
                  <button key={opt.v}
                    className={`likert-opt py-2 text-[11px] leading-tight ${answers[`${cat.id}-${idx}`] === opt.v ? "sel" : ""}`}
                    onClick={() => selectAnswer(cat.id, idx, opt.v)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          {catIndex > 0 && (
            <button className="btn-secondary px-5 py-2.5 text-sm font-medium" onClick={() => setCatIndex((i) => i - 1)}>Anterior</button>
          )}
          <button disabled={!catAnswered} className="btn-primary px-5 py-2.5 text-sm font-medium disabled:opacity-40"
            onClick={() => {
              if (isLast) { onFinish(computeResults()); }
              else setCatIndex((i) => i + 1);
            }}>
            {isLast ? "Finalizar y ver resultado" : "Siguiente categoría"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function EmployeeResults({ user, results, onBack }) {
  const overall = riskLevel(results.totalPct);
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="mono mb-6" style={{ fontSize: 11, color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer" }}>← Volver al panel</button>
      {results.needsReferral && (
          <div className="card p-4 mb-6" style={{ borderLeft: "4px solid var(--r-muyalto)" }}>
            <p className="text-sm">Recuerde: fue canalizado(a) a valoración médica/psicológica por la Sección de Acontecimientos Traumáticos Severos.</p>
          </div>
        )}
        <h2 className="disp" style={{ fontSize: 24, fontWeight: 600 }}>Su nivel de riesgo psicosocial</h2>
        <div className="card p-6 mt-5">
          <RiskGauge pct={results.totalPct} size="lg" />
          <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{RECOMMENDATIONS[overall.label]}</p>
        </div>

        <h3 className="disp mt-8" style={{ fontSize: 16, fontWeight: 600 }}>Por categoría</h3>
        <div className="space-y-4 mt-4">
          {results.perCategory.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="text-sm font-medium mb-2">{c.label}</div>
              <RiskGauge pct={c.pct} size="sm" />
            </div>
          ))}
        </div>
        <p className="mono mt-8" style={{ fontSize: 10.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
          Prototipo funcional — reproduce la metodología de la NOM-035-STPS-2018 (categorías, dominios y escala de calificación) con un conjunto representativo de reactivos. Para el cumplimiento formal ante la STPS, aplique el instrumento oficial completo de la Guía de Referencia correspondiente.
        </p>
    </div>
  );
}

/* ---------------- Admin ---------------- */
function AdminDashboard({ admin, users, resultsByUser, guide, setGuide, onAddEmployee, onOpenDetail }) {
  const [form, setForm] = useState({ nombre: "", area: "" });
  const evaluados = users.employees.filter((e) => resultsByUser[e.id]);
  const pendientes = users.employees.length - evaluados.length;
  const promedio = evaluados.length
    ? evaluados.reduce((s, e) => s + resultsByUser[e.id].totalPct, 0) / evaluados.length
    : 0;

  const distribucion = ["Nulo", "Bajo", "Medio", "Alto", "Muy alto"].map((label) => ({
    label,
    count: evaluados.filter((e) => riskLevel(resultsByUser[e.id].totalPct).label === label).length,
  }));
  const maxDist = Math.max(1, ...distribucion.map((d) => d.count));

  function submitForm() {
    if (!form.nombre.trim()) return;
    onAddEmployee(form.nombre.trim(), form.area.trim() || "General");
    setForm({ nombre: "", area: "" });
  }

  function exportCSV() {
    const rows = [["Nombre", "Área", "Estatus", "Nivel de riesgo", "Puntaje (%)"]];
    users.employees.forEach((e) => {
      const r = resultsByUser[e.id];
      rows.push([e.nombre, e.area, r ? "Completado" : "Pendiente", r ? riskLevel(r.totalPct).label : "-", r ? r.totalPct.toFixed(1) : "-"]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "nom035_resultados.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="disp" style={{ fontSize: 24, fontWeight: 600 }}>Panorama general</h2>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Guía aplicable a la organización:</p>
        </div>
        <div className="flex gap-1" style={{ background: "#EDEBE3", borderRadius: 4, padding: 3 }}>
          {[{ id: "II", l: "Guía II · 16–50" }, { id: "III", l: "Guía III · 50+" }].map((g) => (
            <button key={g.id} onClick={() => setGuide(g.id)}
              className="px-3 py-1.5 text-xs font-medium"
              style={{ borderRadius: 3, background: guide === g.id ? "#fff" : "transparent", boxShadow: guide === g.id ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>
              {g.l}
            </button>
          ))}
        </div>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Colaboradores", value: users.employees.length },
            { label: "Evaluados", value: evaluados.length },
            { label: "Pendientes", value: pendientes },
            { label: "Riesgo promedio", value: `${promedio.toFixed(0)}%` },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>{s.label.toUpperCase()}</div>
              <div className="disp mt-1" style={{ fontSize: 26, fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card p-5 mb-8">
          <div className="text-sm font-medium mb-4">Distribución de niveles de riesgo</div>
          <div className="space-y-2.5">
            {distribucion.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className="mono" style={{ width: 70, fontSize: 11, color: "var(--ink-soft)" }}>{d.label}</div>
                <div className="gauge-track flex-1" style={{ height: 10 }}>
                  <div style={{ width: `${(d.count / maxDist) * 100}%`, height: "100%", background: riskLevel(
                    { Nulo: 10, Bajo: 30, Medio: 50, Alto: 70, "Muy alto": 90 }[d.label]
                  ).color, borderRadius: 99 }} />
                </div>
                <div className="mono" style={{ width: 20, fontSize: 11, textAlign: "right" }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Colaboradores</div>
          <button onClick={exportCSV} className="btn-secondary text-xs px-3 py-1.5">Exportar CSV</button>
        </div>
        <div className="card overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "#FAF9F5" }}>
                <th className="text-left px-4 py-2.5 font-medium" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>NOMBRE</th>
                <th className="text-left px-4 py-2.5 font-medium" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>ÁREA</th>
                <th className="text-left px-4 py-2.5 font-medium" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>ESTATUS</th>
                <th className="text-left px-4 py-2.5 font-medium" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>RIESGO</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.employees.map((e) => {
                const r = resultsByUser[e.id];
                return (
                  <tr key={e.id} className="row-hover" style={{ borderBottom: "1px solid var(--line)" }}>
                    <td className="px-4 py-3">{e.nombre}</td>
                    <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>{e.area}</td>
                    <td className="px-4 py-3">
                      <span className="badge" style={{ background: r ? "var(--teal-soft)" : "#EDEBE3", color: r ? "var(--teal)" : "var(--ink-soft)" }}>
                        {r ? "Completado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ width: 160 }}>
                      {r ? <RiskGauge pct={r.totalPct} size="sm" /> : <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r && <button className="btn-secondary text-xs px-2.5 py-1" onClick={() => onOpenDetail(e.id)}>Ver detalle</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <div className="text-sm font-medium mb-3">Agregar colaborador</div>
          <div className="flex flex-wrap gap-3">
            <input className="field px-3 py-2 text-sm flex-1 min-w-[160px]" placeholder="Nombre completo" value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") submitForm(); }} />
            <input className="field px-3 py-2 text-sm flex-1 min-w-[140px]" placeholder="Área (opcional)" value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") submitForm(); }} />
            <button className="btn-primary px-4 py-2 text-sm font-medium" onClick={submitForm}>Agregar</button>
          </div>
          <p className="mono mt-3" style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>Contraseña temporal generada: demo123</p>
        </div>
    </div>
  );
}

function AdminInbox({ complaints, employeeList, onUpdate }) {
  const [filter, setFilter] = useState("Todas");
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState("");

  const withNames = complaints.map((c) => ({
    ...c,
    displayName: c.anonima ? "Anónimo" : (employeeList.find((e) => e.id === c.employeeId)?.nombre || "—"),
  })).sort((a, b) => b.fecha - a.fecha);

  const filtered = filter === "Todas" ? withNames : withNames.filter((c) => c.estatus === filter);

  function openRow(c) {
    setOpenId(openId === c.id ? null : c.id);
    setDraft(c.respuesta || "");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h2 className="disp mb-6" style={{ fontSize: 24, fontWeight: 600 }}>Buzón de quejas</h2>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {["Todas", "Recibida", "En revisión", "Resuelta"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`likert-opt px-3 py-1.5 text-xs ${filter === f ? "sel" : ""}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 && (
          <div className="card p-8 text-center" style={{ color: "var(--ink-soft)" }}><p className="text-sm">No hay quejas en esta categoría.</p></div>
        )}

        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="card p-4">
              <button className="w-full text-left" onClick={() => openRow(c)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{c.categoria}</span>
                    <span className="text-sm font-medium">{c.displayName}</span>
                  </div>
                  <span className="badge" style={{ background: COMPLAINT_STATUS_COLOR[c.estatus], color: "#fff" }}>{c.estatus}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{c.texto}</p>
              </button>

              {openId === c.id && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["Recibida", "En revisión", "Resuelta"].map((s) => (
                      <button key={s} onClick={() => onUpdate(c.id, { estatus: s })}
                        className={`likert-opt px-3 py-1.5 text-xs ${c.estatus === s ? "sel" : ""}`}>{s}</button>
                    ))}
                  </div>
                  <textarea className="field w-full px-3 py-2 text-sm" rows={3} placeholder="Escribir respuesta / seguimiento…"
                    value={draft} onChange={(e) => setDraft(e.target.value)} />
                  <button className="btn-primary px-4 py-2 text-sm font-medium mt-2"
                    onClick={() => onUpdate(c.id, { respuesta: draft })}>
                    Guardar respuesta
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminHub({ admin, users, resultsByUser, guide, setGuide, onAddEmployee, onOpenDetail, complaints, onUpdateComplaint, activeId, onSelect, onLogout, detailEmployee, onCloseDetail }) {
  const pendingComplaints = complaints.filter((c) => c.estatus !== "Resuelta").length;
  const items = [
    { id: "panorama", label: "Panorama general" },
    { id: "buzon", label: "Buzón de quejas", badge: pendingComplaints },
  ];

  return (
    <div className="n035 min-h-screen">
      <HeaderNav items={items} activeId={activeId} onSelect={(id) => { onCloseDetail(); onSelect(id); }} userName={admin.nombre} roleLabel="Recursos Humanos" onLogout={onLogout} />
      <main>
        {detailEmployee ? (
          <AdminDetail employee={detailEmployee} result={resultsByUser[detailEmployee.id]} onBack={onCloseDetail} />
        ) : activeId === "buzon" ? (
          <AdminInbox complaints={complaints} employeeList={users.employees} onUpdate={onUpdateComplaint} />
        ) : (
          <AdminDashboard admin={admin} users={users} resultsByUser={resultsByUser} guide={guide} setGuide={setGuide} onAddEmployee={onAddEmployee} onOpenDetail={onOpenDetail} />
        )}
      </main>
    </div>
  );
}

function AdminDetail({ employee, result, onBack }) {
  const overall = riskLevel(result.totalPct);
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="mono mb-6" style={{ fontSize: 11, color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer" }}>← Volver</button>
      <h2 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>{employee.nombre}</h2>
      <div className="mono mt-1 mb-6" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{employee.area} · Guía {result.guide}</div>
      {result.needsReferral && (
        <div className="card p-4 mb-6" style={{ borderLeft: "4px solid var(--r-muyalto)" }}>
          <p className="text-sm">Este colaborador fue canalizado a valoración médica/psicológica (Guía I).</p>
        </div>
      )}
      <div className="card p-6">
        <div className="text-sm font-medium mb-2">Resultado global</div>
        <RiskGauge pct={result.totalPct} size="lg" />
        <p className="text-sm mt-4" style={{ color: "var(--ink-soft)" }}>{RECOMMENDATIONS[overall.label]}</p>
      </div>
      <div className="space-y-4 mt-6">
        {result.perCategory.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="text-sm font-medium mb-2">{c.label}</div>
            <RiskGauge pct={c.pct} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- App raíz ---------------- */
export default function App() {
  const [users] = useState({
    admin: { username: "admin", password: "admin2026", nombre: "Recursos Humanos", role: "admin" },
    employees: [
      { id: "e1", username: "ana.lopez", password: "demo123", nombre: "Ana López", area: "Ventas" },
      { id: "e2", username: "carlos.diaz", password: "demo123", nombre: "Carlos Díaz", area: "Producción" },
      { id: "e3", username: "maria.torres", password: "demo123", nombre: "María Torres", area: "Administración" },
    ],
  });
  const [employeeList, setEmployeeList] = useState(users.employees);
  const [session, setSession] = useState(null); // {role, user}
  const [resultsByUser, setResultsByUser] = useState({});
  const [guide, setGuide] = useState("III");
  const [detailId, setDetailId] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [employeeView, setEmployeeView] = useState("home"); // home | evaluacion | buzon
  const [adminView, setAdminView] = useState("panorama"); // panorama | buzon

  function handleLogin(role, user) { setSession({ role, user }); setEmployeeView("home"); setAdminView("panorama"); }
  function handleLogout() { setSession(null); setDetailId(null); setEmployeeView("home"); setAdminView("panorama"); }
  function addEmployee(nombre, area) {
    const id = "e" + (employeeList.length + 1) + "-" + Date.now().toString(36);
    const username = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ").slice(0, 2).join(".");
    setEmployeeList((list) => [...list, { id, username, password: "demo123", nombre, area }]);
  }
  function addComplaint(employeeId, data) {
    const id = "q-" + Date.now().toString(36);
    setComplaints((list) => [...list, { id, employeeId, fecha: Date.now(), estatus: "Recibida", respuesta: "", ...data }]);
  }
  function updateComplaint(id, patch) {
    setComplaints((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} users={{ admin: users.admin, employees: employeeList }} />;
  }

  if (session.role === "admin") {
    const detailEmployee = detailId ? employeeList.find((e) => e.id === detailId) : null;
    return (
      <AdminHub
        admin={session.user}
        users={{ employees: employeeList }}
        resultsByUser={resultsByUser}
        guide={guide}
        setGuide={setGuide}
        onAddEmployee={addEmployee}
        onOpenDetail={setDetailId}
        complaints={complaints}
        onUpdateComplaint={updateComplaint}
        activeId={adminView}
        onSelect={setAdminView}
        onLogout={handleLogout}
        detailEmployee={detailEmployee}
        onCloseDetail={() => setDetailId(null)}
      />
    );
  }

  // colaborador
  const existing = resultsByUser[session.user.id];

  return (
    <EmployeeHub
      user={session.user}
      activeId={employeeView}
      onSelect={setEmployeeView}
      hasResults={!!existing}
      results={existing}
      guide={guide}
      complaints={complaints}
      onAddComplaint={(data) => addComplaint(session.user.id, data)}
      onFinishEvaluacion={(res) => setResultsByUser((m) => ({ ...m, [session.user.id]: res }))}
      onLogout={handleLogout}
    />
  );
}

 