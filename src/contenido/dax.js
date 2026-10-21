/* ======================================================================
   CONTENIDO · Tutorial de DAX (#dax)
   Siete lecciones con ejemplos que se calculan en vivo con los datos de
   Distribuidora Andina, un constructor de medidas y un recetario con
   cifras de control.
   ====================================================================== */

/* ---------- motor: evalúa medidas simples sobre las columnas compactas ---------- */
const DAXF = {   // filtros de CALCULATE disponibles
  ninguno:{d:"", f:()=>true},
  noanul:{d:'Ventas[estado] <> "Anulada"', f:i=>C.estado[i]!==2},
  ecom:{d:'Ventas[canal] = "E-commerce"', f:i=>C.canal[i]===2},
  gob:{d:'Clientes[segmento] = "Gobierno"', f:i=>DM.segmento[C.segmento[i]]==="Gobierno"},
};
const DAXCOL = {subtotal:"subtotal", cantidad:"cantidad", margen_bruto:"margen", id_factura:"factura", id_cliente:"cliente", id_vendedor:"vendedor"};
const DAXFILAS = {ninguna:{n:"(sin filas)", t:null}, ciudad:{n:"Sedes[ciudad]", t:"Sedes"}, canal:{n:"Ventas[canal]", t:"Ventas[canal]"}, segmento:{n:"Clientes[segmento]", t:"Clientes"}};
function daxEval({fn, col, filtro, anio, filaDim, filaVal, quitarFila, quitarAnio}){
  const yi = anio==="Todos" ? null : anioIdx(+anio), f = DAXF[filtro].f, c = C[DAXCOL[col]]||null;
  let sum=0, n=0, mn=Infinity, mx=-Infinity; const set = new Set();
  for(let i=0;i<NL;i++){
    if(!quitarAnio && yi!==null && C.anio[i]!==yi) continue;
    if(!quitarFila && filaDim && filaVal!==null && C[filaDim][i]!==filaVal) continue;
    if(!f(i)) continue;
    n++; if(fn==="COUNTROWS") continue;
    const v = c[i];
    if(fn==="DISTINCTCOUNT") set.add(v); else { sum+=v; if(v<mn) mn=v; if(v>mx) mx=v }
  }
  return fn==="SUM"?sum : fn==="AVERAGE"?(n?sum/n:null) : fn==="MIN"?(n?mn:null) : fn==="MAX"?(n?mx:null) : fn==="COUNTROWS"?n : set.size;
}
const fmtN = (v, dec=0) => v===null||v===undefined ? "(vacío)" : nf.format(dec? Math.round(v*10)/10 : Math.round(v));

/* ---------- recetario: medidas del tablero comercial con su valor 2025 ---------- */
function recetario(){
  const y=anioIdx(2025), y0=anioIdx(2024);
  let vn=0, vb=0, lin=0, mg=0, costo=0, ecom=0, vaa=0, cant=0; const fac=new Set(), cli=new Set();
  for(let i=0;i<NL;i++){ if(C.anio[i]===y0 && C.estado[i]!==2) vaa+=C.subtotal[i]; if(C.anio[i]!==y) continue;
    vb+=C.subtotal[i]; lin++; cant+=C.cantidad[i]; if(C.estado[i]===2) continue;
    vn+=C.subtotal[i]; mg+=C.margen[i]; costo+=C.subtotal[i]-C.margen[i]; fac.add(C.factura[i]); cli.add(C.cliente[i]); if(C.canal[i]===2) ecom+=C.subtotal[i] }
  const meta = metaDe(2025);
  return [
    ["Venta neta", 'CALCULATE(SUM(Ventas[subtotal]), Ventas[estado] <> "Anulada")', "La base de todo: subtotal sin IVA y sin anuladas.", nf.format(vn)],
    ["Venta con anuladas", "SUM(Ventas[subtotal])", "Solo para comparar: muestra cuánto inflan las anuladas.", nf.format(vb)],
    ["Líneas", "COUNTROWS(Ventas)", "Cuenta filas de la tabla en el contexto.", nf.format(lin)],
    ["Facturas", 'CALCULATE(DISTINCTCOUNT(Ventas[id_factura]), Ventas[estado] <> "Anulada")', "Valores distintos: una factura tiene varias líneas.", nf.format(fac.size)],
    ["Clientes activos", 'CALCULATE(DISTINCTCOUNT(Ventas[id_cliente]), Ventas[estado] <> "Anulada")', "Clientes que compraron en el periodo.", nf.format(cli.size)],
    ["Ticket promedio", "DIVIDE([Venta neta], [Facturas])", "Una medida que usa otras medidas.", nf.format(Math.round(vn/fac.size))],
    ["Unidades por línea", "AVERAGE(Ventas[cantidad])", "Promedio simple de una columna.", (cant/lin).toFixed(1).replace(".",",")],
    ["Margen bruto", 'CALCULATE(SUM(Ventas[margen_bruto]), Ventas[estado] <> "Anulada")', "Igual que la venta neta, con otra columna.", nf.format(mg)],
    ["Margen %", "DIVIDE([Margen bruto], [Venta neta])", "Razón entre dos medidas: nunca una columna sumada.", pct1(mg/vn)],
    ["Costo", 'SUMX(FILTER(Ventas, Ventas[estado] <> "Anulada"), Ventas[subtotal] - Ventas[margen_bruto])', "Iterador: calcula fila por fila y luego suma.", nf.format(costo)],
    ["Meta", "SUM(Metas[meta_subtotal])", "Otra tabla de hechos, filtrada por Sedes y Calendario.", nf.format(meta)],
    ["Cumplimiento", "DIVIDE([Venta neta], [Meta])", "El indicador del comité.", pct1(vn/meta)],
    ["Participación", "DIVIDE([Venta neta], CALCULATE([Venta neta], ALL(Sedes)))", "ALL quita el filtro de sede del denominador.", "100,0 % en el total"],
    ["Venta E-commerce", 'CALCULATE([Venta neta], Ventas[canal] = "E-commerce")', "CALCULATE agrega un filtro al contexto.", nf.format(ecom)],
    ["% E-commerce", "DIVIDE([Venta E-commerce], [Venta neta])", "Peso del canal en la venta.", pct1(ecom/vn)],
    ["Venta AA", "CALCULATE([Venta neta], SAMEPERIODLASTYEAR(Calendario[Date]))", "El mismo periodo del año anterior.", nf.format(vaa)],
    ["Var % AA", "DIVIDE([Venta neta] - [Venta AA], [Venta AA])", "Crecimiento frente al año anterior.", "+"+pct1(vn/vaa-1)],
    ["Venta YTD", "TOTALYTD([Venta neta], Calendario[Date])", "Acumulado desde el 1 de enero.", nf.format(vn)+" (a diciembre)"],
  ];
}

const DAX_LECCIONES = [
 {id:"l1", t:"Qué es DAX y dónde se escribe", c:`
  <p><b>DAX</b> (Data Analysis Expressions) es el lenguaje de fórmulas de Power BI. Se parece a las fórmulas de Excel, pero no trabaja con celdas: trabaja con <b>tablas y columnas</b>. Las funciones se escriben siempre en inglés, aunque Power BI esté en español.</p>
  <p>Con DAX se crean tres cosas:</p>
  <div class="scroll"><table class="datatbl"><tr><th></th><th>Medida</th><th>Columna calculada</th><th>Tabla calculada</th></tr>
    <tr><td><b>Qué es</b></td><td>Un cálculo que se evalúa para cada celda de un visual, según sus filtros.</td><td>Un valor por fila, que se guarda en la tabla.</td><td>Una tabla nueva hecha con una fórmula.</td></tr>
    <tr><td><b>Ejemplo</b></td><td class="mono">Venta neta = …</td><td class="mono">Tamaño = IF(Ventas[subtotal] &gt; 10000000, "Grande", "Normal")</td><td class="mono">Calendario = CALENDAR(…)</td></tr>
    <tr><td><b>Se usa para</b></td><td>Totales, porcentajes, promedios, comparaciones. <b>Casi todo.</b></td><td>Clasificar filas para usarlas en ejes o filtros.</td><td>Calendario, tablas auxiliares.</td></tr>
    <tr><td><b>Dónde</b></td><td>Inicio › Nueva medida</td><td>Herramientas de tabla › Nueva columna</td><td>Modelado › Nueva tabla</td></tr></table></div>
  <p>La forma de una medida:</p>
  <pre class="code">Venta neta =                                  -- nombre de la medida
    CALCULATE(                                -- función
        SUM( Ventas[subtotal] ),              -- Tabla[Columna]
        Ventas[estado] &lt;&gt; "Anulada"          -- filtro
    )</pre>
  <ol><li>Las columnas se escriben <code>Tabla[columna]</code>; las medidas, solo <code>[Medida]</code>.</li>
  <li>Los comentarios empiezan con <code>--</code> o <code>//</code>.</li>
  <li>Puedes partir la fórmula en varias líneas con <b>Shift + Enter</b> para leerla mejor.</li>
  <li>Los argumentos se separan con coma; si tu Power BI espera punto y coma, revisa los separadores de DAX en las opciones regionales.</li></ol>`},
 {id:"l2", t:"Agregar: SUM, AVERAGE, COUNTROWS, DISTINCTCOUNT", c:`
  <p>Las funciones de agregación resumen una columna en un número, <b>con los filtros que tenga la celda</b>:</p>
  <ol><li><code>SUM(Ventas[subtotal])</code> suma.</li>
  <li><code>AVERAGE(Ventas[cantidad])</code> promedia.</li>
  <li><code>MIN</code> y <code>MAX</code> devuelven el menor y el mayor.</li>
  <li><code>COUNTROWS(Ventas)</code> cuenta filas de una tabla.</li>
  <li><code>DISTINCTCOUNT(Ventas[id_factura])</code> cuenta valores distintos: una factura con cuatro líneas cuenta una vez.</li></ol>
  <p>Pruébalas en el <b>constructor de medidas</b> de abajo: cambia la función, la columna y las filas de la matriz, y observa cómo cambia cada celda.</p>`, sim:"constructor"},
 {id:"l3", t:"El contexto de filtro", c:`
  <p>Es la idea más importante de DAX. Cada celda de un visual calcula la medida con <b>sus propios filtros</b>: los de su fila, su columna, las segmentaciones, el panel de filtros y los roles de seguridad. Ese conjunto es el <b>contexto de filtro</b>.</p>
  <p>Por eso la misma medida da un valor distinto en cada fila, y el total <b>no es la suma de las filas</b>: es la misma medida calculada con menos filtros. Para la venta da igual, pero para un promedio, un conteo de distintos o un porcentaje, no.</p>
  <p>En el constructor, pon <b>DISTINCTCOUNT de id_cliente</b> con filas por canal: la suma de las filas es mayor que el total, porque un cliente que compra por dos canales cuenta en las dos filas y una sola vez en el total.</p>`, sim:"constructor"},
 {id:"l4", t:"CALCULATE: cambiar el contexto", c:`
  <p><code>CALCULATE(expresión, filtro1, filtro2, …)</code> evalúa la expresión con un contexto modificado. Es la función que más vas a usar.</p>
  <ol><li><b>Agregar un filtro</b>: <code>CALCULATE([Venta neta], Ventas[canal] = "E-commerce")</code>. Si la fila ya era otro canal, el filtro de CALCULATE lo reemplaza.</li>
  <li><b>Quitar filtros</b> con <code>ALL</code> o <code>REMOVEFILTERS</code>: <code>CALCULATE([Venta neta], ALL(Sedes))</code> ignora el filtro de sede. Es la base de la participación.</li>
  <li><b>Varios filtros</b> se combinan con «y»: <code>CALCULATE([Venta neta], Ventas[canal] = "E-commerce", Clientes[segmento] = "Gobierno")</code>.</li></ol>
  <p>En el constructor, usa el filtro de CALCULATE y el modificador ALL: verás cuándo el filtro de la fila se respeta y cuándo se reemplaza o se quita.</p>`, sim:"constructor"},
 {id:"l5", t:"Iteradores (funciones X) y el contexto de fila", c:`
  <p>Algunas cuentas no existen en una columna: hay que calcularlas <b>fila por fila</b> y luego sumar. Para eso están los iteradores: <code>SUMX</code>, <code>AVERAGEX</code>, <code>COUNTX</code>, <code>MAXX</code>…</p>
  <pre class="code">Costo = SUMX( Ventas, Ventas[subtotal] - Ventas[margen_bruto] )</pre>
  <p><code>SUMX</code> recorre la tabla; en cada fila evalúa la expresión con los valores de esa fila (el <b>contexto de fila</b>) y al final suma los resultados. Las columnas calculadas también usan contexto de fila; las medidas, no: por eso <code>SUM(Ventas[subtotal]) - SUM(Ventas[margen_bruto])</code> da lo mismo aquí, pero <code>SUMX(Ventas, Ventas[cantidad] * Ventas[precio_unitario])</code> no es igual a <code>SUM(cantidad) * SUM(precio)</code>.</p>`, sim:"iterador"},
 {id:"l6", t:"Variables: VAR y RETURN", c:`
  <p>Las variables guardan un resultado intermedio con un nombre. Hacen la fórmula más legible y más rápida, porque cada variable se calcula una sola vez.</p>
  <pre class="code">Var % AA =
VAR Actual  = [Venta neta]
VAR Anterior = CALCULATE([Venta neta], SAMEPERIODLASTYEAR(Calendario[Date]))
RETURN
    DIVIDE(Actual - Anterior, Anterior)</pre>
  <p>Es la misma idea de <b>LET</b> en Excel (clave 10 del curso de Excel). Úsalas siempre que una fórmula repita una parte o tenga más de dos pasos.</p>`},
 {id:"l7", t:"Inteligencia de tiempo", c:`
  <p>Con una tabla Calendario marcada como tabla de fechas:</p>
  <ol><li><code>TOTALYTD([Venta neta], Calendario[Date])</code>: acumulado del año.</li>
  <li><code>SAMEPERIODLASTYEAR(Calendario[Date])</code>: el mismo periodo del año anterior, dentro de CALCULATE.</li>
  <li><code>DATEADD(Calendario[Date], -1, MONTH)</code>: desplazar un mes, un trimestre o un año.</li>
  <li><code>DATESINPERIOD</code>: los últimos N días o meses.</li></ol>
  <p>El tema completo, con simulador, está en la <a href="#clave-05">clave 5</a>.</p>`},
 {id:"l8", t:"Errores comunes y cómo encontrarlos", c:`
  <div class="scroll"><table class="datatbl"><tr><th>Síntoma</th><th>Causa probable</th><th>Arreglo</th></tr>
    <tr><td>El total de un porcentaje es absurdo (588 %)</td><td>Es una columna calculada que se suma.</td><td>Convertirla en medida con DIVIDE.</td></tr>
    <tr><td>La venta es mayor que la cifra de control</td><td>Falta excluir las anuladas.</td><td>CALCULATE(…, Ventas[estado] &lt;&gt; "Anulada").</td></tr>
    <tr><td>Mismo valor en todas las filas</td><td>Falta una relación, o la medida usa ALL de esa dimensión.</td><td>Revisar la vista de modelo y los ALL.</td></tr>
    <tr><td>Participación de 100 % en cada fila</td><td>Falta ALL en el denominador.</td><td>CALCULATE([Venta neta], ALL(Sedes)).</td></tr>
    <tr><td>Error de división o «Infinito»</td><td>Se usó / con un divisor vacío.</td><td>Usar DIVIDE.</td></tr>
    <tr><td>Vacío en lugar de 0</td><td>No hay filas en ese contexto: DAX devuelve BLANK.</td><td>Es lo correcto casi siempre; si necesitas 0, agrega <code>+ 0</code> con cuidado.</td></tr>
    <tr><td>«No se puede determinar un valor único»</td><td>Se usó una columna donde se esperaba un solo valor.</td><td>Usar una agregación (SUM, MAX, SELECTEDVALUE).</td></tr></table></div>
  <p>Para depurar: pon la medida en una <b>matriz</b> con pocas filas y compárala con la <a href="#modelo">tabla de control</a>. La <b>vista de consulta DAX</b> de Power BI permite probar expresiones sueltas con <code>EVALUATE</code>.</p>`},
];

function viewDax(){
  const R = recetario();
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">Tutorial · 60 a 90 minutos</span><h1>DAX desde cero, con los datos de Distribuidora Andina</h1>
      <p class="muted read" style="font-size:1.1rem">Ocho lecciones cortas. Cada ejemplo se calcula aquí mismo con las 17.106 líneas de venta, para que veas qué devuelve cada fórmula antes de escribirla en Power BI. Al final, un recetario con las medidas del tablero comercial y su valor de control.</p>
      <div class="row" style="margin-top:12px"><a class="btn primary" href="#dax" data-go="l1">Empezar</a><a class="btn" href="#dax" data-go="recetario">Ir al recetario</a><a class="btn" href="${colabURL("tutorial_dax.ipynb")}" target="_blank" rel="noopener">Cuaderno de Colab</a></div></div>
    ${docenteBox({duracion:[["Lecciones 1 y 2",15,"Medida frente a columna; agregaciones en el constructor."],["Lecciones 3 y 4",25,"Contexto de filtro y CALCULATE: el corazón del tutorial."],["Lecciones 5 a 8",20,"Iteradores, variables, tiempo y errores."],["Recetario en Power BI",20,"Cada estudiante crea cinco medidas y las compara con el control."]],
      preguntas:["¿Por qué el total no es la suma de las filas?","¿Cuándo usarían una columna calculada?"],
      errores:["Escribir funciones en español (SUMA en lugar de SUM).","Referenciar una medida con Tabla[Medida] y confundirla con una columna."],cierre:"Quien entiende el contexto de filtro entiende DAX."})}
    <div class="mlayout">
      <nav class="toc" aria-label="Lecciones">${DAX_LECCIONES.map((l,i)=>`<a href="#dax" data-go="${l.id}"><span>${i+1}</span>${l.t}</a>`).join("")}<a href="#dax" data-go="recetario"><span>R</span>Recetario</a><a href="#dax" data-go="quizdax"><span>✓</span>Autoevaluación</a></nav>
      <div>
        ${DAX_LECCIONES.map((l,i)=>`<section class="step" id="${l.id}"><div class="sh"><span class="n">${i+1}</span><h2>${l.t}</h2></div><div class="prose">${l.c}</div>${l.sim?`<div class="dax-sim" data-sim="${l.sim}" style="margin-top:14px"></div>`:""}</section>`).join("")}
        <section class="step" id="recetario"><div class="sh"><span class="n">R</span><h2>Recetario del tablero comercial</h2></div>
          <p class="read">Dieciocho medidas listas para copiar en la tabla <code>_Medidas</code>. La última columna es el valor con la segmentación <b>Año = 2025</b>: tu tarjeta debe mostrar lo mismo.</p>
          <div class="scroll"><table class="datatbl"><tr><th>Medida</th><th>DAX</th><th>Para qué</th><th>2025</th></tr>
            ${R.map(r=>`<tr><td><b>${r[0]}</b></td><td class="mono small">${esc(r[0])} = ${esc(r[1])}</td><td class="small">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join("")}</table></div>
          <div style="margin-top:10px">${promptsHTML([{t:"Copiar todas las medidas", p:R.map(r=>`${r[0]} = ${r[1]}`).join("\n")}],"rec")}</div></section>
        <section class="step" id="quizdax"><div class="sh"><span class="n">✓</span><h2>Autoevaluación</h2></div><div class="quiz" id="qdax"></div></section>
      </div></div></div>`;
  app.querySelectorAll("[data-go]").forEach(a=>a.onclick=e=>{ e.preventDefault(); $("#"+a.dataset.go).scrollIntoView() });
  wireCopy(app);
  app.querySelectorAll('[data-sim="constructor"]').forEach(simConstructor);
  app.querySelectorAll('[data-sim="iterador"]').forEach(simIterador);
  renderQuiz($("#qdax"), DAX_QUIZ, (ok, res, retry)=>{
    res.innerHTML = ok>=6 ? `<h3>${ok} de ${DAX_QUIZ.length}: dominas lo esencial de DAX.</h3><div class="row" style="margin-top:10px"><a class="btn primary" href="#clave-04">Practicar en la clave 4</a></div>`
      : `<h3>${ok} de ${DAX_QUIZ.length}.</h3><p class="muted">Repasa las lecciones 3 y 4, y vuelve a intentarlo.</p><div class="row" style="margin-top:10px"><button class="btn" data-retry>Intentar de nuevo</button></div>`;
    const r=res.querySelector("[data-retry]"); if(r) r.onclick=retry;
  });
}

/* ---------- constructor de medidas ---------- */
function simConstructor(el){
  const COLS = {SUM:["subtotal","cantidad","margen_bruto"], AVERAGE:["subtotal","cantidad","margen_bruto"], MIN:["subtotal","cantidad"], MAX:["subtotal","cantidad"], DISTINCTCOUNT:["id_factura","id_cliente","id_vendedor"], COUNTROWS:["(tabla Ventas)"]};
  let S = {fn:"SUM", col:"subtotal", filtro:"noanul", mod:"ninguno", filas:"ciudad", anio:"2025"};
  const draw = ()=>{
    if(!COLS[S.fn].includes(S.col)) S.col = COLS[S.fn][0];
    const F = DAXFILAS[S.filas], cats = S.filas==="ninguna" ? [] : DM[S.filas];
    const base = S.fn==="COUNTROWS" ? "COUNTROWS(Ventas)" : `${S.fn}(Ventas[${S.col}])`;
    const args = [DAXF[S.filtro].d, S.mod==="allfila"&&F.t?`ALL(${F.t})`:"", S.mod==="allcal"?"REMOVEFILTERS(Calendario)":""].filter(Boolean);
    const expr = args.length ? `CALCULATE(\n    ${base},\n    ${args.join(",\n    ")}\n)` : base;
    const dec = S.fn==="AVERAGE";
    const reemplazaFila = (S.filtro==="ecom" && S.filas==="canal") || (S.filtro==="gob" && S.filas==="segmento");   // CALCULATE reemplaza el filtro de la misma columna
    const val = (k)=> daxEval({fn:S.fn, col:S.col, filtro:S.filtro, anio:S.anio, filaDim:F.t?S.filas:null, filaVal:k, quitarFila:S.mod==="allfila" || reemplazaFila, quitarAnio:S.mod==="allcal"});
    const filas = cats.map((c,k)=>[c, val(k)]), tot = val(null);
    const suma = filas.reduce((a,f)=>a+(f[1]||0),0);
    const reemplaza = reemplazaFila;
    let msg;
    if(S.mod==="allfila" && F.t) msg = `<b>ALL(${F.t})</b> quita el filtro de la fila: todas las filas muestran el total. Así se construye el denominador de una participación.`;
    else if(S.mod==="allcal") msg = `<b>REMOVEFILTERS(Calendario)</b> ignora la segmentación de año: el resultado es el de 2024 y 2025 juntos, aunque la segmentación diga ${S.anio}.`;
    else if(reemplaza) msg = "El filtro de CALCULATE es sobre la misma columna de las filas: <b>reemplaza</b> el filtro de la fila. Todas las filas muestran el valor del filtro de CALCULATE.";
    else if(S.filas!=="ninguna" && Math.round(suma)!==Math.round(tot) && S.fn!=="SUM" && S.fn!=="COUNTROWS") msg = `La suma de las filas (${fmtN(suma,dec)}) <b>no es</b> el total (${fmtN(tot,dec)}): el total se calcula con su propio contexto, sin el filtro de fila.`;
    else if(S.filtro==="ninguno" && S.fn==="SUM" && S.col==="subtotal") msg = "Sin el filtro de estado se suman las facturas anuladas: el total es mayor que la cifra de control.";
    else msg = "Cada celda calcula la medida con su contexto: la fila, la segmentación de año y el filtro de CALCULATE. Cambia una opción y observa qué cambia.";
    el.innerHTML = `<div class="panel"><span class="eyebrow">Constructor de medidas</span>
      <div class="ctl" style="margin-top:8px"><label>Función<select data-k="fn">${Object.keys(COLS).map(x=>`<option>${x}</option>`).join("")}</select></label>
        <label>Columna<select data-k="col">${COLS[S.fn].map(x=>`<option>${x}</option>`).join("")}</select></label>
        <label>Filtro de CALCULATE<select data-k="filtro"><option value="ninguno">(ninguno)</option><option value="noanul">estado ≠ Anulada</option><option value="ecom">canal = E-commerce</option><option value="gob">segmento = Gobierno</option></select></label>
        <label>Modificador<select data-k="mod"><option value="ninguno">(ninguno)</option><option value="allfila">ALL de la tabla de las filas</option><option value="allcal">REMOVEFILTERS(Calendario)</option></select></label></div>
      <div class="ctl"><label>Filas de la matriz<select data-k="filas">${Object.entries(DAXFILAS).map(([k,f])=>`<option value="${k}">${f.n}</option>`).join("")}</select></label>
        <label>Segmentación: año<select data-k="anio"><option>2024</option><option>2025</option><option>Todos</option></select></label></div>
      <pre class="code" style="margin-top:8px">Mi medida = ${esc(expr)}</pre>
      <div class="sheetwrap" style="margin-top:8px"><table class="sheet"><thead><tr><th>${F.n}</th><th>Mi medida</th></tr></thead><tbody>
        ${filas.map(f=>`<tr><td>${f[0]}</td><td class="num">${fmtN(f[1],dec)}</td></tr>`).join("")}<tr><td><b>Total</b></td><td class="num"><b>${fmtN(tot,dec)}</b></td></tr></tbody></table></div>
      <div class="insight" style="margin-top:8px">${msg}</div></div>`;
    el.querySelectorAll("[data-k]").forEach(s=>{ s.value=S[s.dataset.k]; s.onchange=()=>{ S[s.dataset.k]=s.value; draw() } });
  };
  draw();
}

/* ---------- iterador SUMX fila por fila ---------- */
const validas2025 = () => { const y=anioIdx(2025); let n=0; for(let i=0;i<NL;i++) if(C.anio[i]===y && C.estado[i]!==2) n++; return n };
function simIterador(el){
  const y=anioIdx(2025), idx=[]; for(let i=0;i<NL && idx.length<8;i++){ if(C.anio[i]===y && C.estado[i]!==2) idx.push(i) }
  let paso = 0;
  const draw = ()=>{
    const acum = idx.slice(0,paso).reduce((a,i)=>a+C.subtotal[i]-C.margen[i],0);
    el.innerHTML = `<div class="panel"><span class="eyebrow">SUMX paso a paso · Costo = SUMX(Ventas, Ventas[subtotal] - Ventas[margen_bruto])</span>
      <div class="sheetwrap" style="margin-top:8px"><table class="sheet"><thead><tr><th>Fila</th><th>subtotal</th><th>margen_bruto</th><th>subtotal − margen</th></tr></thead><tbody>
        ${idx.map((i,k)=>`<tr style="${k===paso-1?"background:var(--sel)":""}"><td>${k+1}</td><td class="num">${nf.format(C.subtotal[i])}</td><td class="num">${nf.format(C.margen[i])}</td><td class="num">${k<paso?nf.format(C.subtotal[i]-C.margen[i]):"…"}</td></tr>`).join("")}
        <tr><td colspan="3"><b>Suma acumulada</b></td><td class="num"><b>${nf.format(acum)}</b></td></tr></tbody></table></div>
      <div class="row" style="margin-top:8px"><button class="btn primary" data-sig ${paso>=idx.length?"disabled":""}>Evaluar la siguiente fila</button><button class="btn" data-rei>Reiniciar</button></div>
      <div class="insight" style="margin-top:8px">${paso===0?"SUMX recorre la tabla fila por fila. Pulsa el botón para ver cómo evalúa la expresión en cada fila (contexto de fila) y acumula.":paso<idx.length?`Fila ${paso}: la expresión usa los valores de <b>esa</b> fila. SUMX guarda el resultado y pasa a la siguiente.`:`Así recorre las ${nf.format(X.control["Año 2025"]["Facturas"]&&validas2025())} líneas válidas de 2025. Con la tabla completa, Costo 2025 = ${recetario()[9][3]}.`}</div></div>`;
    $("[data-sig]",el).onclick=()=>{ paso++; draw() }; $("[data-rei]",el).onclick=()=>{ paso=0; draw() };
  };
  draw();
}

const DAX_QUIZ = [
  {q:"¿Cómo se referencia una columna en DAX?", o:["[columna]","Tabla[columna]","Tabla.columna","A1:A100"], a:1, w:"Las columnas llevan el nombre de la tabla; las medidas, solo corchetes."},
  {q:"¿Qué es el contexto de filtro?", o:["El panel Filtros","El conjunto de filtros con el que se calcula cada celda","Una función","Un tipo de visual"], a:1, w:"Incluye fila, columna, segmentaciones, filtros y roles."},
  {q:"¿Qué hace CALCULATE?", o:["Suma","Evalúa una expresión con un contexto de filtro modificado","Crea una tabla","Cambia el formato"], a:1, w:"Agrega, reemplaza o quita filtros antes de calcular."},
  {q:"DISTINCTCOUNT de clientes por canal: la suma de las filas es mayor que el total. ¿Por qué?", o:["Es un error de Power BI","Un cliente que compra por dos canales cuenta en dos filas y una vez en el total","Faltan datos","Hay anuladas"], a:1, w:"El total se calcula con su propio contexto, no sumando filas."},
  {q:"¿Para qué sirve ALL(Sedes) dentro de CALCULATE?", o:["Para mostrar todas las sedes","Para quitar el filtro de sede","Para ordenar","Para sumar columnas"], a:1, w:"Es el denominador de la participación."},
  {q:"¿Qué hace SUMX?", o:["Lo mismo que SUM","Evalúa una expresión fila por fila y suma los resultados","Suma solo los máximos","Suma dos tablas"], a:1, w:"Es un iterador: usa el contexto de fila."},
  {q:"¿Para qué sirven VAR y RETURN?", o:["Para crear tablas","Para guardar resultados intermedios con nombre y hacer legible la fórmula","Para filtrar","Para comentar"], a:1, w:"Como LET en Excel."},
  {q:"Un porcentaje muestra 588 % en el total. ¿Qué pasó?", o:["Los datos están mal","Es una columna calculada que se suma; debía ser una medida","Falta una relación","El formato"], a:1, w:"Las razones van en medidas con DIVIDE."},
];
