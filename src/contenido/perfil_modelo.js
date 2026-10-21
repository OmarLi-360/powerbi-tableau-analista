/* ======================================================================
   CONTENIDO · El perfil (contexto laboral) y Los datos (modelo de Andina)
   ====================================================================== */

/* ---------- EL PERFIL ---------- */
const RUTA_PERFIL = [
  {t:"Excel Corporativo · 12 Claves", d:"Datos ordenados, fórmulas confiables, tablas dinámicas, Power Query y auditoría.", url:"https://omarli-360.github.io/excel-corporativo-12-claves/", hecho:true},
  {t:"Colab", d:"Visualizar y verificar con Python sin programar desde cero.", url:"https://omarli-360.github.io/excel-corporativo-12-claves/#colab", hecho:true},
  {t:"Power BI + Tableau", d:"Modelo, medidas DAX, informes y portafolio público.", actual:true},
  {t:"SQL (próximo curso)", d:"Consultar bases de datos: la habilidad que más filtra hojas de vida.", futuro:true},
];
const PL300 = [
  ["Preparar los datos","25–30 %","Obtener, perfilar, limpiar, transformar y cargar.","1 y 2"],
  ["Modelar los datos","25–30 %","Relaciones, tabla de fechas, medidas DAX, inteligencia de tiempo.","3, 4 y 5"],
  ["Visualizar y analizar","25–30 %","Informes, interactividad, narrativa, patrones.","6 y 7"],
  ["Administrar y proteger","15–20 %","Áreas de trabajo, distribución, actualización, seguridad por filas.","8"],
];

function viewPerfil(){
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">El perfil</span><h1>Analista de datos junior: qué piden y cómo lo demuestras</h1>
      <p class="muted read" style="font-size:1.1rem">Este curso es la tercera etapa de una línea de formación para el perfil de analista de datos. Aquí aprendes la herramienta que más piden las empresas en Colombia (Power BI) y construyes una prueba pública de lo que sabes hacer (Tableau Public).</p></div>

    <section class="block" style="border-top:0; padding-top:0"><div class="sechead"><h2>La línea de formación</h2></div>
      <div class="path" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${RUTA_PERFIL.map((r,i)=>`<${r.url?"a":"div"} ${r.url?`href="${r.url}" target="_blank" rel="noopener"`:""} style="${r.actual?"border-color:var(--brand-ink); box-shadow:var(--shadow)":""}${r.futuro?"opacity:.7":""}"><span class="n">${i+1}${r.actual?" · Estás aquí":r.hecho?" · Curso disponible":" · Próximamente"}</span><b>${r.t}</b><span>${r.d}</span></${r.url?"a":"div"}>`).join("")}</div></section>

    <section class="block"><div class="sechead"><h2>Qué piden las vacantes</h2><p class="muted read">Resumen de lo que se repite en las ofertas de analista de datos junior en Colombia. Los requisitos cambian entre empresas: úsalo como guía, no como lista cerrada.</p></div>
      <div class="scroll"><table class="datatbl"><tr><th>Habilidad</th><th>Qué tan frecuente</th><th>Dónde la aprendes</th></tr>
        <tr><td><b>SQL</b></td><td>Casi siempre. Sin SQL muchas empresas descartan la hoja de vida.</td><td>Próximo curso de la línea.</td></tr>
        <tr><td><b>Power BI</b></td><td>Muy frecuente, sobre todo en empresas que usan Microsoft 365.</td><td>Este curso (claves 1 a 8).</td></tr>
        <tr><td><b>Excel avanzado</b></td><td>Sigue presente en banca, operaciones, finanzas y comercio.</td><td>Excel Corporativo · 12 Claves.</td></tr>
        <tr><td><b>Tableau / Looker</b></td><td>Aparecen en algunos equipos de BI.</td><td>Este curso (portafolio en Tableau Public).</td></tr>
        <tr><td><b>Python</b></td><td>No siempre obligatorio para junior; suma puntos.</td><td>Los cuadernos de Colab de ambos cursos.</td></tr>
        <tr><td><b>Comunicar resultados</b></td><td>En casi todas: «presentar hallazgos a la gerencia».</td><td>Claves 6 y 7, y el Taller P3.</td></tr></table></div>
      <div class="grid2" style="margin-top:14px">
        <div class="callout tip"><span class="k">Cómo sacarle provecho</span><p><b>Power BI</b> te da la habilidad que filtran las vacantes. <b>Tableau Public</b> te da el enlace que pones en la hoja de vida, porque con la cuenta gratuita de Power BI no puedes publicar en abierto. Las cifras de control te dan algo que pocos candidatos pueden decir: «mis medidas están verificadas».</p></div>
        <div class="callout"><span class="k">Certificación de referencia</span><p>El examen <b>PL-300 · Microsoft Power BI Data Analyst</b> define qué debe saber un analista de Power BI. Cada clave dice qué parte cubre. El curso no reemplaza la preparación del examen, pero te deja en el camino.</p></div></div>
    </section>

    <section class="block"><div class="sechead"><h2>Las 8 claves y la PL-300</h2></div>
      <div class="scroll"><table class="datatbl"><tr><th>Área del examen</th><th>Peso</th><th>Qué incluye</th><th>Claves</th></tr>
        ${PL300.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</table></div>
      <p class="muted small" style="margin-top:8px">El examen también incluye funciones de Copilot y de capacidades de pago. El curso las menciona, pero se concentra en lo que puedes practicar gratis.</p></section>

    <section class="block" style="padding-bottom:40px"><div class="sechead"><h2>Power BI y Tableau: lo mismo con otro nombre</h2></div>
      <div class="scroll"><table class="datatbl"><tr><th>Concepto</th><th>Power BI Desktop</th><th>Tableau Public</th></tr>
        <tr><td>Preparar datos</td><td>Power Query</td><td>Origen de datos (y Tableau Prep, aparte)</td></tr>
        <tr><td>Relacionar tablas</td><td>Vista de modelo: relaciones con cardinalidad y dirección</td><td>Relaciones en el lienzo del origen de datos</td></tr>
        <tr><td>Cálculos</td><td>Medidas y columnas en DAX</td><td>Campos calculados, cálculos de tabla y LOD</td></tr>
        <tr><td>Un gráfico</td><td>Visual en una página</td><td>Hoja</td></tr>
        <tr><td>Una página de informe</td><td>Página</td><td>Dashboard</td></tr>
        <tr><td>Filtro visible</td><td>Segmentación de datos</td><td>Filtro mostrado</td></tr>
        <tr><td>Narrativa</td><td>Marcadores</td><td>Historia (story)</td></tr>
        <tr><td>Compartir</td><td>Servicio de Power BI (licencia)</td><td>Perfil público en Tableau Public</td></tr></table></div>
      <div class="row" style="margin-top:14px"><a class="btn primary" href="#ruta">Ver las 8 claves</a><a class="btn" href="#laboratorio">Ir al laboratorio</a></div>
    </section></div>`;
}

/* ---------- LOS DATOS ---------- */
const TABLAS_MODELO = [
  {n:"Ventas", tipo:"Hechos", llave:"id_linea", filas:()=>X.filas.ventas, d:"Una fila por línea de factura: fecha, cliente, vendedor, sede, canal, producto, cantidad, subtotal (venta neta sin IVA), margen y estado (Pagada, Pendiente, Anulada).", rel:"id_cliente, sku, id_vendedor, id_sede, fecha"},
  {n:"Metas", tipo:"Hechos", llave:"id_sede + anio + mes", filas:()=>X.filas.metas, d:"Meta mensual de venta neta por sede. Otro nivel de detalle: mes, no día.", rel:"id_sede, fecha_mes (se crea)"},
  {n:"Clientes", tipo:"Dimensión", llave:"id_cliente", filas:()=>X.filas.clientes, d:"Razón social, segmento (Pyme, Corporativo, Gobierno, Educación), ciudad y días de crédito.", rel:"—"},
  {n:"Productos", tipo:"Dimensión", llave:"sku", filas:()=>X.filas.productos, d:"Producto, categoría, subcategoría, precios y costos de lista.", rel:"—"},
  {n:"Vendedores", tipo:"Dimensión", llave:"id_vendedor", filas:()=>X.filas.vendedores, d:"Nombre, sede, fechas de ingreso y retiro, estado.", rel:"—"},
  {n:"Sedes", tipo:"Dimensión", llave:"id_sede", filas:()=>X.filas.sedes, d:"Ciudad, departamento, región y fecha de apertura.", rel:"—"},
  {n:"Calendario", tipo:"Dimensión", llave:"Date", filas:()=>1096, d:"Se crea en Power BI con DAX: una fila por día de 2024 a 2026, con año y mes.", rel:"—"},
];

function estrellaSVG(){
  const pos = {Ventas:[330,150], Metas:[330,290], Clientes:[110,50], Productos:[550,50], Vendedores:[110,150], Sedes:[110,290], Calendario:[550,290]};
  const rel = [["Ventas","Clientes"],["Ventas","Productos"],["Ventas","Vendedores"],["Ventas","Sedes"],["Ventas","Calendario"],["Metas","Sedes"],["Metas","Calendario"]];
  const ln = rel.map(([a,b])=>{ const [x1,y1]=pos[a],[x2,y2]=pos[b]; const mx=(x1+x2)/2, my=(y1+y2)/2;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--s1)" stroke-width="2"/><text x="${x1+(x2-x1)*.22}" y="${y1+(y2-y1)*.22-5}" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--s3)">*</text><text x="${x1+(x2-x1)*.8}" y="${y1+(y2-y1)*.8-5}" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--s3)">1</text>` }).join("");
  const nodo = n=>{ const [x,y]=pos[n], h = n==="Ventas"||n==="Metas", t = TABLAS_MODELO.find(t=>t.n===n);
    return `<rect x="${x-70}" y="${y-22}" width="140" height="44" rx="10" fill="${h?"var(--brand)":"var(--surface)"}" stroke="var(--line)"/><text x="${x}" y="${y-2}" text-anchor="middle" style="font-size:13px;font-weight:600;fill:${h?"var(--on-brand)":"var(--ink)"}">${n}</text><text x="${x}" y="${y+14}" text-anchor="middle" style="font-size:10.5px;fill:${h?"var(--cyan)":"var(--muted)"}">${nf.format(t.filas())} filas</text>` };
  return `<svg viewBox="0 0 660 340" width="100%" style="min-width:520px" role="img" aria-label="Modelo estrella de Distribuidora Andina">${ln}${Object.keys(pos).map(nodo).join("")}</svg>`;
}

function viewModelo(){
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">Los datos</span><h1>Distribuidora Andina S.A.S., ahora como modelo</h1>
      <p class="muted read" style="font-size:1.1rem">Es la misma empresa ficticia del curso de Excel: distribuye suministros de oficina y tecnología desde seis sedes. En Excel unías todo en una tabla; en Power BI las tablas quedan separadas y se relacionan en un <b>modelo estrella</b>.</p></div>
    <section class="block" style="border-top:0; padding-top:0"><div class="sechead"><h2>El modelo estrella</h2><p class="muted read">Al centro, las tablas de hechos (lo que pasó). Alrededor, las dimensiones (quién, qué, dónde, cuándo). Cada línea es una relación varios a uno: <b>*</b> del lado de los hechos, <b>1</b> del lado de la dimensión.</p></div>
      <div class="panel scroll">${estrellaSVG()}</div></section>
    <section class="block"><div class="sechead"><h2>Las tablas</h2></div>
      <div class="scroll"><table class="datatbl"><tr><th>Tabla</th><th>Tipo</th><th>Filas</th><th>Llave</th><th>Qué contiene</th><th>Se relaciona por</th></tr>
        ${TABLAS_MODELO.map(t=>`<tr><td><b>${t.n}</b></td><td>${t.tipo}</td><td class="num">${nf.format(t.filas())}</td><td class="mono">${t.llave}</td><td>${t.d}</td><td class="mono small">${t.rel}</td></tr>`).join("")}</table></div>
      <div class="row" style="margin-top:14px">${["ventas","clientes","productos","vendedores","sedes","metas"].map(f=>`<a class="btn small" href="${CSV(f+".csv")}">${f}.csv</a>`).join("")}<a class="btn small" href="${GH}/blob/main/data/cifras_de_control.md" target="_blank" rel="noopener">Cifras de control</a></div></section>
    <section class="block" style="padding-bottom:40px"><div class="sechead"><h2>Las cifras de control</h2><p class="muted read">Son los valores que deben dar tus medidas. Si tu tarjeta muestra otra cifra, el problema está en el modelo o en la medida, no en el visual.</p></div>
      <div class="scroll"><table class="datatbl"><tr><th>Filtro</th><th>Venta neta</th><th>Meta</th><th>Cumplimiento</th><th>Facturas</th><th>Ticket promedio</th><th>Margen %</th></tr>
        ${Object.entries(X.control).map(([k,d])=>`<tr><td><b>${k}</b></td><td class="num">${nf.format(d["Venta neta"])}</td><td class="num">${nf.format(d["Meta"])}</td><td class="num">${pct1(d["Cumplimiento"])}</td><td class="num">${nf.format(d["Facturas"])}</td><td class="num">${nf.format(Math.round(d["Ticket promedio"]))}</td><td class="num">${pct1(d["Margen %"])}</td></tr>`).join("")}</table></div>
      <p class="muted small" style="margin-top:8px">Todas excluyen las facturas anuladas. Las cifras por sede están en el archivo de cifras de control y en el cuaderno 04.</p></section>
  </div>`;
}
