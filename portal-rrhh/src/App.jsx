import { useState, useEffect, useRef } from "react";

// ── DATOS INICIALES ──────────────────────────────────────────────
const INIT_EMPLOYEES = [
  { id: 1, name: "Laura Gómez", role: "Analista Contable", area: "Finanzas", salary: 320000, startDate: "2022-03-15", contractEnd: "2025-05-01", status: "alerta", doc: "DNI 28.441.221" },
  { id: 2, name: "Marcos Díaz", role: "Coordinador Logístico", area: "Operaciones", salary: 410000, startDate: "2021-07-01", contractEnd: null, status: "activo", doc: "DNI 30.112.887" },
  { id: 3, name: "Sofía Herrera", role: "RRHH Jr.", area: "Recursos Humanos", salary: 280000, startDate: "2024-01-10", contractEnd: "2025-04-30", status: "alerta", doc: "DNI 35.772.003" },
  { id: 4, name: "Tomás Ruiz", role: "Vendedor Senior", area: "Comercial", salary: 490000, startDate: "2020-11-20", contractEnd: null, status: "activo", doc: "DNI 26.990.114" },
  { id: 5, name: "Valentina Cruz", role: "Diseñadora UX", area: "Tecnología", salary: 375000, startDate: "2023-06-05", contractEnd: "2025-06-30", status: "activo", doc: "DNI 33.654.009" },
];

const INIT_SEARCHES = [
  { id: 1, role: "Gerente de Ventas", area: "Comercial", candidates: 12, stage: 2, priority: "alta", open: "2025-03-01", notes: "Candidato finalista: Rodrigo M." },
  { id: 2, role: "Desarrollador Backend", area: "Tecnología", candidates: 8, stage: 1, priority: "media", open: "2025-03-18", notes: "En evaluación técnica pendiente." },
  { id: 3, role: "Asistente Administrativa", area: "Administración", candidates: 21, stage: 0, priority: "baja", open: "2025-04-02", notes: "Preselección en curso." },
];

const INIT_LIQUIS = [
  { id: 1, month: "Marzo 2025", total: 1875000, employees: 5, date: "31/03/2025", paid: true },
  { id: 2, month: "Febrero 2025", total: 1820000, employees: 5, date: "28/02/2025", paid: true },
  { id: 3, month: "Enero 2025", total: 1790000, employees: 5, date: "31/01/2025", paid: true },
  { id: 4, month: "Diciembre 2024", total: 2100000, employees: 5, date: "31/12/2024", paid: true },
];

const STAGES = ["Convocatoria", "Preselección", "Entrevistas", "Eval. técnica", "Oferta"];
const AREAS = ["Finanzas", "Operaciones", "Recursos Humanos", "Comercial", "Tecnología", "Administración", "Marketing"];
const PRIORITIES = ["alta", "media", "baja"];

// ── HELPERS ──────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtDate = d => d ? new Date(d).toLocaleDateString("es-AR") : "—";
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const initials = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

const AVATAR_COLORS = ["#e11d48","#7c3aed","#0891b2","#059669","#d97706","#db2777","#4f46e5","#0284c7"];
const avatarColor = name => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── TOKENS ───────────────────────────────────────────────────────
const C = {
  bg: "#f7f6f3",
  surface: "#ffffff",
  surfaceAlt: "#f0efe9",
  border: "#e4e1d8",
  borderStrong: "#ccc8be",
  text: "#1a1814",
  textMid: "#6b6760",
  textSoft: "#a09d97",
  accent: "#1a1814",
  accentLight: "#f0ede4",
  green: "#16a34a",
  greenBg: "#dcfce7",
  amber: "#d97706",
  amberBg: "#fef3c7",
  red: "#dc2626",
  redBg: "#fee2e2",
  blue: "#2563eb",
  blueBg: "#dbeafe",
  ink: "#1a1814",
};

// ── MODAL ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.surface,borderRadius:18,width:"min(520px,95vw)",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.18)",border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 28px 0" }}>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.text }}>{title}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textSoft,lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:"20px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── FIELD ─────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.textMid,letterSpacing:1,textTransform:"uppercase",marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bg,fontSize:14,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box" };

// ── BADGE ─────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color,letterSpacing:0.5,textTransform:"uppercase",display:"inline-block" }}>{label}</span>;
}

// ── MAIN ──────────────────────────────────────────────────────────
export default function HRPortalPro() {
  const [tab, setTab] = useState("dashboard");
  const [employees, setEmployees] = useState(INIT_EMPLOYEES);
  const [searches, setSearches] = useState(INIT_SEARCHES);
  const [liquis] = useState(INIT_LIQUIS);
  const [modal, setModal] = useState(null); // "addEmp" | "editEmp" | "addSearch" | "empDetail"
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // ── forms
  const [empForm, setEmpForm] = useState({});
  const [searchForm, setSearchForm] = useState({});

  const openAddEmp = () => { setEmpForm({ name:"",role:"",area:"Comercial",salary:"",startDate:"",contractEnd:"",doc:"" }); setModal("addEmp"); };
  const openEditEmp = emp => { setEmpForm({...emp, salary: String(emp.salary)}); setSelected(emp); setModal("editEmp"); };
  const openEmpDetail = emp => { setSelected(emp); setModal("empDetail"); };
  const openAddSearch = () => { setSearchForm({ role:"",area:"Comercial",priority:"media",notes:"" }); setModal("addSearch"); };

  const saveEmp = () => {
    const e = { ...empForm, salary: Number(empForm.salary), id: empForm.id || Date.now() };
    const days = daysUntil(e.contractEnd);
    e.status = (!e.contractEnd || days > 30) ? "activo" : "alerta";
    if (modal === "addEmp") setEmployees(prev => [...prev, e]);
    else setEmployees(prev => prev.map(x => x.id === e.id ? e : x));
    setModal(null);
  };

  const deleteEmp = id => { setEmployees(prev => prev.filter(e => e.id !== id)); setModal(null); };

  const saveSearch = () => {
    const s = { ...searchForm, id: Date.now(), candidates: 0, stage: 0, open: new Date().toISOString().slice(0,10) };
    setSearches(prev => [...prev, s]);
    setModal(null);
  };

  const advanceStage = id => setSearches(prev => prev.map(s => s.id === id && s.stage < 4 ? {...s, stage: s.stage+1} : s));
  const deleteSearch = id => setSearches(prev => prev.filter(s => s.id !== id));

  // ── derived
  const alerts = [
    ...employees.filter(e => { const d = daysUntil(e.contractEnd); return d !== null && d <= 30; })
      .map(e => ({ msg: `Contrato de ${e.name} vence en ${daysUntil(e.contractEnd)} días`, urgency: daysUntil(e.contractEnd) <= 17 ? "alta" : "media", icon: "📋" })),
    { msg: "Liquidación de Abril disponible el 30/04", urgency: "info", icon: "💰" },
    ...searches.filter(s => s.stage === 4).map(s => ({ msg: `Búsqueda de ${s.role} llegó a etapa Oferta`, urgency: "info", icon: "🎯" })),
  ];

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.area.toLowerCase().includes(searchQ.toLowerCase())
  );

  const totalNomina = employees.reduce((s, e) => s + e.salary, 0);

  const urgBg = { alta: C.redBg, media: C.amberBg, info: C.blueBg };
  const urgColor = { alta: C.red, media: C.amber, info: C.blue };
  const priColor = { alta: C.red, media: C.amber, baja: C.blue };
  const priBg = { alta: C.redBg, media: C.amberBg, baja: C.blueBg };

  const TABS = [
    { id:"dashboard", label:"Resumen", icon:"▤" },
    { id:"empleados", label:"Plantilla", icon:"◫" },
    { id:"seleccion", label:"Selección", icon:"◎" },
    { id:"liquidaciones", label:"Liquidaciones", icon:"◈" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{font-family:inherit}
        input:focus,select:focus,textarea:focus{border-color:#1a1814 !important;outline:none}
        .tab-item{transition:all 0.18s;cursor:pointer}
        .tab-item:hover{color:#1a1814 !important}
        .row{transition:background 0.15s;cursor:pointer}
        .row:hover{background:#f5f3ee !important}
        .btn{transition:all 0.15s;cursor:pointer;border:none;font-family:inherit}
        .btn:hover{opacity:0.85;transform:translateY(-1px)}
        .btn:active{transform:translateY(0)}
        .card{transition:box-shadow 0.2s,transform 0.2s}
        .card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.09)!important;transform:translateY(-2px)}
        .fade{animation:fadeUp 0.35s ease both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .stagger-1{animation-delay:0.05s}
        .stagger-2{animation-delay:0.10s}
        .stagger-3{animation-delay:0.15s}
        .stagger-4{animation-delay:0.20s}
        .pulse{animation:pulse 2.5s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#ccc8be;border-radius:3px}
        .progress-bar{transition:width 1s cubic-bezier(.4,0,.2,1)}
      `}</style>

      {/* TOP NAV */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", flexDirection:"column" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:C.text, letterSpacing:-0.3 }}>Portal RRHH</div>
              <div style={{ fontSize:10, color:C.textSoft, letterSpacing:1, textTransform:"uppercase", marginTop:-1 }}>TechStar Industries</div>
            </div>
            <div style={{ width:1, height:28, background:C.border }} />
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:C.green }} className="pulse" />
              <span style={{ fontSize:12, color:C.textMid }}>Activo</span>
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display:"flex", gap:4 }}>
            {TABS.map(t => (
              <button key={t.id} className="tab-item btn"
                onClick={() => { setTab(t.id); setSearchQ(""); }}
                style={{
                  padding:"8px 18px", borderRadius:10,
                  background: tab===t.id ? C.accentLight : "transparent",
                  color: tab===t.id ? C.text : C.textMid,
                  fontSize:13, fontWeight: tab===t.id ? 600 : 400,
                  display:"flex", alignItems:"center", gap:7,
                  border: tab===t.id ? `1px solid ${C.borderStrong}` : "1px solid transparent",
                }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>

          {/* Consultora */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12, color:C.textSoft }}>Gestionado por</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Tu Consultora RRHH</div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"36px 32px" }}>

        {/* ── DASHBOARD ─────────────────────────────────────────── */}
        {tab === "dashboard" && (
          <div className="fade">
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:800, color:C.text }}>Buenos días, TechStar 👋</h1>
              <p style={{ fontSize:14, color:C.textMid, marginTop:4 }}>{new Date().toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            </div>

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              {[
                { label:"Empleados activos", val:employees.filter(e=>e.status==="activo").length, sub:`${employees.length} en nómina`, color:C.text, icon:"👥", delay:"stagger-1" },
                { label:"Costo nómina / mes", val:fmt(totalNomina), sub:"Estimado bruto", color:C.green, icon:"💰", delay:"stagger-2" },
                { label:"Búsquedas abiertas", val:searches.length, sub:`${searches.reduce((s,r)=>s+r.candidates,0)} candidatos`, color:C.blue, icon:"🔍", delay:"stagger-3" },
                { label:"Alertas urgentes", val:alerts.filter(a=>a.urgency==="alta").length, sub:"Requieren atención", color:C.red, icon:"⚠️", delay:"stagger-4" },
              ].map((k,i) => (
                <div key={i} className={`card fade ${k.delay}`} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{k.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:800, color:k.color, lineHeight:1 }}>{k.val}</div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:6, fontWeight:500 }}>{k.label}</div>
                  <div style={{ fontSize:11, color:C.textSoft, marginTop:3 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:20 }}>
              {/* Alertas */}
              <div className="fade stagger-2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:18 }}>Alertas & novedades</div>
                {alerts.length === 0 && <div style={{ fontSize:13, color:C.textSoft }}>Sin alertas pendientes ✓</div>}
                {alerts.map((a,i) => (
                  <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", borderRadius:12, marginBottom:8, background:urgBg[a.urgency], border:`1px solid ${urgColor[a.urgency]}30` }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{a.msg}</div>
                      <div style={{ fontSize:11, color:urgColor[a.urgency], marginTop:2, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
                        {a.urgency==="alta"?"Urgente":a.urgency==="media"?"Importante":"Informativo"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Búsquedas */}
              <div className="fade stagger-3" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:18 }}>Búsquedas activas</div>
                {searches.map((s,i) => (
                  <div key={i} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{s.role}</div>
                        <div style={{ fontSize:11, color:C.textSoft }}>{STAGES[s.stage]} · {s.candidates} candidatos</div>
                      </div>
                      <Badge label={s.priority} color={priColor[s.priority]} bg={priBg[s.priority]} />
                    </div>
                    <div style={{ height:5, background:C.surfaceAlt, borderRadius:3, overflow:"hidden" }}>
                      <div className="progress-bar" style={{ height:"100%", borderRadius:3, width:`${Math.round((s.stage/4)*100)}%`, background:`linear-gradient(90deg,${C.ink},#555)` }} />
                    </div>
                    <div style={{ fontSize:10, color:C.textSoft, marginTop:3, textAlign:"right" }}>{Math.round((s.stage/4)*100)}%</div>
                  </div>
                ))}
                {searches.length === 0 && <div style={{ fontSize:13, color:C.textSoft }}>Sin búsquedas activas</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── EMPLEADOS ─────────────────────────────────────────── */}
        {tab === "empleados" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800 }}>Plantilla de empleados</h1>
                <p style={{ fontSize:13, color:C.textMid, marginTop:3 }}>{employees.length} empleados · Nómina total {fmt(totalNomina)}/mes</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar empleado..." style={{ ...inputStyle, width:220, height:38, fontSize:13 }} />
                <button className="btn" onClick={openAddEmp} style={{ background:C.text, color:"#fff", padding:"0 20px", borderRadius:10, fontSize:13, fontWeight:600, height:38 }}>+ Agregar</button>
              </div>
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.surfaceAlt, borderBottom:`1px solid ${C.border}` }}>
                    {["Empleado","Área","Sueldo bruto","Ingreso","Vto. contrato","Estado",""].map(h => (
                      <th key={h} style={{ padding:"11px 20px", textAlign:"left", fontSize:10, color:C.textSoft, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmps.map((e,i) => {
                    const days = daysUntil(e.contractEnd);
                    return (
                      <tr key={e.id} className="row" style={{ borderTop:`1px solid ${C.border}` }}>
                        <td style={{ padding:"14px 20px" }} onClick={() => openEmpDetail(e)}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", background:avatarColor(e.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{initials(e.name)}</div>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600 }}>{e.name}</div>
                              <div style={{ fontSize:11, color:C.textSoft }}>{e.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"14px 20px", fontSize:13, color:C.textMid }} onClick={() => openEmpDetail(e)}>{e.area}</td>
                        <td style={{ padding:"14px 20px", fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:C.green }} onClick={() => openEmpDetail(e)}>{fmt(e.salary)}</td>
                        <td style={{ padding:"14px 20px", fontSize:13, color:C.textMid }} onClick={() => openEmpDetail(e)}>{fmtDate(e.startDate)}</td>
                        <td style={{ padding:"14px 20px", fontSize:13, color: days !== null && days <= 30 ? C.amber : C.textMid }} onClick={() => openEmpDetail(e)}>
                          {e.contractEnd ? `${fmtDate(e.contractEnd)}${days!==null&&days<=30?` (${days}d)`:""}` : "Indefinido"}
                        </td>
                        <td style={{ padding:"14px 20px" }} onClick={() => openEmpDetail(e)}>
                          <Badge label={e.status==="activo"?"Activo":"Alerta"} color={e.status==="activo"?C.green:C.amber} bg={e.status==="activo"?C.greenBg:C.amberBg} />
                        </td>
                        <td style={{ padding:"14px 20px" }}>
                          <button className="btn" onClick={()=>openEditEmp(e)} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 12px", fontSize:12, color:C.textMid }}>Editar</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmps.length === 0 && (
                    <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:C.textSoft, fontSize:14 }}>No se encontraron empleados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SELECCIÓN ─────────────────────────────────────────── */}
        {tab === "seleccion" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800 }}>Búsquedas activas</h1>
                <p style={{ fontSize:13, color:C.textMid, marginTop:3 }}>{searches.length} búsquedas · {searches.reduce((s,r)=>s+r.candidates,0)} candidatos en proceso</p>
              </div>
              <button className="btn" onClick={openAddSearch} style={{ background:C.text, color:"#fff", padding:"0 20px", borderRadius:10, fontSize:13, fontWeight:600, height:38 }}>+ Nueva búsqueda</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {searches.map((s,i) => (
                <div key={s.id} className={`card fade stagger-${Math.min(i+1,4)}`} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>{s.role}</div>
                      <div style={{ fontSize:13, color:C.textMid, marginTop:3 }}>Área: {s.area} · Abierta: {fmtDate(s.open)} · {s.candidates} candidatos</div>
                      {s.notes && <div style={{ fontSize:12, color:C.textSoft, marginTop:5, fontStyle:"italic" }}>{s.notes}</div>}
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <Badge label={s.priority} color={priColor[s.priority]} bg={priBg[s.priority]} />
                      {s.stage < 4 && (
                        <button className="btn" onClick={()=>advanceStage(s.id)} style={{ background:C.accentLight, border:`1px solid ${C.borderStrong}`, borderRadius:8, padding:"5px 12px", fontSize:12, color:C.text, fontWeight:600 }}>Avanzar etapa →</button>
                      )}
                      <button className="btn" onClick={()=>deleteSearch(s.id)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 10px", fontSize:12, color:C.textSoft }}>✕</button>
                    </div>
                  </div>

                  {/* Stage pipeline */}
                  <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                    {STAGES.map((stage,si) => (
                      <div key={si} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
                        {si > 0 && <div style={{ position:"absolute", left:0, top:11, width:"50%", height:3, background: si<=s.stage ? C.ink : C.border, zIndex:0, transition:"background 0.4s" }} />}
                        {si < STAGES.length-1 && <div style={{ position:"absolute", right:0, top:11, width:"50%", height:3, background: si<s.stage ? C.ink : C.border, zIndex:0, transition:"background 0.4s" }} />}
                        <div style={{ width:24, height:24, borderRadius:"50%", zIndex:1, display:"flex", alignItems:"center", justifyContent:"center", background: si<s.stage ? C.ink : si===s.stage ? C.surface : C.surfaceAlt, border: si===s.stage ? `2.5px solid ${C.ink}` : si<s.stage ? `2.5px solid ${C.ink}` : `2px solid ${C.border}`, transition:"all 0.4s", boxShadow: si===s.stage ? "0 0 0 4px rgba(26,24,20,0.1)" : "none" }}>
                          {si < s.stage && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
                          {si === s.stage && <div style={{ width:8, height:8, borderRadius:"50%", background:C.ink }} />}
                        </div>
                        <div style={{ fontSize:10, color: si===s.stage ? C.text : C.textSoft, fontWeight: si===s.stage ? 700 : 400, marginTop:6, textAlign:"center", letterSpacing:0.2 }}>{stage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {searches.length === 0 && (
                <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:48, textAlign:"center", color:C.textSoft, fontSize:14 }}>
                  No hay búsquedas activas. ¡Agregá una!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LIQUIDACIONES ─────────────────────────────────────── */}
        {tab === "liquidaciones" && (
          <div className="fade">
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:800 }}>Liquidaciones</h1>
              <p style={{ fontSize:13, color:C.textMid, marginTop:3 }}>Historial de liquidaciones procesadas por Tu Consultora RRHH</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
              {[
                { label:"Próxima liquidación", val:"30 Abr 2025", icon:"📅", color:C.blue },
                { label:"Último total liquidado", val:fmt(1875000), icon:"💰", color:C.green },
                { label:"Empleados en nómina", val:String(employees.length), icon:"👥", color:C.text },
              ].map((k,i) => (
                <div key={i} className="card fade" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{k.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:800, color:k.color }}>{k.val}</div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:6 }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:C.surfaceAlt, borderBottom:`1px solid ${C.border}` }}>
                    {["Período","Empleados","Total liquidado","Fecha de pago","Estado"].map(h => (
                      <th key={h} style={{ padding:"11px 24px", textAlign:"left", fontSize:10, color:C.textSoft, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liquis.map((l,i) => (
                    <tr key={i} className="row" style={{ borderTop:`1px solid ${C.border}` }}>
                      <td style={{ padding:"16px 24px" }}><span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700 }}>{l.month}</span></td>
                      <td style={{ padding:"16px 24px", fontSize:13, color:C.textMid }}>{l.employees} empleados</td>
                      <td style={{ padding:"16px 24px", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:800, color:C.green }}>{fmt(l.total)}</td>
                      <td style={{ padding:"16px 24px", fontSize:13, color:C.textMid }}>{l.date}</td>
                      <td style={{ padding:"16px 24px" }}><Badge label="✓ Pagado" color={C.green} bg={C.greenBg} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tendencia */}
            <div style={{ marginTop:20, background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Evolución de nómina</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:16, height:80 }}>
                {liquis.slice().reverse().map((l,i) => {
                  const max = Math.max(...liquis.map(x=>x.total));
                  const h = Math.round((l.total/max)*72);
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <div style={{ fontSize:11, color:C.textSoft, fontWeight:600 }}>{fmt(l.total)}</div>
                      <div style={{ width:"100%", height:h, background:i===liquis.length-1?C.ink:C.border, borderRadius:"5px 5px 0 0", transition:"height 0.6s ease", minHeight:8 }} />
                      <div style={{ fontSize:11, color:C.textSoft }}>{l.month.split(" ")[0].slice(0,3)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ──────────────────────────────────────────────── */}

      {/* Detalle empleado */}
      {modal === "empDetail" && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22, padding:"16px", background:C.surfaceAlt, borderRadius:12 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:avatarColor(selected.name), display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#fff" }}>{initials(selected.name)}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:700 }}>{selected.name}</div>
              <div style={{ fontSize:13, color:C.textMid }}>{selected.role} · {selected.area}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              ["Documento", selected.doc||"—"],
              ["Sueldo bruto", fmt(selected.salary)],
              ["Fecha de ingreso", fmtDate(selected.startDate)],
              ["Tipo de contrato", selected.contractEnd?"Plazo fijo":"Indefinido"],
              ["Vencimiento", selected.contractEnd?`${fmtDate(selected.contractEnd)} (${daysUntil(selected.contractEnd)}d)`:"No aplica"],
              ["Estado", selected.status==="activo"?"Activo ✓":"Alerta ⚠️"],
            ].map(([k,v],i) => (
              <div key={i} style={{ background:C.bg, borderRadius:10, padding:"12px 16px", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, color:C.textSoft, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button className="btn" onClick={()=>openEditEmp(selected)} style={{ flex:1, background:C.accentLight, border:`1px solid ${C.borderStrong}`, borderRadius:10, padding:"10px", fontSize:13, fontWeight:600, color:C.text }}>Editar empleado</button>
            <button className="btn" onClick={()=>deleteEmp(selected.id)} style={{ flex:1, background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:10, padding:"10px", fontSize:13, fontWeight:600, color:C.red }}>Eliminar</button>
          </div>
        </Modal>
      )}

      {/* Add / Edit empleado */}
      {(modal==="addEmp"||modal==="editEmp") && (
        <Modal title={modal==="addEmp"?"Nuevo empleado":"Editar empleado"} onClose={()=>setModal(null)}>
          <Field label="Nombre completo"><input style={inputStyle} value={empForm.name||""} onChange={e=>setEmpForm(p=>({...p,name:e.target.value}))} placeholder="Ej: Ana García" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Cargo"><input style={inputStyle} value={empForm.role||""} onChange={e=>setEmpForm(p=>({...p,role:e.target.value}))} placeholder="Ej: Analista" /></Field>
            <Field label="Área">
              <select style={inputStyle} value={empForm.area||"Comercial"} onChange={e=>setEmpForm(p=>({...p,area:e.target.value}))}>
                {AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Sueldo bruto (ARS)"><input style={inputStyle} type="number" value={empForm.salary||""} onChange={e=>setEmpForm(p=>({...p,salary:e.target.value}))} placeholder="320000" /></Field>
            <Field label="Documento"><input style={inputStyle} value={empForm.doc||""} onChange={e=>setEmpForm(p=>({...p,doc:e.target.value}))} placeholder="DNI 28.000.000" /></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Fecha de ingreso"><input style={inputStyle} type="date" value={empForm.startDate||""} onChange={e=>setEmpForm(p=>({...p,startDate:e.target.value}))} /></Field>
            <Field label="Vto. contrato (opcional)"><input style={inputStyle} type="date" value={empForm.contractEnd||""} onChange={e=>setEmpForm(p=>({...p,contractEnd:e.target.value}))} /></Field>
          </div>
          <button className="btn" onClick={saveEmp} style={{ width:"100%", background:C.text, color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, marginTop:8 }}>
            {modal==="addEmp"?"Agregar empleado":"Guardar cambios"}
          </button>
        </Modal>
      )}

      {/* Add búsqueda */}
      {modal==="addSearch" && (
        <Modal title="Nueva búsqueda" onClose={()=>setModal(null)}>
          <Field label="Puesto a cubrir"><input style={inputStyle} value={searchForm.role||""} onChange={e=>setSearchForm(p=>({...p,role:e.target.value}))} placeholder="Ej: Gerente Comercial" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Área">
              <select style={inputStyle} value={searchForm.area||"Comercial"} onChange={e=>setSearchForm(p=>({...p,area:e.target.value}))}>
                {AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Prioridad">
              <select style={inputStyle} value={searchForm.priority||"media"} onChange={e=>setSearchForm(p=>({...p,priority:e.target.value}))}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notas internas">
            <textarea style={{...inputStyle,resize:"vertical",minHeight:70}} value={searchForm.notes||""} onChange={e=>setSearchForm(p=>({...p,notes:e.target.value}))} placeholder="Ej: Perfil con 5 años de experiencia en B2B" />
          </Field>
          <button className="btn" onClick={saveSearch} style={{ width:"100%", background:C.text, color:"#fff", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, marginTop:8 }}>Iniciar búsqueda</button>
        </Modal>
      )}
    </div>
  );
}
