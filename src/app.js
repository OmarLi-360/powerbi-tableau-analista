/* ======================================================================
   APLICACIÓN · vistas generales, módulo de clave y enrutador
   ====================================================================== */
const app = $("#app");
let DIAGR = {};

/* ---------- INICIO ---------- */
function viewInicio(){
  const c = X.control["Año 2025"];
  app.innerHTML = `
  <div class="wrap">
    <div class="hero">
      <div class="stack" style="gap:18px">
        ${fxbar("Medida", `Analista = <span class="fn">CALCULATE</span>([Modelo], <span class="str">"Power BI"</span>, <span class="str">"Tableau"</span>)`)}
        <h1>Del CSV al tablero que una empresa usa, y al portafolio que te abre la puerta.</h1>
        <p class="lead">Un curso de Power BI Desktop y Tableau Public para aprendices SENA y estudiantes que van hacia el perfil de analista de datos. Ocho claves alineadas con la certificación PL-300, con la misma empresa ficticia del curso de Excel y cifras de control para verificar cada medida.</p>
        <div class="row"><a class="btn primary" href="#perfil">Ver el perfil</a><a class="btn" href="#diagnostico" data-go-diag>Hacer el diagnóstico</a></div>
      </div>
      <div class="stats" aria-label="El curso en cifras">
        <div class="stat"><b>8</b><span>claves que cubren las cuatro áreas del examen PL-300.</span><small>Preparar · Modelar · Visualizar · Publicar</small></div>
        <div class="stat"><b>${nf.format(X.filas.ventas)}</b><span>líneas de venta en un modelo estrella de 7 tablas.</span><small>Distribuidora Andina S.A.S., datos ficticios</small></div>
        <div class="stat"><b>${pct1(c["Cumplimiento"])}</b><span>es la cifra de control del cumplimiento 2025: si tu medida da otra cosa, hay que revisarla.</span><small>Cifras de control en cada taller</small></div>
      </div>
    </div>

    <section class="block"><div class="sechead"><span class="eyebrow">Empieza aquí</span><h2>Cinco pasos, en este orden</h2></div>
      <div class="path" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        <a href="#perfil"><span class="n">1</span><b>Conoce el perfil</b><span>Qué piden las vacantes y cómo encaja este curso en la línea de formación.</span></a>
        <a href="#modelo"><span class="n">2</span><b>Conoce los datos</b><span>Las siete tablas de Distribuidora Andina y sus cifras de control.</span></a>
        <a href="#herramientas"><span class="n">3</span><b>Conoce las herramientas</b><span>Fichas de Power BI Desktop y Tableau Public, pantalla por pantalla, y su instalación (Taller P0).</span></a>
        <a href="#ruta"><span class="n">4</span><b>Estudia las claves</b><span>Simulador, pasos en Power BI, la versión en Tableau, Colab e IA.</span></a>
        <a href="#laboratorio"><span class="n">5</span><b>Construye y publica</b><span>Del modelo al tablero del comité y a tu portafolio público.</span></a>
      </div>
      <p class="muted small" style="margin-top:10px">¿Vienes sin Excel? Empieza por <a href="https://omarli-360.github.io/excel-corporativo-12-claves/" target="_blank" rel="noopener">Excel Corporativo · 12 Claves</a>: claves 1, 6, 7 y 8.</p>
    </section>

    <section class="block" id="diagnostico"><div class="sechead"><span class="eyebrow">Diagnóstico</span><h2>¿Por dónde empiezo?</h2><p class="muted read">Responde con sinceridad: nadie más ve tus respuestas.</p></div>
      <div class="diag">${DIAG.map((d,i)=>`
        <div class="q"><p>${d.q}</p>
          <div class="seg" role="group" aria-label="Respuesta">
            <button type="button" data-d="${i}" data-v="1" aria-pressed="${DIAGR[i]===1}">Sí</button>
            <button type="button" data-d="${i}" data-v="0" aria-pressed="${DIAGR[i]===0}">No</button>
          </div></div>`).join("")}</div>
      <div class="result" id="diagres"></div>
    </section>

    <section class="block" style="padding-bottom:40px"><div class="sechead"><span class="eyebrow">Cómo funciona cada clave</span><h2>Ocho pasos, del para qué al portafolio</h2></div>
      <div class="objs" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        ${STEPS.map((s,i)=>`<div><b>${i+1}. ${s[1]}</b><br><span class="muted">${s[2]}</span></div>`).join("")}
      </div>
    </section>
  </div>`;
  app.querySelectorAll("[data-go-diag]").forEach(a=>a.onclick=e=>{ e.preventDefault(); $("#diagnostico").scrollIntoView() });
  app.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{
    DIAGR[b.dataset.d] = +b.dataset.v;
    b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x===b));
    paintDiag();
  });
  paintDiag();
}
function paintDiag(){
  const el = $("#diagres"); if(!el) return;
  const answered = Object.keys(DIAGR).length;
  if(answered < DIAG.length){ el.innerHTML = `<span class="muted">Llevas ${answered} de ${DIAG.length} respuestas.</span>`; return }
  const set = [...new Set(DIAG.filter((d,i)=>DIAGR[i]===1).map(d=>d.si))].sort((a,b)=>a-b);
  if(!set.length){ el.innerHTML = `<h3>Tienes bases sólidas.</h3><p class="muted">Repasa las claves 3 y 4 para confirmar y pasa directo al laboratorio.</p><div class="row" style="margin-top:10px"><a class="btn primary" href="#laboratorio">Ir al laboratorio</a></div>`; return }
  const first = set.find(n=>MOD[n]) || set[0];
  el.innerHTML = `<h3>Tu ruta sugerida: ${set.map(n=>`clave ${n}`).join(" → ")}</h3>
    <p class="muted" style="margin-top:4px">Estúdialas en este orden: cada tramo se apoya en el anterior.</p>
    <div class="chips" style="margin-top:10px">${set.map(n=>{const k=CLAVES[n-1]; return `<a class="chip" href="#clave-${pad2(n)}">${n} · ${k.t}${MOD[n]?"":" (orientación)"}</a>`}).join("")}</div>
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#clave-${pad2(first)}">Empezar por la clave ${first}</a></div>`;
}

/* ---------- RUTA ---------- */
function viewRuta(){
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">Ruta de aprendizaje</span><h1>8 claves de Power BI y Tableau</h1>
      <p class="muted read">Cada tramo corresponde a un área del examen PL-300 y se apoya en el anterior. Las 8 claves están completas: cada una con su caso real, simulador, pasos en Power BI y en Tableau, cuaderno de Colab de control, apoyo de IA y autoevaluación.</p></div>
    ${TRAMOS.map((t,ti)=>`<div class="tramo">
      <div class="stack" style="gap:6px"><span class="eyebrow">Tramo ${ti+1}</span><h2>${t.t}</h2><p class="muted small">${t.d}</p></div>
      <div class="cards">${CLAVES.filter(k=>k.tramo===ti).map(card).join("")}</div></div>`).join("")}
    <div style="height:40px"></div>
  </div>`;
}
function card(k){
  const on = !!MOD[k.n], done = PROG.done[k.n];
  return `<a class="kcard ${on?"on":""}" href="#clave-${pad2(k.n)}">
    <div class="cell">${pad2(k.n)}</div>
    <h3>${k.t}</h3>
    <p>${k.brecha}</p>
    <div class="tags"><span class="tag">${k.nivel}</span><span class="tag">PL-300</span>${on?"":`<span class="tag">Orientación</span>`}${done?`<span class="tag ok">✓ Completada</span>`:""}</div>
  </a>`;
}

function orientacion(k){
  return `<div class="stack">
    <div class="prose"><p>${k.orient}</p></div>
    <div class="callout tip"><span class="k">En Tableau</span><p>${k.tab}</p></div>
    <div class="caso"><div class="rol" aria-hidden="true">${k.ej.rol}</div>
      <div class="stack" style="gap:8px"><span class="eyebrow">Ejemplo de aplicación · ${k.ej.cargo} en Distribuidora Andina</span>
      <dl><dt>Situación</dt><dd>${k.ej.sit}</dd><dt>Qué hace</dt><dd>${k.ej.ap}</dd><dt>Resultado</dt><dd>${k.ej.res}</dd></dl></div></div>
  </div>`;
}

function viewProximo(n){
  const k = CLAVES[n-1]; if(!k){ location.hash="#ruta"; return }
  app.innerHTML = `<div class="wrap read"><div class="mhead">
    <a href="#ruta" class="muted small">← Ruta de 8 claves</a>
    <span class="eyebrow">Clave ${n} · ${TRAMOS[k.tramo].t} · PL-300: ${k.pl}</span><h1>${k.t}</h1><p class="muted">${k.s}</p></div>
    <div class="stack" style="padding-bottom:40px">
      <div class="callout gap"><span class="k">La brecha que corrige</span><p>${k.brecha}</p></div>
      <h2>Para qué sirve</h2>
      ${orientacion(k)}
      <div class="callout"><span class="k">Estado</span><p>Esta clave tendrá los mismos ocho pasos que las claves del piloto, con su cuaderno de Colab de control.</p></div>
      <div class="row"><a class="btn primary" href="#clave-${pad2(PILOTO.find(p=>p>n)||PILOTO[0])}">Ir a una clave completa</a></div>
    </div></div>`;
}

/* ---------- MÓDULO ---------- */
const STEPS = [
 ["para","Para qué sirve","Cuándo se usa en el trabajo, un caso real y su equivalente en Tableau."],
 ["entender","Entender","El concepto, explicado sin atajos."],
 ["error","Ver el error","Lo que pasa en muchos tableros frente a la versión correcta."],
 ["practicar","Practicar","Un simulador con los datos de Distribuidora Andina."],
 ["pbi","Hacerlo en Power BI y Tableau","Pasos con los menús de Power BI Desktop en español y la versión en Tableau Public."],
 ["colab","Verificar en Colab","Cifras de control y gráficos para comprobar tu trabajo, sin programar."],
 ["ia","Apoyarse en IA","Instrucciones listas para copiar, y cómo verificar lo que responde."],
 ["quiz","Autoevaluación","Preguntas con explicación; 3 de 4 correctas completan la clave."],
];
function viewModulo(n){
  const k = CLAVES[n-1], m = MOD[n], sec = id => `<section class="step" id="s-${id}"><div class="sh"><span class="n">${STEPS.findIndex(s=>s[0]===id)+1}</span><h2>${STEPS.find(s=>s[0]===id)[1]}</h2></div>`;
  app.innerHTML = `<div class="wrap">
    <div class="mhead">
      <a href="#ruta" class="muted small">← Ruta de 8 claves</a>
      <span class="eyebrow">Clave ${n} de 8 · ${TRAMOS[k.tramo].t} · ${k.nivel} · ${m.minutos} min</span>
      <h1>${k.t}</h1><p class="muted" style="font-size:1.1rem">${k.s}</p>
      <p class="small"><span class="tag">PL-300 · ${k.pl}</span></p>
      <div class="objs">${m.objetivos.map(o=>`<div>${o}</div>`).join("")}</div>
      ${docenteBox(m.docente)}
    </div>
    <div class="mlayout">
      <nav class="toc" aria-label="Pasos del módulo">${STEPS.map((s,i)=>`<a href="#clave-${pad2(n)}" data-go="${s[0]}"><span>${i+1}</span>${s[1]}</a>`).join("")}</nav>
      <div>
        ${sec("para")}${orientacion(k)}</section>
        ${sec("entender")}<div class="prose">${m.entender}</div></section>
        ${sec("error")}<div class="stack"><div class="callout gap"><span class="k">La brecha</span><p>${k.brecha}</p><p class="muted small">${m.brechaTxt}</p></div>${ERRORES[n]()}</div></section>
        ${sec("practicar")}<div id="sim"></div></section>
        ${sec("pbi")}<div class="stack">
            <h3>En Power BI Desktop</h3>
            <ol class="steps">${m.pbi.map(([t,d])=>`<li><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ol>
            <div class="callout tip"><span class="k">Separadores en DAX</span><p>Las funciones de DAX se escriben en inglés aunque Power BI esté en español. Aquí los argumentos van separados con coma; si tu Power BI espera punto y coma, revisa los separadores de DAX en <b>Archivo › Opciones y configuración › Opciones › Configuración regional</b>.</p></div>
            <h3>La misma idea en Tableau Public</h3>
            <ol class="steps">${m.tableau.map(([t,d])=>`<li><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ol>
            <p class="muted small">Datos: <a href="#modelo">las tablas de Distribuidora Andina</a> · <a href="${GH}/blob/main/data/cifras_de_control.md" target="_blank" rel="noopener">cifras de control</a>.</p>
          </div></section>
        ${sec("colab")}<div class="colab"><div class="stack" style="gap:8px"><span class="eyebrow">Cuaderno ${m.notebook}</span><p>${m.colabQue}</p><p class="muted small">Ábrelo, usa <b>Archivo › Guardar una copia en Drive</b> y luego <b>Entorno de ejecución › Ejecutar todas</b>. El código está oculto. ¿Primera vez en Colab? Haz el <a href="https://omarli-360.github.io/excel-corporativo-12-claves/#colab" target="_blank" rel="noopener">curso rápido de Colab</a>.</p></div>
            <div class="stack" style="gap:8px"><a class="btn primary" href="${colabURL(m.notebook)}" target="_blank" rel="noopener">Abrir en Colab</a></div></div></section>
        ${sec("ia")}<div class="stack">
            <p class="read">Úsalas con Claude, Gemini, ChatGPT o Copilot. Reemplaza lo que está entre corchetes. La regla: <b>la IA propone, tú verificas</b> contra las cifras de control.</p>
            ${promptsHTML(m.ia)}
            <div class="callout warn"><span class="k">Antes de pegar datos</span><p>${m.iaCuidado}</p></div>
          </div></section>
        ${sec("quiz")}<div class="quiz" id="quiz"></div></section>
      </div>
    </div></div>`;
  app.querySelectorAll("[data-go]").forEach(a=>a.onclick=e=>{ e.preventDefault(); $("#s-"+a.dataset.go).scrollIntoView() });
  wireCopy(app);
  SIMS[n]($("#sim"));
  renderQuiz($("#quiz"), m.quiz, (ok, res, retry)=>{
    const need=Math.ceil(m.quiz.length*.75); PROG.quiz[n]=ok; if(ok>=need) PROG.done[n]=true; saveProg();
    res.innerHTML = ok>=need
      ? `<h3>${ok} de ${m.quiz.length}: clave ${n} completada.</h3><p class="muted">Tu progreso se guarda en este navegador.</p><div class="row" style="margin-top:10px">${nextLink(n)}</div>`
      : `<h3>${ok} de ${m.quiz.length}.</h3><p class="muted">Repasa las explicaciones y vuelve a intentarlo.</p><div class="row" style="margin-top:10px"><button class="btn" data-retry>Intentar de nuevo</button></div>`;
    const r=res.querySelector("[data-retry]"); if(r) r.onclick=retry;
  });
}
function nextLink(n){ const i=PILOTO.indexOf(n); const nx=PILOTO[i+1]; return nx?`<a class="btn primary" href="#clave-${pad2(nx)}">Siguiente: clave ${nx}</a>`:`<a class="btn primary" href="#laboratorio">Ir al laboratorio</a>` }

/* ---------- GLOSARIO ---------- */
function viewGlosario(){
  app.innerHTML = `<div class="wrap read"><div class="mhead"><span class="eyebrow">Glosario</span><h1>Power BI, DAX y Tableau en español e inglés</h1>
    <p class="muted">Los tutoriales en internet suelen estar en inglés. Las funciones de DAX se escriben siempre en inglés; los menús de Power BI y Tableau cambian según el idioma.</p>
    <label for="gq" class="eyebrow" style="margin-top:6px">Buscar<input type="search" id="gq" placeholder="CALCULATE, segmentación, dashboard…" style="display:block; width:100%; margin-top:6px"></label></div>
    <div class="scroll" style="padding-bottom:40px"><table class="datatbl" id="gt"></table></div></div>`;
  const draw=q=>{ q=(q||"").toLowerCase(); $("#gt").innerHTML=`<tr><th>Español</th><th>Inglés</th><th>Para qué sirve</th><th>Clave</th></tr>`+
    GLOS.filter(g=>!q||g.join(" ").toLowerCase().includes(q)).map(g=>`<tr><td class="mono"><b>${g[0]}</b></td><td class="mono">${g[1]}</td><td>${g[2]}</td><td><a href="#clave-${pad2(g[3])}">${g[3]}</a></td></tr>`).join("") };
  $("#gq").oninput=e=>draw(e.target.value); draw();
}

/* ---------- enrutador ---------- */
function route(){
  const h = (location.hash||"#inicio").slice(1);
  const navKey = h.startsWith("clave-") ? "ruta" : h.startsWith("taller-") ? "laboratorio" : h;
  document.querySelectorAll("nav.main a").forEach(a=>a.toggleAttribute("aria-current", a.dataset.nav===navKey));
  document.querySelectorAll("nav.main a[aria-current]").forEach(a=>a.setAttribute("aria-current","page"));
  if(h==="ruta") viewRuta();
  else if(h==="perfil") viewPerfil();
  else if(h==="herramientas") viewHerramientas();
  else if(h==="modelo") viewModelo();
  else if(h==="laboratorio") viewLaboratorio();
  else if(h.startsWith("taller-")) viewTaller(+h.slice(7));
  else if(h==="glosario") viewGlosario();
  else if(h.startsWith("clave-")){ const n=+h.slice(6); MOD[n] ? viewModulo(n) : viewProximo(n) }
  else if(h==="diagnostico"){ viewInicio(); setTimeout(()=>$("#diagnostico").scrollIntoView(),0); return }
  else viewInicio();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", route);
$("#modoDocente").onclick = ()=> setInstructor(!document.body.classList.contains("instructor"));
setInstructor(store.get("pbt-docente", false));
paintMeter(); route();
