/* ======================================================================
   Analista de datos · Power BI + Tableau — utilidades compartidas
   Estado, progreso, modo instructor, cuestionarios, instrucciones de IA
   y funciones para resumir los datos de Distribuidora Andina.
   ====================================================================== */
const REPO = "OmarLi-360/powerbi-tableau-analista";
const GH = `https://github.com/${REPO}`;
const RAW = `https://github.com/${REPO}/raw/main`;
const colabURL = f => `https://colab.research.google.com/github/${REPO}/blob/main/notebooks/${f}`;
const D = window.DATA_ANDINA, C = D.cols, DM = D.dims, X = window.DATA_EXTRA;
const NL = C.subtotal.length;
const nf = new Intl.NumberFormat("es-CO");
const pf = new Intl.NumberFormat("es-CO",{style:"percent", minimumFractionDigits:1, maximumFractionDigits:1});
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad2 = n => String(n).padStart(2,"0");
const mill = v => "$ " + nf.format(Math.round(v/1e6)) + " M";
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/* ---------- almacenamiento local (solo en este navegador) ---------- */
const store = {
  get(k, def){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : def }catch(e){ return def } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} }
};
let PROG = Object.assign({done:{}, quiz:{}, check:{}}, store.get("pbt", {}));
function saveProg(){ store.set("pbt", PROG); paintMeter() }
function paintMeter(){
  const n = PILOTO.filter(k=>PROG.done[k]).length;
  $("#meterbar").style.width = (n/PILOTO.length*100)+"%";
  $("#metertxt").textContent = `${n} de ${PILOTO.length}`;
}
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2200) }

/* ---------- modo instructor ---------- */
function setInstructor(on){
  document.body.classList.toggle("instructor", on);
  $("#modoDocente").setAttribute("aria-pressed", on);
  store.set("pbt-docente", on);
}

/* Guía docente: {duracion:[[bloque,min,qué]], preguntas:[], errores:[], cierre:""} */
function docenteBox(d){
  if(!d) return "";
  return `<div class="docente" role="note"><span class="k">Guía para el instructor</span>
    ${d.duracion?`<table><tr><th>Bloque</th><th>Min</th><th>Qué hacer</th></tr>${d.duracion.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`:""}
    ${d.preguntas?`<div><b>Preguntas para discutir</b><ul class="plain">${d.preguntas.map(p=>`<li>${p}</li>`).join("")}</ul></div>`:""}
    ${d.errores?`<div><b>Errores que vas a ver</b><ul class="plain">${d.errores.map(p=>`<li>${p}</li>`).join("")}</ul></div>`:""}
    ${d.cierre?`<p><b>Cierre:</b> ${d.cierre}</p>`:""}
  </div>`;
}

function fxbar(name, html){ return `<div class="fx" role="img" aria-label="Barra de fórmulas"><div class="namebox">${name}</div><div class="fxl">fx</div><div class="formula">${html}</div></div>` }

/* ---------- instrucciones de IA con botón Copiar ---------- */
function promptsHTML(lista, pref="pr"){
  return lista.map((x,i)=>`<div class="prompt"><header><b>${x.t}</b><button class="btn small" data-copy="${pref}-${i}">Copiar</button></header><pre id="${pref}-${i}">${esc(x.p)}</pre></div>`).join("");
}
function wireCopy(root){
  root.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{
    const pre = $("#"+b.dataset.copy), txt = pre.textContent;
    const done = ()=>{ b.textContent="Copiado"; setTimeout(()=>b.textContent="Copiar",1600) };
    const sel = ()=>{ const r=document.createRange(); r.selectNodeContents(pre); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast("Texto seleccionado: usa Ctrl+C") };
    if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(done).catch(sel) } else sel();
  });
}

/* ---------- cuestionario genérico ---------- */
function renderQuiz(el, quiz, onFinish){
  const ans = {};
  el.innerHTML = quiz.map((q,i)=>`<div class="qitem" data-q="${i}"><b>${i+1}. ${esc(q.q)}</b>
    <div class="opts">${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${esc(o)}</button>`).join("")}</div><div class="why" hidden></div></div>`).join("") +
    `<div class="result" data-res><span class="muted">Responde las ${quiz.length} preguntas. Con ${Math.ceil(quiz.length*.75)} correctas la clave queda completada.</span></div>`;
  el.querySelectorAll(".qitem").forEach(item=>{
    const i=+item.dataset.q, q=quiz[i];
    item.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
      const j=+b.dataset.j; ans[i]=j===q.a;
      item.querySelectorAll(".opt").forEach(x=>{ x.disabled=true; if(+x.dataset.j===q.a) x.classList.add("right") });
      if(j!==q.a) b.classList.add("wrong");
      const w=item.querySelector(".why"); w.hidden=false; w.innerHTML=`<b>${j===q.a?"Correcto.":"No es esa."}</b> ${esc(q.w)}`;
      if(Object.keys(ans).length===quiz.length){
        const ok=Object.values(ans).filter(Boolean).length;
        onFinish(ok, el.querySelector("[data-res]"), ()=>renderQuiz(el, quiz, onFinish));
      }
    });
  });
}

/* ---------- lista de chequeo persistente (talleres) ---------- */
function checklistHTML(id, items){
  const st = PROG.check[id] || {};
  return `<div class="checklist" data-cl="${id}">${items.map((t,i)=>`<label class="${st[i]?"done":""}"><input type="checkbox" data-i="${i}" ${st[i]?"checked":""}> <span>${t}</span></label>`).join("")}</div>`;
}
function wireChecklists(root){
  root.querySelectorAll("[data-cl]").forEach(cl=>{
    cl.querySelectorAll("input").forEach(inp=>inp.onchange=()=>{
      const id=cl.dataset.cl; PROG.check[id]=PROG.check[id]||{}; PROG.check[id][inp.dataset.i]=inp.checked;
      inp.closest("label").classList.toggle("done", inp.checked); saveProg();
    });
  });
}

/* ---------- resumir datos ----------
   agg(por, {filtro, valor}) → Map clave→suma.  por: nombre de columna o función(i).
   Por omisión excluye anuladas (estado 2), porque no son venta. */
function agg(por, opt={}){
  const m = new Map(), key = typeof por==="function" ? por : (i=>C[por][i]);
  const val = opt.valor==="margen"? (i=>C.margen[i]) : opt.valor==="lineas"? (()=>1) : opt.valor==="cantidad"? (i=>C.cantidad[i]) : (i=>C.subtotal[i]);
  for(let i=0;i<NL;i++){
    if(!opt.conAnuladas && C.estado[i]===2) continue;
    if(opt.filtro && !opt.filtro(i)) continue;
    const k=key(i); m.set(k,(m.get(k)||0)+val(i));
  }
  return m;
}
const anioIdx = a => DM.anio.indexOf(a);
const es2025 = i => C.anio[i]===anioIdx(2025);
