/* ======================================================================
   CONTENIDO · Herramientas: fichas de Power BI Desktop y Tableau Public
   Cada ficha tiene una maqueta de la pantalla con sus partes numeradas,
   unidas por una línea a su explicación (misma lógica del curso de Colab).
   ====================================================================== */

/* Motor genérico de anatomía. cfg = {id, W, H, LX, fondo, partes:[{t,d,zona:[x,y,w,h,r?], linea:[[x,y],...], ly}]} */
function anatomia(cfg){
  const {W, H, LX} = cfg;
  const t=(x,y,s,o={})=>`<text x="${x}" y="${y}" ${o.a?`text-anchor="${o.a}"`:""} style="font-size:${o.z||12}px;${o.b?"font-weight:600;":""}${o.mono?"font-family:var(--f-mono);":""}fill:${o.f||"var(--ink)"}">${esc(s)}</text>`;
  const num=(x,y,n)=>`<g class="cp-num" data-p="${n}"><circle cx="${x}" cy="${y}" r="10"/>${t(x,y+4,String(n),{a:"middle",z:11,b:true,f:"#fff"})}</g>`;
  let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="var(--surface)" stroke="var(--line)"/>` + cfg.fondo(t);
  cfg.partes.forEach((p,i)=>{ const n=i+1, pts=[...p.linea, [LX-12, p.ly]];
    s += `<polyline class="cp-line" data-p="${n}" points="${pts.map(q=>q.join(",")).join(" ")}"/><circle class="cp-dot" data-p="${n}" cx="${pts[0][0]}" cy="${pts[0][1]}" r="3.5"/>` });
  cfg.partes.forEach((p,i)=>{ const [x,y,w,h,r] = p.zona; s += `<rect class="cp-zone" data-p="${i+1}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r??6}"/>` + num(Math.max(x,12), Math.max(y,12), i+1) });
  cfg.partes.forEach((p,i)=>{ const y=p.ly;
    s += `<g class="cp-item" data-p="${i+1}" tabindex="0" role="button" aria-label="${esc(p.t+": "+p.d)}">
      <rect x="${LX-6}" y="${y-17}" width="${W-LX-2}" height="36" rx="8" class="cp-hit"/>
      ${num(LX+8,y,i+1)}${t(LX+24,y-2,p.t,{b:true,z:12})}${t(LX+24,y+13,p.d,{z:10,f:"var(--muted)"})}</g>` });
  return `<svg class="cp-svg" id="${cfg.id}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label)}">${s}</svg>`;
}
function wireAnatomias(root){
  root.querySelectorAll(".cp-svg").forEach(svg=>{
    const on = n => { svg.classList.toggle("cp-focus", !!n); svg.querySelectorAll("[data-p]").forEach(e=>e.classList.toggle("on", e.dataset.p===String(n))) };
    let fijo = null;
    svg.querySelectorAll(".cp-item, .cp-zone").forEach(g=>{
      g.addEventListener("mouseenter", ()=>on(g.dataset.p)); g.addEventListener("mouseleave", ()=>on(fijo));
      g.addEventListener("focus", ()=>on(g.dataset.p)); g.addEventListener("blur", ()=>on(fijo));
      g.addEventListener("click", ()=>{ fijo = fijo===g.dataset.p ? null : g.dataset.p; on(fijo) });
    });
  });
}

/* ---------- Maqueta de Power BI Desktop ---------- */
const PBI_ANAT = {
  id:"anat-pbi", W:1000, H:560, LX:720, label:"Partes de la pantalla de Power BI Desktop",
  fondo: t => {
    const btn=(x,y,w,txt)=>`<rect x="${x}" y="${y}" width="${w}" height="30" rx="5" fill="var(--surface)" stroke="var(--line)"/>`+t(x+w/2,y+19,txt,{a:"middle",z:11});
    const bars=[[64,"Bucaramanga",.9],[88,"Pereira",.82],[112,"Cali",.79],[136,"Medellín",.75],[160,"Bogotá",.73],[184,"Barranquilla",.7]];
    return `<rect x="1" y="1" width="668" height="24" rx="11" fill="var(--surface-2)"/>${t(14,17,"Andina_comite.pbix — Power BI Desktop",{z:11,b:true})}
      ${t(14,42,"Archivo   Inicio   Insertar   Modelado   Vista   Optimizar   Ayuda",{z:11,f:"var(--muted)"})}
      ${btn(60,52,92,"Obtener datos")}${btn(158,52,108,"Transformar datos")}${btn(292,52,92,"Nueva medida")}${btn(574,52,80,"Publicar")}
      <rect x="0" y="120" width="38" height="404" fill="var(--surface-2)"/>
      <rect x="9" y="132" width="20" height="16" rx="3" fill="var(--s1)"/><rect x="9" y="170" width="20" height="16" rx="3" fill="none" stroke="var(--muted)"/><path d="M11,208 h6 v6 h-6z M21,216 h6 v6 h-6z M17,211 L21,219" fill="none" stroke="var(--muted)"/>
      <rect x="48" y="122" width="398" height="370" rx="4" fill="var(--bg)" stroke="var(--line)"/>
      ${[["Venta neta","$ 14.692 M"],["Cumplimiento","95,3 %"],["Ticket","4.035.259"]].map((c,i)=>`<rect x="${58+i*128}" y="132" width="118" height="46" rx="4" fill="var(--surface)" stroke="var(--line)"/>${t(66+i*128,148,c[0],{z:9.5,f:"var(--muted)"})}${t(66+i*128,170,c[1],{z:14,b:true})}`).join("")}
      <rect x="58" y="188" width="246" height="150" rx="4" fill="var(--surface)" stroke="var(--line)"/>${t(66,204,"Cumplimiento por sede",{z:10,b:true})}
      ${bars.map(([dy,n,v])=>`${t(124,186+dy*0.6+22,n,{a:"end",z:8.5})}<rect x="128" y="${180+dy*0.6+15}" width="${v*160}" height="9" rx="2" fill="${v<.78?"var(--s3)":"var(--s0)"}"/>`).join("")}
      <rect x="314" y="188" width="122" height="150" rx="4" fill="var(--surface)" stroke="var(--line)"/>${t(322,204,"Canal",{z:10,b:true})}
      ${["Presencial","Televentas","E-commerce"].map((c,i)=>`<rect x="322" y="${216+i*24}" width="12" height="12" rx="2" fill="${i===0?"var(--s1)":"none"}" stroke="var(--line)"/>${t(340,226+i*24,c,{z:9.5})}`).join("")}
      <rect x="58" y="348" width="378" height="134" rx="4" fill="var(--surface)" stroke="var(--line)"/>${t(66,364,"Venta y meta mensual",{z:10,b:true})}
      <polyline points="72,450 104,430 136,438 168,420 200,446 232,452 264,424 296,428 328,410 360,416 392,396 424,380" fill="none" stroke="var(--s1)" stroke-width="2"/>
      <polyline points="72,440 104,436 136,430 168,428 200,432 232,438 264,430 296,424 328,418 360,412 392,402 424,388" fill="none" stroke="var(--s0)" stroke-width="1.5" stroke-dasharray="4 3"/>
      <rect x="48" y="498" width="74" height="22" rx="4" fill="var(--surface)" stroke="var(--s1)"/>${t(85,513,"Comité",{a:"middle",z:10})}
      <rect x="126" y="498" width="92" height="22" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(172,513,"Detalle sede",{a:"middle",z:10})}${t(232,514,"+",{z:13,f:"var(--muted)"})}
      <rect x="454" y="122" width="44" height="398" rx="4" fill="var(--surface-2)" stroke="var(--line)"/><text x="480" y="300" transform="rotate(-90 480 300)" text-anchor="middle" style="font-size:10px;fill:var(--muted)">Filtros</text>
      <rect x="504" y="122" width="80" height="398" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(544,138,"Visualizaciones",{a:"middle",z:8.5,b:true})}
      ${Array.from({length:24},(_,k)=>`<rect x="${510+(k%4)*18}" y="${148+Math.floor(k/4)*18}" width="14" height="14" rx="2" fill="var(--surface)" stroke="var(--line)"/>`).join("")}
      ${t(544,284,"Valores",{a:"middle",z:8.5,f:"var(--muted)"})}<rect x="512" y="290" width="64" height="16" rx="3" fill="var(--surface)" stroke="var(--line)"/>${t(516,302,"Cumplimiento",{z:8})}
      <rect x="590" y="122" width="78" height="398" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(629,138,"Datos",{a:"middle",z:9,b:true})}
      ${["▸ _Medidas","   ▦ Venta neta","   ▦ Cumplimiento","▸ Calendario","▸ Clientes","▸ Metas","▸ Productos","▸ Sedes","▸ Ventas","▸ Vendedores"].map((x,i)=>t(596,160+i*18,x,{z:8.5,f:i<3?"var(--ink)":"var(--muted)"})).join("")}`;
  },
  partes:[
    {t:"Obtener y transformar datos", d:"Conectar archivos y abrir Power Query", zona:[56,48,214,38], linea:[[163,86],[163,100],[676,100]], ly:40},
    {t:"Nueva medida", d:"Escribir un cálculo en DAX", zona:[288,48,100,38], linea:[[338,86],[338,94],[676,94]], ly:88},
    {t:"Publicar", d:"Subir al servicio de Power BI", zona:[570,48,88,38], linea:[[658,67],[676,67]], ly:136},
    {t:"Vistas", d:"Informe, tabla de datos y modelo", zona:[4,126,30,104], linea:[[19,230],[19,548],[676,548]], ly:184},
    {t:"Lienzo de la página", d:"Donde se arman los visuales", zona:[46,120,402,374], linea:[[380,494],[380,532],[676,532]], ly:232},
    {t:"Panel Filtros", d:"Filtros del visual, la página o el informe", zona:[452,120,48,402], linea:[[476,120],[476,106],[676,106]], ly:280},
    {t:"Visualizaciones", d:"Elegir el visual, sus campos y su formato", zona:[502,120,84,402], linea:[[544,120],[544,112],[676,112]], ly:328},
    {t:"Panel Datos", d:"Tablas, columnas y medidas del modelo", zona:[588,120,82,402], linea:[[670,330],[676,330]], ly:376},
    {t:"Páginas del informe", d:"Una pestaña por página, + para agregar", zona:[44,494,206,30], linea:[[150,524],[150,540],[676,540]], ly:424},
  ],
};

/* ---------- Maqueta de Tableau Public ---------- */
const TAB_ANAT = {
  id:"anat-tab", W:1000, H:540, LX:720, label:"Partes de la pantalla de Tableau Public",
  fondo: t => {
    const pill=(x,y,txt,c)=>`<rect x="${x}" y="${y}" width="${txt.length*6.2+16}" height="18" rx="9" fill="${c}"/>`+t(x+8,y+13,txt,{z:9.5,f:"#fff"});
    const bars=[["Bucaramanga",.92],["Pereira",.84],["Cali",.81],["Medellín",.77],["Bogotá",.75],["Barranquilla",.72]];
    return `<rect x="1" y="1" width="668" height="24" rx="11" fill="var(--surface-2)"/>${t(14,17,"Tableau Public — Andina_portafolio",{z:11,b:true})}
      ${t(14,42,"Archivo   Datos   Hoja de trabajo   Dashboard   Historia   Análisis   Mapa   Formato",{z:11,f:"var(--muted)"})}
      <rect x="0" y="54" width="670" height="26" fill="var(--surface-2)"/>${Array.from({length:9},(_,k)=>`<rect x="${12+k*24}" y="59" width="16" height="16" rx="3" fill="var(--surface)" stroke="var(--line)"/>`).join("")}
      <rect x="0" y="86" width="150" height="406" fill="var(--surface-2)" stroke="var(--line)"/>${t(10,104,"Datos",{z:10,b:true})}${t(10,122,"ventas (Andina)",{z:9,f:"var(--s1)"})}
      ${["Abc  canal","Abc  ciudad","Abc  estado","📅  fecha","Abc  segmento"].map((x,i)=>t(14,142+i*17,x,{z:9,f:"var(--s2)"})).join("")}
      ${t(10,236,"——————————",{z:8,f:"var(--line)"})}${["#  cantidad","#  subtotal","#  Venta neta","#  Cumplimiento"].map((x,i)=>t(14,254+i*17,x,{z:9,f:"var(--s3)"})).join("")}
      <rect x="160" y="86" width="100" height="120" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(168,102,"Filtros",{z:10,b:true})}${pill(168,112,"Año: 2025","var(--s2)")}
      <rect x="160" y="214" width="100" height="200" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(168,230,"Marcas",{z:10,b:true})}
      <rect x="168" y="238" width="84" height="18" rx="3" fill="var(--surface)" stroke="var(--line)"/>${t(174,251,"▾ Barra",{z:9})}
      ${["Color","Tamaño","Texto","Detalle","Descripción"].map((x,i)=>`<rect x="${168+(i%3)*28}" y="${264+Math.floor(i/3)*34}" width="24" height="24" rx="3" fill="var(--surface)" stroke="var(--line)"/>`).join("")}
      ${t(168,342,"Color · Tamaño · Texto",{z:8,f:"var(--muted)"})}${t(168,354,"Detalle · Descripción",{z:8,f:"var(--muted)"})}${pill(168,366,"Cumpl. < 1","var(--s3)")}
      ${t(272,102,"Columnas",{z:10,b:true})}<rect x="330" y="90" width="330" height="20" rx="3" fill="var(--surface-2)"/>${pill(336,91,"Cumplimiento","var(--s3)")}
      ${t(272,128,"Filas",{z:10,b:true})}<rect x="330" y="116" width="330" height="20" rx="3" fill="var(--surface-2)"/>${pill(336,117,"ciudad","var(--s2)")}
      <rect x="270" y="146" width="390" height="324" rx="4" fill="var(--bg)" stroke="var(--line)"/>${t(282,166,"Cumplimiento 2025 por sede",{z:11,b:true})}
      ${bars.map(([n,v],i)=>`${t(362,194+i*42,n,{a:"end",z:9.5})}<rect x="368" y="${182+i*42}" width="${v*270}" height="18" rx="2" fill="${v<.8?"var(--s3)":"var(--s0)"}"/>`).join("")}
      <rect x="0" y="498" width="96" height="22" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(48,513,"Origen de datos",{a:"middle",z:9.5})}
      <rect x="100" y="498" width="70" height="22" rx="4" fill="var(--surface)" stroke="var(--s1)"/>${t(135,513,"Hoja 1",{a:"middle",z:9.5})}
      <rect x="174" y="498" width="86" height="22" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(217,513,"Dashboard 1",{a:"middle",z:9.5})}
      <rect x="264" y="498" width="74" height="22" rx="4" fill="var(--surface-2)" stroke="var(--line)"/>${t(301,513,"Historia 1",{a:"middle",z:9.5})}
      ${t(352,514,"＋  ⊞  ▤",{z:12,f:"var(--muted)"})}`;
  },
  partes:[
    {t:"Guardar en Tableau Public", d:"Archivo › publicar en tu perfil", zona:[8,30,48,18], linea:[[56,39],[676,39]], ly:40},
    {t:"Panel Datos", d:"Dimensiones (azul) y medidas (verde)", zona:[0,86,150,406,4], linea:[[150,180],[156,180],[156,82],[676,82]], ly:88},
    {t:"Columnas y Filas", d:"Arrastra campos: definen el gráfico", zona:[268,88,396,50], linea:[[664,113],[676,113]], ly:136},
    {t:"Filtros", d:"Qué datos entran en la hoja", zona:[158,86,104,122], linea:[[210,86],[210,76],[676,76]], ly:184},
    {t:"Tarjeta Marcas", d:"Tipo de gráfico, color, texto y tooltip", zona:[158,212,104,204], linea:[[210,416],[210,482],[676,482]], ly:232},
    {t:"La vista", d:"El gráfico que se construye", zona:[268,144,394,328], linea:[[662,300],[676,300]], ly:280},
    {t:"Hojas, dashboards e historias", d:"Una hoja por pregunta; el dashboard las junta", zona:[98,494,242,30], linea:[[340,509],[400,509],[400,524],[676,524]], ly:328},
    {t:"Origen de datos", d:"Conectar y relacionar tablas", zona:[-2,494,100,30], linea:[[48,524],[48,536],[676,536]], ly:376},
  ],
};

function viewHerramientas(){
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">Las herramientas · Fichas</span><h1>Power BI Desktop y Tableau Public, pantalla por pantalla</h1>
      <p class="muted read" style="font-size:1.1rem">Antes de la primera clave, conoce dónde está cada cosa. Pasa el mouse o toca una explicación para resaltar su parte en la pantalla. Las dos herramientas hacen lo mismo con otros nombres: preparar, relacionar, calcular, visualizar y publicar.</p>
      <div class="row" style="margin-top:12px"><a class="btn primary" href="#pbi-ficha" data-go="pbi-ficha">Power BI Desktop</a><a class="btn" href="#tab-ficha" data-go="tab-ficha">Tableau Public</a><a class="btn" href="#taller-0">Instalar (Taller P0)</a></div></div>
    ${docenteBox({duracion:[["Power BI: recorrido",10,"Proyecta la ficha y abre Power BI al lado; señala cada parte."],["Tableau: recorrido",8,"Igual con Tableau Public."],["Comparar",5,"Tabla de equivalencias: mismo concepto, otro nombre."]],
      preguntas:["¿Dónde se escribe una medida en Power BI y dónde un campo calculado en Tableau?","¿Qué es en Tableau lo que en Power BI es una página?"],
      errores:["Buscar Power Query como programa aparte: se abre con Transformar datos.","Confundir el lienzo con el panel de Visualizaciones."],cierre:"Si saben dónde está cada parte, las claves se dedican al concepto y no a buscar botones."})}

    <section class="block" id="pbi-ficha" style="border-top:0; padding-top:0"><div class="sechead"><span class="eyebrow">Ficha 1</span><h2>Power BI Desktop</h2>
      <p class="muted read">Programa gratuito de Microsoft para Windows. Es donde se construye el modelo y el informe; luego se publica en el servicio de Power BI (en el navegador) para compartirlo en la empresa.</p></div>
      <div class="grid3" style="margin-bottom:14px">
        <div class="panel"><span class="eyebrow">Para qué</span><p class="small" style="margin:6px 0 0">Tableros de negocio conectados a datos que se actualizan: ventas, finanzas, operación.</p></div>
        <div class="panel"><span class="eyebrow">Cuánto cuesta</span><p class="small" style="margin:6px 0 0">Desktop es gratis. Compartir en la empresa requiere licencia Pro o capacidad de la organización.</p></div>
        <div class="panel"><span class="eyebrow">Dónde corre</span><p class="small" style="margin:6px 0 0">Windows 10 u 11 (Microsoft Store). En Mac, con una máquina virtual o con el plan B en Tableau.</p></div></div>
      <div class="panel scroll">${anatomia(PBI_ANAT)}</div>
      <p class="muted small" style="margin-top:8px">Maqueta simplificada, no es una captura: la ubicación exacta de algunos botones cambia con las actualizaciones mensuales de Power BI.</p>
      <div class="scroll" style="margin-top:14px"><table class="datatbl"><tr><th>Pieza</th><th>Qué es</th><th>Dónde se usa en el curso</th></tr>
        <tr><td><b>Power Query</b></td><td>El editor para conectar y limpiar datos (el mismo de Excel). Se abre con Transformar datos.</td><td>Claves 1 y 2</td></tr>
        <tr><td><b>Vista de modelo</b></td><td>Donde se relacionan las tablas en estrella.</td><td>Clave 3</td></tr>
        <tr><td><b>DAX</b></td><td>El lenguaje de las medidas: CALCULATE, DIVIDE, TOTALYTD…</td><td>Claves 4 y 5</td></tr>
        <tr><td><b>Vista de informe</b></td><td>Lienzo, visuales, filtros, segmentaciones, marcadores.</td><td>Claves 6 y 7</td></tr>
        <tr><td><b>Servicio de Power BI</b></td><td>app.powerbi.com: áreas de trabajo, actualización programada, roles.</td><td>Clave 8</td></tr></table></div>
    </section>

    <section class="block" id="tab-ficha"><div class="sechead"><span class="eyebrow">Ficha 2</span><h2>Tableau Public</h2>
      <p class="muted read">Versión gratuita de Tableau (Salesforce) para Windows y Mac. Todo lo que guardas se publica en tu perfil de public.tableau.com: es la vitrina de tu portafolio.</p></div>
      <div class="grid3" style="margin-bottom:14px">
        <div class="panel"><span class="eyebrow">Para qué</span><p class="small" style="margin:6px 0 0">Visualizaciones y dashboards públicos con un enlace para la hoja de vida y LinkedIn.</p></div>
        <div class="panel"><span class="eyebrow">Cuánto cuesta</span><p class="small" style="margin:6px 0 0">Gratis, para uso no comercial. Lo publicado es visible para cualquiera.</p></div>
        <div class="panel"><span class="eyebrow">Con qué datos</span><p class="small" style="margin:6px 0 0">Solo ficticios o públicos. Nunca datos de clientes o de una empresa.</p></div></div>
      <div class="panel scroll">${anatomia(TAB_ANAT)}</div>
      <p class="muted small" style="margin-top:8px">Maqueta simplificada. En Tableau los campos azules son <b>dimensiones</b> (para agrupar) y los verdes, <b>medidas</b> (para calcular).</p>
      <div class="callout tip" style="margin-top:14px"><span class="k">El flujo en Tableau</span><p><b>Origen de datos</b> (conectar y relacionar) → <b>Hoja</b> (una pregunta, un gráfico) → <b>Dashboard</b> (las hojas juntas, con filtros) → <b>Historia</b> (el hallazgo en pasos) → <b>Guardar en Tableau Public</b>.</p></div>
    </section>

    <section class="block" style="padding-bottom:40px"><div class="sechead"><h2>Mismo concepto, otro nombre</h2></div>
      <div class="scroll"><table class="datatbl"><tr><th>Concepto</th><th>Power BI Desktop</th><th>Tableau Public</th></tr>
        <tr><td>Conectar y preparar</td><td>Obtener datos › Power Query</td><td>Origen de datos</td></tr>
        <tr><td>Relacionar tablas</td><td>Vista de modelo</td><td>Relaciones en el lienzo del origen</td></tr>
        <tr><td>Calcular</td><td>Medida (DAX)</td><td>Campo calculado</td></tr>
        <tr><td>Elegir el gráfico</td><td>Panel Visualizaciones</td><td>Tarjeta Marcas y Columnas/Filas</td></tr>
        <tr><td>Un gráfico</td><td>Visual</td><td>Hoja</td></tr>
        <tr><td>Una página</td><td>Página del informe</td><td>Dashboard</td></tr>
        <tr><td>Filtrar</td><td>Panel Filtros y segmentaciones</td><td>Estante Filtros</td></tr>
        <tr><td>Contar una historia</td><td>Marcadores</td><td>Historia</td></tr>
        <tr><td>Compartir</td><td>Publicar en el servicio (licencia)</td><td>Guardar en Tableau Public (público)</td></tr></table></div>
      <div class="row" style="margin-top:14px"><a class="btn primary" href="#taller-0">Instalar las dos (Taller P0)</a><a class="btn" href="#ruta">Ir a las claves</a></div>
    </section></div>`;
  app.querySelectorAll("[data-go]").forEach(a=>a.onclick=e=>{ e.preventDefault(); $("#"+a.dataset.go).scrollIntoView() });
  wireAnatomias(app);
}
