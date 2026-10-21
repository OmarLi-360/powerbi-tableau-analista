/* ======================================================================
   CONTENIDO · Piloto: claves 3 (modelo estrella), 4 (medidas DAX) y 6 (informe)
   ====================================================================== */
const MOD = {}, SIMS = {}, ERRORES = {};
const pct1 = v => (v*100).toFixed(1).replace(".",",")+" %";
const metaDe = (anio, filtro=()=>true) => X.metas.filter(m=>m[0]===anio && filtro(m)).reduce((a,m)=>a+m[3],0);

/* ---------------------------------------------------------------------
   CLAVE 3 · Modelo estrella y relaciones
   --------------------------------------------------------------------- */
MOD[3] = {
 minutos:60, notebook:"03_modelo_estrella.ipynb",
 objetivos:["Armar el modelo estrella de Distribuidora Andina en la vista de modelo.","Elegir cardinalidad y dirección del filtro para cada relación.","Reconocer los síntomas de una relación que falta, sobra o es ambigua."],
 entender:`
  <p>En Excel unías tablas con BUSCARX. En Power BI las tablas quedan separadas y se <b>relacionan</b>: una línea en la <b>vista de modelo</b> conecta la llave de una tabla con la de otra. Cuando filtras por una sede, el filtro <b>viaja por la relación</b> y la tabla de ventas muestra solo las de esa sede.</p>
  <p>El diseño recomendado es el <b>modelo estrella</b>:</p>
  <ol><li>En el centro, las <b>tablas de hechos</b>: <code>Ventas</code> (una fila por línea de factura) y <code>Metas</code> (una fila por sede y mes).</li>
  <li>Alrededor, las <b>dimensiones</b>: <code>Clientes</code>, <code>Productos</code>, <code>Vendedores</code>, <code>Sedes</code> y <code>Calendario</code>. Cada una tiene una llave única.</li>
  <li>Cada relación es <b>varios a uno (*:1)</b>: muchas ventas para un cliente, un cliente para cada venta.</li>
  <li>La <b>dirección del filtro cruzado</b> es <b>única</b>: de la dimensión hacia los hechos.</li></ol>
  <p>Tres síntomas delatan un modelo mal armado: <b>el mismo total en cada fila</b> (falta la relación), <b>una línea punteada</b> (Power BI dejó inactiva una relación porque había dos caminos) y <b>totales inflados</b> (una relación varios a varios entre dos tablas de hechos).</p>
  <p>Metas y Ventas no se relacionan entre sí: las dos se relacionan con <code>Sedes</code> y <code>Calendario</code>, y así se comparan sin mezclarse.</p>`,
 brechaTxt:"Quien viene de Excel tiende a unir todo en una tabla o a relacionar «todo con todo». Las dos cosas producen cifras que no cuadran sin ningún mensaje de error.",
 pbi:[
  ["Carga las seis tablas", "<b>Inicio › Obtener datos › Texto o CSV</b>: <code>ventas.csv</code>, <code>clientes.csv</code>, <code>productos.csv</code>, <code>vendedores.csv</code>, <code>sedes.csv</code> y <code>metas.csv</code>. Cambia los nombres a Ventas, Clientes, Productos, Vendedores, Sedes y Metas."],
  ["Crea la tabla Calendario", "<b>Modelado › Nueva tabla</b>: <code>Calendario = ADDCOLUMNS(CALENDAR(DATE(2024,1,1), DATE(2026,12,31)), \"Año\", YEAR([Date]), \"Mes\", MONTH([Date]))</code>. Luego <b>Herramientas de tabla › Marcar como tabla de fechas</b>."],
  ["Prepara Metas", "En Metas, <b>Modelado › Nueva columna</b>: <code>fecha_mes = DATE(Metas[anio], Metas[mes], 1)</code>. Así Metas se puede relacionar con el Calendario."],
  ["Revisa lo que Power BI creó solo", "Abre la <b>vista de modelo</b> (tercer icono a la izquierda). Power BI pudo haber creado relaciones automáticas: revisa cada línea con doble clic y elimina las que no estén en el paso siguiente."],
  ["Crea las relaciones", "Arrastra cada llave a su pareja: Ventas[id_cliente]→Clientes, Ventas[sku]→Productos, Ventas[id_vendedor]→Vendedores, Ventas[id_sede]→Sedes, Ventas[fecha]→Calendario[Date], Metas[id_sede]→Sedes y Metas[fecha_mes]→Calendario[Date]. En cada una: <b>Varios a uno (*:1)</b> y dirección <b>Única</b>."],
  ["Evita la ruta ambigua", "Clientes también tiene id_sede, pero <b>no</b> la relaciones con Sedes: habría dos caminos de Sedes a Ventas. Si Power BI la creó, elimínala."],
  ["Prueba el modelo", "En una vista de informe, crea una matriz con Clientes[segmento] en filas y la suma de Ventas[subtotal]. Cada segmento debe mostrar un valor distinto. Si todos muestran lo mismo, falta una relación."],
 ],
 tableau:[
  ["Conecta y relaciona", "<b>Conectar › Archivo de texto</b> con ventas.csv. Arrastra clientes.csv, productos.csv, sedes.csv y vendedores.csv al lienzo: Tableau crea una <b>relación</b> (la línea flexible) y te pide la llave."],
  ["Revisa las llaves", "Haz clic en cada línea y confirma el par de campos (id_cliente = id_cliente, sku = sku…). Tableau no pide dirección del filtro."],
  ["Metas aparte", "Para comparar con metas en Tableau, relaciona metas.csv con sedes.csv por id_sede. Las fechas se comparan con un campo de mes."],
 ],
 colabQue:"Ves el tamaño de cada tabla y por qué conviene la estrella, verificas que cada llave sea única y que no haya ventas huérfanas, y observas el síntoma del mismo total en cada fila cuando falta una relación.",
 ia:[
  {t:"Revisar un modelo", p:`Tengo en Power BI estas tablas y relaciones:
- Ventas (id_cliente, sku, id_vendedor, id_sede, fecha, subtotal, estado)
- Clientes (id_cliente, segmento, id_sede), Productos (sku, categoria), Vendedores (id_vendedor), Sedes (id_sede, ciudad), Metas (id_sede, fecha_mes, meta_subtotal), Calendario (Date)
[DESCRIBE TUS RELACIONES: tabla y campo de cada lado, cardinalidad y dirección]
Dime si es un modelo estrella correcto, qué relación sobra o falta y qué síntoma produciría cada error.`},
  {t:"Entender un síntoma", p:`En Power BI, mi matriz muestra el mismo valor en todas las filas cuando pongo Clientes[segmento] en filas y la suma de Ventas[subtotal] en valores.
Explícame las causas posibles en orden de probabilidad y cómo revisarlas en la vista de modelo.`},
 ],
 iaCuidado:"Describe el modelo con nombres de columnas, no pegues filas de datos reales de clientes. Para verificar la respuesta, compara contra la tabla de control.",
 quiz:[
  {q:"Una matriz muestra el mismo total en cada fila. ¿Qué es lo más probable?",
   o:["La medida está mal escrita","Falta la relación entre la tabla de filas y la de hechos","Hay demasiados datos","El visual es incorrecto"], a:1,
   w:"Sin relación, el filtro de la fila no llega a los hechos y cada fila ve el total completo."},
  {q:"¿Cuál es la cardinalidad normal entre Ventas y Clientes?",
   o:["Uno a uno","Varios a uno (*:1)","Varios a varios","Ninguna"], a:1,
   w:"Muchas líneas de venta pertenecen a un mismo cliente, y cada línea tiene un solo cliente."},
  {q:"Power BI dibuja una relación con línea punteada. ¿Qué significa?",
   o:["Que está rota","Que está inactiva porque había otro camino entre las mismas tablas","Que es bidireccional","Que es más rápida"], a:1,
   w:"Solo puede haber un camino activo entre dos tablas. La punteada solo se usa con USERELATIONSHIP."},
  {q:"¿Cómo se comparan Ventas y Metas en el modelo?",
   o:["Relacionándolas directamente por id_sede","Uniéndolas en una sola tabla","Relacionando cada una con Sedes y con Calendario","No se pueden comparar"], a:2,
   w:"Las dos son tablas de hechos: comparten dimensiones, no se relacionan entre sí."},
 ],
 docente:{
  duracion:[["Apertura: el mismo total en cada fila",8,"Proyecta una matriz por segmento sin relación y pregunta qué pasa."],
            ["Simulador del modelo",12,"Activen relaciones una a una y prueben cada pregunta."],
            ["Power BI: vista de modelo",30,"Siete pasos; revisen las relaciones automáticas."],
            ["Autoevaluación",10,"Cuestionario individual."]],
  preguntas:["¿Qué tablas son hechos y cuáles dimensiones en su trabajo?","¿Por qué no relacionar Clientes con Sedes si la columna existe?","¿Qué ventaja tiene no unir todo en una tabla?"],
  errores:["Dejar las relaciones automáticas sin revisar.","Relacionar Ventas con Metas por id_sede (varios a varios).","Poner dirección Ambas «para que funcione»."],
  cierre:"Un modelo estrella hace que cada filtro llegue a los hechos por un solo camino."},
};

/* ---------------------------------------------------------------------
   CLAVE 4 · Medidas DAX y el contexto de filtro
   --------------------------------------------------------------------- */
MOD[4] = {
 minutos:60, notebook:"04_medidas_dax.ipynb",
 objetivos:["Crear las seis medidas base del tablero comercial.","Entender el contexto de filtro de cada celda de un visual.","Saber cuándo usar una medida y cuándo una columna calculada."],
 entender:`
  <p>Una <b>medida</b> no tiene un valor fijo: se calcula para cada celda del visual con los filtros que esa celda tiene. En una matriz con sedes en filas y el año 2025 en una segmentación, la celda de Cali calcula con el filtro <i>Año = 2025, Sede = Cali</i>. Ese conjunto de filtros es el <b>contexto de filtro</b>.</p>
  <p>Las seis medidas del curso:</p>
  <pre class="code">Venta neta = CALCULATE(SUM(Ventas[subtotal]), Ventas[estado] &lt;&gt; "Anulada")
Meta = SUM(Metas[meta_subtotal])
Cumplimiento = DIVIDE([Venta neta], [Meta])
Facturas = CALCULATE(DISTINCTCOUNT(Ventas[id_factura]), Ventas[estado] &lt;&gt; "Anulada")
Ticket promedio = DIVIDE([Venta neta], [Facturas])
Participación = DIVIDE([Venta neta], CALCULATE([Venta neta], ALL(Sedes)))</pre>
  <ol><li><b>CALCULATE</b> evalúa una expresión con un contexto modificado: aquí, sin las anuladas.</li>
  <li><b>DIVIDE</b> divide sin error cuando el divisor es cero.</li>
  <li><b>ALL(Sedes)</b> quita el filtro de sede: el denominador es el total de todas las sedes, y por eso la participación funciona en cada fila.</li></ol>
  <p class="small">¿Primera vez con DAX? Haz antes el <a href="#dax">tutorial de DAX</a>: ocho lecciones con ejemplos que se calculan en vivo.</p>
  <p>Una <b>columna calculada</b> se calcula una vez, fila por fila, y se guarda. Sirve para clasificar filas (por ejemplo, «Grande» si la factura supera 10 millones). Para porcentajes, promedios y totales, siempre medidas: una columna de porcentaje se <b>suma</b> en los totales.</p>`,
 brechaTxt:"El error más común de quien llega de Excel es calcular porcentajes en columnas: en la fila se ve bien, y en el total aparece una suma sin sentido.",
 pbi:[
  ["Crea una tabla para las medidas", "<b>Inicio › Especificar datos</b>, nombre <code>_Medidas</code>, Cargar. Allí guardarás todas las medidas para encontrarlas fácil."],
  ["Escribe la primera medida", "Clic derecho en _Medidas › <b>Nueva medida</b> y escribe <code>Venta neta = CALCULATE(SUM(Ventas[subtotal]), Ventas[estado] &lt;&gt; \"Anulada\")</code>. En <b>Herramientas de medición</b> dale formato de número con separador de miles."],
  ["Completa las seis", "Crea Meta, Cumplimiento (formato porcentaje), Facturas, Ticket promedio y Participación como en «Entender»."],
  ["Compara con la tabla de control", "Pon cuatro tarjetas y una segmentación de año. Con 2025 debes ver: venta neta 14.692.379.210, cumplimiento 95,3 %, facturas 3.641 y ticket 4.035.259. Si algo no cuadra, revisa la medida, no el visual."],
  ["Mira el contexto de filtro", "Matriz con Sedes[ciudad] en filas y las seis medidas en valores. Observa cómo Participación suma 100 % y Cumplimiento del total no es la suma de las filas."],
  ["Prueba el error a propósito", "Crea en Ventas una <b>columna</b> <code>Cumpl col = DIVIDE(Ventas[subtotal], 1000000)</code> y ponla en la matriz: verás que el total se suma. Bórrala al terminar."],
 ],
 tableau:[
  ["Campo calculado", "Clic derecho en el panel de datos › <b>Crear campo calculado</b>: <code>Venta neta = SUM(IF [estado] &lt;&gt; \"Anulada\" THEN [subtotal] END)</code>."],
  ["Participación", "Pon Venta neta en Texto, luego clic derecho › <b>Cálculo rápido de tabla › Porcentaje del total</b>. Es el equivalente de ALL en Tableau."],
  ["Cifra fija", "Para un total que no cambie con la vista: <code>{FIXED : SUM([subtotal])}</code>, una expresión de nivel de detalle (LOD)."],
 ],
 colabQue:"Ves la tabla de control de las seis medidas para el año y la sede que elijas (para comparar con tus tarjetas), cómo cambia una medida según el contexto de filtro y por qué sumar porcentajes da 588 %.",
 ia:[
  {t:"Escribir una medida", p:`En Power BI tengo la tabla Ventas (subtotal, estado, id_factura) y Metas (meta_subtotal), relacionadas con Sedes y Calendario.
Escribe en DAX la medida [nombre de la medida] sin incluir las facturas con estado "Anulada".
Explica qué hace cada función y dame dos valores de prueba que yo pueda verificar con una tabla.`},
  {t:"Medida o columna", p:`Quiero calcular [DESCRIBE EL CÁLCULO] en Power BI.
¿Debe ser una medida o una columna calculada? Explica por qué y qué pasaría en el total de una matriz si elijo la otra opción.`},
 ],
 iaCuidado:"Las IA a veces inventan funciones DAX o mezclan sintaxis de Excel. Verifica cada medida contra la tabla de control antes de usarla en un informe.",
 quiz:[
  {q:"La celda de Cali en una matriz filtrada por 2025 calcula la venta…",
   o:["De todas las sedes","Solo de Cali en 2025","De Cali en todos los años","De 2025 de todas las sedes"], a:1,
   w:"Cada celda tiene su contexto de filtro: la fila (Cali) y la segmentación (2025)."},
  {q:"¿Para qué sirve ALL(Sedes) en la medida de participación?",
   o:["Para filtrar una sede","Para quitar el filtro de sede del denominador y obtener el total","Para sumar todas las columnas","Para ordenar"], a:1,
   w:"Sin ALL, el denominador sería la misma sede y la participación daría 100 % en cada fila."},
  {q:"El cumplimiento está en una columna calculada y la matriz muestra 588 % en el total. ¿Qué pasó?",
   o:["Hay un error en los datos","La columna se suma en el total; debía ser una medida","Falta una relación","El formato está mal"], a:1,
   w:"Los porcentajes no se suman: la medida divide la venta total entre la meta total."},
  {q:"¿Por qué usar DIVIDE en lugar de /?",
   o:["Es más rápido","Devuelve vacío en lugar de error cuando el divisor es cero","Redondea","Es obligatorio en DAX"], a:1,
   w:"Una sede sin meta en un mes daría error con /. DIVIDE devuelve vacío."},
 ],
 docente:{
  duracion:[["Apertura: el 588 %",8,"Muestra la matriz con el cumplimiento en columna."],
            ["Simulador de contexto",12,"Hagan clic en celdas y cambien de medida."],
            ["Power BI: seis medidas",30,"Comparar cada tarjeta con la tabla de control."],
            ["Autoevaluación",10,"Cuestionario individual."]],
  preguntas:["¿Qué cálculos de su trabajo deberían ser medidas?","¿Qué pasa con Meta cuando las filas son canales?","¿Por qué guardar las medidas en una tabla aparte?"],
  errores:["Usar SUM(subtotal) sin excluir anuladas.","Cumplimiento como columna calculada.","Participación sin ALL: 100 % en cada fila."],
  cierre:"Una medida se calcula en el contexto de cada celda; por eso el total es un cálculo, no una suma."},
};

/* ---------------------------------------------------------------------
   CLAVE 6 · Informe que responde preguntas
   --------------------------------------------------------------------- */
MOD[6] = {
 minutos:60, notebook:"06_informe_que_responde.ipynb",
 objetivos:["Elegir el visual según la pregunta, en Power BI y en Tableau.","Armar una página de informe de 3 a 5 visuales con jerarquía clara.","Usar segmentaciones y formato condicional con un propósito."],
 entender:`
  <p>Una página de informe responde las preguntas de una persona que va a decidir. Antes de abrir el panel de visualizaciones, escribe las preguntas. Cada una tiene su visual:</p>
  <ol><li><b>Tarjeta</b>: una cifra clave (venta neta, cumplimiento).</li>
  <li><b>Barras</b>: comparar categorías (cumplimiento por sede), ordenadas.</li>
  <li><b>Líneas</b>: evolución en el tiempo, con la meta como segunda línea.</li>
  <li><b>Matriz</b>: detalle con filas y columnas, como una tabla dinámica.</li>
  <li><b>Segmentación</b>: para que el lector filtre (por canal, por año).</li></ol>
  <p>La <b>jerarquía</b> de la página: arriba las tarjetas, en el centro el visual principal, abajo o a la derecha el detalle. Se lee de arriba a la izquierda hacia abajo a la derecha.</p>
  <p>Evita lo que se ve vistoso pero no se lee: tortas con más de cuatro partes, velocímetros sin referencia y tablas de cien filas. El <b>formato condicional</b> sirve para marcar excepciones (la sede debajo de la meta), no para decorar.</p>
  <p>En <b>Tableau</b> la lógica es la misma: una <b>hoja</b> por pregunta y un <b>dashboard</b> que las junta.</p>`,
 brechaTxt:"Una página con diez visuales parece completa, pero obliga al lector a buscar. Una con cinco bien elegidos responde en segundos.",
 pbi:[
  ["Escribe las preguntas", "En un cuadro de texto, arriba de la página, escribe las tres preguntas del comité: ¿cuánto vendimos?, ¿qué sede quedó lejos de la meta?, ¿en qué meses?"],
  ["Tarjetas arriba", "Tres visuales <b>Tarjeta</b>: Venta neta, Cumplimiento y Ticket promedio. Con 2025 deben coincidir con la tabla de control."],
  ["Barras de cumplimiento", "<b>Gráfico de barras agrupadas</b> con Sedes[ciudad] en el eje y [Cumplimiento] en valores. Ordena de mayor a menor (… › Ordenar eje)."],
  ["Línea contra meta", "<b>Gráfico de líneas</b> con Calendario[Mes] en el eje, [Venta neta] y [Meta] en valores."],
  ["Segmentación por canal", "Visual <b>Segmentación de datos</b> con Ventas[canal]. Pruébala: todos los visuales se filtran."],
  ["Formato condicional", "En las barras: <b>Formato › Barras › Color › fx</b>, regla: si Cumplimiento &lt; 1, rojo; si no, gris. Solo resaltas lo que necesita atención."],
 ],
 tableau:[
  ["Una hoja por pregunta", "Hoja 1: ciudad en <b>Filas</b>, Cumplimiento en <b>Columnas</b>, ordenar descendente. Hoja 2: MONTH(fecha) en Columnas, Venta neta en Filas, marca <b>Línea</b>."],
  ["Color con propósito", "Arrastra un campo calculado <code>[Cumplimiento] &lt; 1</code> a <b>Color</b> y asigna rojo a Verdadero y gris a Falso."],
  ["Dashboard", "<b>Nuevo dashboard</b>, arrastra las hojas, agrega canal como filtro y actívalo en <b>Usar como filtro</b>."],
 ],
 colabQue:"Ves, pregunta por pregunta, el visual que la responde mejor y el que la responde mal, y armas la página del comité con las cifras de control para comparar con tu Power BI.",
 ia:[
  {t:"Diseñar la página", p:`Voy a presentar en Power BI el cierre comercial de 2025 al comité directivo.
Las preguntas son: [LISTA DE PREGUNTAS].
Propón el visual para cada pregunta, la posición en la página (arriba, centro, abajo) y qué formato condicional usar. Máximo cinco visuales.`},
  {t:"Del visual de Power BI a Tableau", p:`En Power BI hice [DESCRIBE EL VISUAL: tipo, ejes, valores, filtros].
Explícame paso a paso cómo hacer lo mismo en Tableau Public: qué va en Columnas, Filas, Marcas y Filtros.`},
 ],
 iaCuidado:"Pide a la IA el diseño, no las cifras. Las cifras salen de tu modelo y se comparan con la tabla de control.",
 quiz:[
  {q:"Para mostrar el cumplimiento de 2025 en una sola cifra, el visual es…",
   o:["Velocímetro sin meta","Tarjeta","Torta","Tabla"], a:1,
   w:"La tarjeta muestra una cifra clara. Un velocímetro sin referencia ocupa espacio y no agrega información."},
  {q:"¿Qué visual responde «¿cómo evolucionó la venta frente a la meta mes a mes?»?",
   o:["Barras apiladas","Líneas con venta y meta","Matriz","Dona"], a:1,
   w:"La evolución en el tiempo se lee como línea, y la meta como segunda línea de referencia."},
  {q:"¿Para qué sirve una segmentación de datos?",
   o:["Para decorar","Para que el lector filtre todos los visuales de la página","Para ordenar","Para exportar"], a:1,
   w:"La segmentación filtra la página completa con un clic."},
  {q:"En Tableau, ¿qué es un dashboard?",
   o:["Un tipo de gráfico","El conjunto de hojas que responden las preguntas","Un filtro","Una fuente de datos"], a:1,
   w:"Cada hoja es un visual; el dashboard las reúne en una página."},
 ],
 docente:{
  duracion:[["Apertura: la página con diez visuales",8,"Proyecta la página saturada y pregunta qué entienden."],
            ["Simulador: pregunta y visual",12,"Armen la página del comité."],
            ["Power BI: la página",25,"Tarjetas, barras, línea, segmentación y formato."],
            ["Tableau: la misma pregunta",5,"Una hoja en Tableau para comparar."],
            ["Autoevaluación",10,"Cuestionario individual."]],
  preguntas:["¿Qué preguntas haría su jefe sobre estos datos?","¿Qué visual quitarían sin perder información?","¿Qué cambia entre Power BI y Tableau, y qué no?"],
  errores:["Tortas con seis partes.","Velocímetros sin meta.","Formato condicional en todas las barras."],
  cierre:"Primero las preguntas; después los visuales. Funciona igual en Power BI y en Tableau."},
};

/* ---------- «Ver el error» ---------- */
ERRORES[3] = ()=>{
  const tot = X.control["Año 2025"]["Venta neta"];
  const seg = DM.segmento.map((s,j)=>({k:s, v:0}));
  for(let i=0;i<NL;i++){ if(C.anio[i]===anioIdx(2025) && C.estado[i]!==2) seg[C.segmento[i]].v += C.subtotal[i] }
  const fila = (k,v)=>`<tr><td>${k}</td><td class="num">${nf.format(Math.round(v))}</td></tr>`;
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Sin relación Ventas–Clientes</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">segmento</td><td class="hd">Venta neta 2025</td></tr>
     ${seg.map(s=>fila(s.k, tot)).join("")}<tr><td><b>Total</b></td><td class="num"><b>${nf.format(tot)}</b></td></tr></table></div>
     <p class="muted small" style="margin-top:8px">El mismo total en cada fila: el filtro de segmento no llega a Ventas.</p></div>
   <div class="panel good"><span class="eyebrow">Con la relación *:1 por id_cliente</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">segmento</td><td class="hd">Venta neta 2025</td></tr>
     ${seg.map(s=>fila(s.k, s.v)).join("")}<tr><td><b>Total</b></td><td class="num"><b>${nf.format(tot)}</b></td></tr></table></div>
     <p class="muted small" style="margin-top:8px">Cada segmento muestra su venta y la suma da el total.</p></div></div>`;
};
ERRORES[4] = ()=>{
  const cs = X.control_sede, sedes = Object.keys(cs);
  const suma = sedes.reduce((a,s)=>a+cs[s]["Cumplimiento"],0);
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Cumplimiento como columna calculada</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">Sede</td><td class="hd">Cumplimiento</td></tr>
     ${sedes.map(s=>`<tr><td>${s}</td><td class="num">${pct1(cs[s]["Cumplimiento"])}</td></tr>`).join("")}<tr><td><b>Total</b></td><td class="num" style="color:var(--bad)"><b>${pct1(suma)}</b></td></tr></table></div>
     <p class="muted small" style="margin-top:8px">Las filas se ven bien; el total suma porcentajes.</p></div>
   <div class="panel good"><span class="eyebrow">Cumplimiento = DIVIDE([Venta neta], [Meta])</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">Sede</td><td class="hd">Cumplimiento</td></tr>
     ${sedes.map(s=>`<tr><td>${s}</td><td class="num">${pct1(cs[s]["Cumplimiento"])}</td></tr>`).join("")}<tr><td><b>Total</b></td><td class="num" style="color:var(--good)"><b>${pct1(X.control["Año 2025"]["Cumplimiento"])}</b></td></tr></table></div>
     <p class="muted small" style="margin-top:8px">El total divide la venta total entre la meta total, en su propio contexto.</p></div></div>`;
};
ERRORES[6] = ()=>{
  const caja = (x,y,w,h,t,mal)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${mal?"var(--bad-soft)":"var(--surface-2)"}" stroke="${mal?"var(--bad)":"var(--line)"}"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" style="font-size:10px;fill:var(--ink)">${t}</text>`;
  const mala = [[4,4,70,50,"Torta 3D",1],[78,4,70,50,"Velocímetro",1],[152,4,70,50,"Velocímetro",1],[226,4,70,50,"Torta",1],
    [4,58,145,60,"Tabla 120 filas",1],[153,58,143,60,"Columnas 12 colores",1],[4,122,96,50,"Mapa",0],[104,122,96,50,"Dona 6 partes",1],[204,122,92,50,"Tarjeta",0]];
  const buena = [[4,4,94,40,"Venta neta",0],[102,4,94,40,"Cumplimiento",0],[200,4,96,40,"Ticket",0],
    [4,50,170,122,"Barras: cumplimiento por sede",0],[178,50,118,80,"Línea: venta y meta",0],[178,134,118,38,"Segmentación: canal",0]];
  const svg = (bs)=>`<svg viewBox="0 0 300 176" role="img" aria-label="Distribución de una página">${bs.map(b=>caja(...b)).join("")}</svg>`;
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Nueve visuales sin pregunta</span><div style="margin-top:8px">${svg(mala.map(b=>[...b.slice(0,5), b[5]]))}</div>
     <p class="muted small">Tortas, velocímetros y una tabla enorme. ¿Cuál es el mensaje?</p></div>
   <div class="panel good"><span class="eyebrow">Seis visuales, cada uno con su pregunta</span><div style="margin-top:8px">${svg(buena)}</div>
     <p class="muted small">Arriba las cifras, al centro la comparación, a la derecha la evolución y el filtro.</p></div></div>`;
};

/* ======================================================================
   SIMULADORES
   ====================================================================== */

/* ---- Clave 3: armar el modelo y probarlo ---- */
SIMS[3] = function(el){
  const REL = [
    {id:"cli", d:"Ventas[id_cliente] → Clientes", ok:true},
    {id:"pro", d:"Ventas[sku] → Productos", ok:true},
    {id:"sed", d:"Ventas[id_sede] → Sedes", ok:true},
    {id:"cal", d:"Ventas[fecha] → Calendario", ok:true},
    {id:"msed", d:"Metas[id_sede] → Sedes", ok:true},
    {id:"mcal", d:"Metas[fecha_mes] → Calendario", ok:true},
    {id:"clised", d:"Clientes[id_sede] → Sedes", ok:false},
    {id:"vm", d:"Ventas[id_sede] ↔ Metas[id_sede]", ok:false},
  ];
  const on = {cli:false, pro:true, sed:true, cal:true, msed:false, mcal:false, clised:true, vm:false};
  let dirAmbas = false, preg = "seg";
  const PREG = {
    seg:{t:"Venta neta 2025 por segmento", nec:["cli"], filas:DM.segmento, col:"segmento"},
    cat:{t:"Venta neta 2025 por categoría", nec:["pro"], filas:DM.categoria, col:"categoria"},
    mes:{t:"Venta neta 2025 por mes", nec:["cal"], filas:MESES, col:"mes"},
    cum:{t:"Cumplimiento 2025 por sede", nec:["sed","msed"], filas:DM.ciudad, col:"ciudad"},
  };
  const y25 = anioIdx(2025), tot = X.control["Año 2025"]["Venta neta"], meta25 = metaDe(2025);
  const ventaPor = col => { const v = PREG[preg].filas.map(()=>0); for(let i=0;i<NL;i++){ if(C.anio[i]!==y25||C.estado[i]===2) continue; v[C[col][i]] += C.subtotal[i] } return v };
  const draw = ()=>{
    const P = PREG[preg], falta = P.nec.filter(r=>!on[r]);
    const ambigua = on.clised && on.sed && on.cli, mm = on.vm;
    let filas;
    if(preg==="cum"){
      const v = ventaPor("ciudad");
      filas = DM.ciudad.map((c,i)=>{ const vi = on.sed ? v[i] : tot, mi = on.msed ? metaDe(2025, m=>m[2]===c) : meta25; return [c, pct1(vi/mi)] });
    } else {
      const v = falta.length ? P.filas.map(()=>tot) : ventaPor(P.col);
      filas = P.filas.map((k,i)=>[k, nf.format(Math.round(v[i]))]);
    }
    const correcto = REL.every(r=>on[r.id]===r.ok) && !dirAmbas;
    const pos = {Ventas:[230,130], Metas:[230,250], Clientes:[70,40], Productos:[390,40], Sedes:[70,250], Calendario:[390,250]};
    const linea = (a,b,id,mal)=>{ const [x1,y1]=pos[a],[x2,y2]=pos[b]; const act = on[id], inact = id==="clised" && ambigua;
      return act?`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${mal?"var(--bad)":"var(--s1)"}" stroke-width="2" ${inact?'stroke-dasharray="5 4"':""}/>`:"" };
    const nodo = (n,h)=>{ const [x,y]=pos[n]; return `<rect x="${x-58}" y="${y-16}" width="116" height="32" rx="8" fill="${h?"var(--s1)":"var(--surface)"}" stroke="var(--line)"/><text x="${x}" y="${y+5}" text-anchor="middle" style="font-size:12px;font-weight:600;fill:${h?"#fff":"var(--ink)"}">${n}</text>` };
    const svg = `<svg viewBox="0 0 460 290" role="img" aria-label="Vista de modelo">
      ${linea("Ventas","Clientes","cli")}${linea("Ventas","Productos","pro")}${linea("Ventas","Sedes","sed")}${linea("Ventas","Calendario","cal")}
      ${linea("Metas","Sedes","msed")}${linea("Metas","Calendario","mcal")}${linea("Clientes","Sedes","clised",true)}${linea("Ventas","Metas","vm",true)}
      ${nodo("Ventas",1)}${nodo("Metas",1)}${nodo("Clientes")}${nodo("Productos")}${nodo("Sedes")}${nodo("Calendario")}</svg>`;
    let msg;
    if(mm) msg = "<b>Ventas ↔ Metas por id_sede</b> es una relación varios a varios entre dos tablas de hechos: cada venta se cruza con las 12 metas de su sede y los totales se inflan. Quítala: las dos tablas se comparan a través de Sedes y Calendario.";
    else if(falta.length && preg!=="cum") msg = `<b>El mismo total en cada fila.</b> Falta la relación ${REL.find(r=>r.id===falta[0]).d}: el filtro de la fila no llega a Ventas.`;
    else if(preg==="cum" && falta.length) msg = `El cumplimiento sale mal porque falta ${falta.map(f=>REL.find(r=>r.id===f).d).join(" y ")}: ${!on.sed?"la venta":"la meta"} no se filtra por sede.`;
    else if(ambigua) msg = "Hay <b>dos caminos</b> de Sedes a Ventas (directo y por Clientes). Power BI deja uno inactivo (línea punteada) y puede no ser el que esperas. Quita Clientes[id_sede] → Sedes.";
    else if(dirAmbas) msg = "La dirección <b>Ambas</b> hace que el filtro también viaje de Ventas hacia Clientes. Solo tiene sentido con un motivo concreto; en un modelo estrella, usa Única.";
    else msg = correcto ? "<b>Modelo estrella correcto.</b> Prueba las cuatro preguntas: todas responden con cifras distintas por fila y el total cuadra con la tabla de control." : "Esta pregunta responde bien. Revisa las demás preguntas y las relaciones que faltan.";
    el.innerHTML = `<div class="stack">
      <p class="read">Así llegó el modelo: Power BI creó algunas relaciones solo. Activa y desactiva relaciones, elige una pregunta y mira qué devuelve la matriz.</p>
      <div class="two" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
        <div class="panel"><span class="eyebrow">Relaciones</span>
          <div class="checklist" style="margin-top:8px">${REL.map(r=>`<label class="${on[r.id]?"done":""}"><input type="checkbox" data-r="${r.id}" ${on[r.id]?"checked":""}> <span class="mono small">${r.d}</span></label>`).join("")}</div>
          <label class="chk" for="s3d" style="margin-top:8px"><input type="checkbox" id="s3d" ${dirAmbas?"checked":""}> Dirección del filtro: Ambas (Ventas–Clientes)</label></div>
        <div class="panel scroll">${svg}</div></div>
      <div class="ctl"><label for="s3p">Pregunta de la matriz<select id="s3p">${Object.entries(PREG).map(([k,p])=>`<option value="${k}">${p.t}</option>`).join("")}</select></label></div>
      <div class="sheetwrap"><table class="sheet"><thead><tr><th>${P.col}</th><th>${preg==="cum"?"Cumplimiento":"Venta neta"}</th></tr></thead><tbody>
        ${filas.map(f=>`<tr><td>${f[0]}</td><td class="num">${f[1]}</td></tr>`).join("")}</tbody></table></div>
      <div class="row"><span class="tag ${correcto?"ok":""}">${REL.filter(r=>on[r.id]===r.ok).length} de ${REL.length} relaciones bien</span></div>
      <div class="insight">${msg}</div></div>`;
    $("#s3p").value=preg; $("#s3p").onchange=e=>{preg=e.target.value;draw()};
    $("#s3d").onchange=e=>{dirAmbas=e.target.checked;draw()};
    el.querySelectorAll("[data-r]").forEach(cb=>cb.onchange=()=>{ on[cb.dataset.r]=cb.checked; draw() });
  };
  draw();
};

/* ---- Clave 4: contexto de filtro ---- */
SIMS[4] = function(el){
  const MED = {
    venta:{n:"Venta neta", f:'Venta neta = CALCULATE(SUM(Ventas[subtotal]), Ventas[estado] <> "Anulada")'},
    suma:{n:"SUM sin CALCULATE", f:"Venta mal = SUM(Ventas[subtotal])"},
    fact:{n:"Facturas", f:'Facturas = CALCULATE(DISTINCTCOUNT(Ventas[id_factura]), Ventas[estado] <> "Anulada")'},
    ticket:{n:"Ticket promedio", f:"Ticket promedio = DIVIDE([Venta neta], [Facturas])"},
    part:{n:"Participación con ALL", f:"Participación = DIVIDE([Venta neta], CALCULATE([Venta neta], ALL(Sedes)))"},
    partmal:{n:"Participación sin ALL", f:"Participación mal = DIVIDE([Venta neta], [Venta neta])"},
    cum:{n:"Cumplimiento (medida)", f:"Cumplimiento = DIVIDE([Venta neta], [Meta])"},
    cumcol:{n:"Cumplimiento (columna sumada)", f:"Cumpl col = columna calculada en una tabla por sede, sumada en el total"},
  };
  const DIMS = {ciudad:"Sedes[ciudad]", canal:"Ventas[canal]", segmento:"Clientes[segmento]"};
  let S = {med:"venta", dim:"ciudad", anio:2025, sel:null};
  const draw = ()=>{
    const yi = anioIdx(S.anio), cats = DM[S.dim], n = cats.length;
    const v = Array(n).fill(0), va = Array(n).fill(0), f = cats.map(()=>new Set()); const fall = new Set(); let vt=0, vat=0;
    for(let i=0;i<NL;i++){ if(C.anio[i]!==yi) continue; const k=C[S.dim][i]; va[k]+=C.subtotal[i]; vat+=C.subtotal[i];
      if(C.estado[i]===2) continue; v[k]+=C.subtotal[i]; vt+=C.subtotal[i]; f[k].add(C.factura[i]); fall.add(C.factura[i]) }
    const metaT = metaDe(S.anio), meta = cats.map(c=> S.dim==="ciudad" ? metaDe(S.anio, m=>m[2]===c) : metaT);
    const val = (i)=>{ const tot = i===-1;
      const V = tot?vt:v[i], F = tot?fall.size:f[i].size, M = tot?metaT:meta[i];
      switch(S.med){
        case "venta": return nf.format(V);
        case "suma": return nf.format(tot?vat:va[i]);
        case "fact": return nf.format(F);
        case "ticket": return nf.format(Math.round(V/F));
        case "part": return pct1(V/vt);
        case "partmal": return pct1(1);
        case "cum": return pct1(V/M);
        case "cumcol": return tot ? pct1(cats.reduce((a,_,j)=>a+v[j]/meta[j],0)) : pct1(V/M);
      } };
    const ctx = S.sel===null ? null : S.sel===-1 ? `Año = ${S.anio}` : `Año = ${S.anio} · ${DIMS[S.dim]} = ${cats[S.sel]}`;
    let msg;
    if(S.med==="suma") msg = `Sin CALCULATE se suman las facturas anuladas: el total es ${nf.format(vat)}, ${nf.format(vat-vt)} más que la venta neta de la tabla de control.`;
    else if(S.med==="partmal") msg = "Sin ALL, el denominador tiene el mismo filtro que el numerador: cada fila se divide por sí misma y da 100 %.";
    else if(S.med==="cumcol") msg = S.dim==="ciudad" ? "Las filas se ven bien, pero el total <b>suma porcentajes</b>. Una medida divide la venta total entre la meta total." : "Metas no tiene canal ni segmento: cada fila divide su venta entre la meta total. Así se ve una columna que no tiene sentido fuera de su tabla.";
    else if(S.med==="cum" && S.dim!=="ciudad") msg = "Metas no tiene canal ni segmento: en estas filas la meta es la del año completo. El cumplimiento solo tiene sentido por sede o por mes.";
    else if(S.med==="part") msg = "ALL(Sedes) quita el filtro de sede del denominador: cada fila se divide por el total y la columna suma 100 %."+(S.dim!=="ciudad"?" Ojo: con canales en filas, ALL(Sedes) no quita el filtro de canal; necesitarías ALL(Ventas[canal]).":"");
    else msg = "Haz clic en una celda para ver su contexto de filtro. El total no es la suma de las filas: es la misma medida calculada con menos filtros.";
    el.innerHTML = `<div class="stack">
      <p class="read">Una matriz de Power BI con una segmentación de año. Elige la medida y las filas, y haz clic en cualquier celda para ver con qué filtros se calcula.</p>
      <div class="ctl"><label for="s4m">Medida<select id="s4m">${Object.entries(MED).map(([k,m])=>`<option value="${k}">${m.n}</option>`).join("")}</select></label>
        <label for="s4d">Filas<select id="s4d">${Object.entries(DIMS).map(([k,d])=>`<option value="${k}">${d}</option>`).join("")}</select></label>
        <label for="s4a">Segmentación: año<select id="s4a"><option>2024</option><option>2025</option></select></label></div>
      ${fxbar("Medida", `<span class="mono">${esc(MED[S.med].f)}</span>`)}
      <div class="sheetwrap"><table class="sheet"><thead><tr><th>${DIMS[S.dim]}</th><th>${MED[S.med].n}</th></tr></thead><tbody>
        ${cats.map((c,i)=>`<tr><td>${c}</td><td class="num" data-c="${i}" style="cursor:pointer;${S.sel===i?"outline:2px solid var(--s2);outline-offset:-2px":""}">${val(i)}</td></tr>`).join("")}
        <tr><td><b>Total</b></td><td class="num" data-c="-1" style="cursor:pointer;font-weight:600;${S.sel===-1?"outline:2px solid var(--s2);outline-offset:-2px":""}">${val(-1)}</td></tr></tbody></table></div>
      ${ctx?`<div class="callout"><span class="k">Contexto de filtro de la celda</span><p class="mono">${esc(ctx)}</p></div>`:""}
      <div class="insight">${msg}</div></div>`;
    $("#s4m").value=S.med; $("#s4d").value=S.dim; $("#s4a").value=S.anio;
    $("#s4m").onchange=e=>{S.med=e.target.value;draw()}; $("#s4d").onchange=e=>{S.dim=e.target.value;S.sel=null;draw()}; $("#s4a").onchange=e=>{S.anio=+e.target.value;draw()};
    el.querySelectorAll("[data-c]").forEach(td=>td.onclick=()=>{ S.sel=+td.dataset.c; draw() });
  };
  draw();
};

/* ---- Clave 6: pregunta → visual ---- */
SIMS[6] = function(el){
  const y25 = anioIdx(2025), ctl = X.control["Año 2025"], cs = X.control_sede;
  const mes = Array(12).fill(0), canal = DM.canal.map(()=>0);
  for(let i=0;i<NL;i++){ if(C.anio[i]!==y25||C.estado[i]===2) continue; mes[C.mes[i]]+=C.subtotal[i]; canal[C.canal[i]]+=C.subtotal[i] }
  const metaMes = MESES.map((_,m)=>metaDe(2025, x=>x[1]===m+1));
  const VIS = ["Tarjeta","Barras","Líneas","Torta","Matriz","Segmentación","Velocímetro"];
  const PREG = [
    {q:"¿Cuánto vendimos en 2025?", ok:["Tarjeta"], tab:"Venta neta en <b>Texto</b> de una hoja, con formato grande."},
    {q:"¿Qué sedes cumplieron la meta?", ok:["Barras"], tab:"ciudad en <b>Filas</b>, Cumplimiento en <b>Columnas</b>, ordenar descendente y una línea de referencia en 1."},
    {q:"¿Cómo fue la venta mes a mes frente a la meta?", ok:["Líneas"], tab:"MONTH(fecha) en <b>Columnas</b>, Venta neta y Meta en <b>Filas</b> con <b>Ejes combinados</b>, marca Línea."},
    {q:"¿Cuánto pesa cada canal en la venta?", ok:["Barras","Torta"], tab:"canal en <b>Filas</b>, Venta neta en Columnas con <b>Porcentaje del total</b>. Con 3 partes, una torta también se lee."},
    {q:"¿Cuál es el detalle por sede y categoría?", ok:["Matriz"], tab:"ciudad en Filas, categoría en Columnas y Venta neta en <b>Texto</b> (tabla de texto)."},
    {q:"¿Cómo filtra el comité por canal?", ok:["Segmentación"], tab:"canal en <b>Filtros</b> y <b>Mostrar filtro</b>; en el dashboard, <b>Usar como filtro</b>."},
  ];
  let S = {p:0, elegido:{}};
  const prev = (v)=>{
    const items = Object.entries(cs).map(([k,d])=>({k, v:d["Cumplimiento"]})).sort((a,b)=>b.v-a.v);
    switch(v){
      case "Tarjeta": return `<div style="text-align:center;padding:18px 0"><div style="font-size:2rem;font-weight:700">${mill(ctl["Venta neta"])}</div><div class="muted small">Venta neta 2025</div></div>`;
      case "Barras": return S.p===3 ? G.barrasH(DM.canal.map((c,i)=>({k:c, v:canal[i]/ctl["Venta neta"]})).sort((a,b)=>b.v-a.v),{fmt:pct1, label:"Participación por canal"}) : G.barrasH(items,{fmt:pct1, label:"Cumplimiento por sede"});
      case "Líneas": return G.lineas(MESES, [{n:"Venta", v:mes.map(x=>x/1e6)},{n:"Meta", v:metaMes.map(x=>x/1e6), c:"var(--s0)"}], {fmt:v=>nf.format(Math.round(v)), label:"Venta y meta mensual"});
      case "Torta": return S.p===3 ? G.dona(DM.canal.map((c,i)=>({k:c, v:canal[i]})),{centro:"3 canales", label:"Venta por canal"}) : G.dona(Object.entries(cs).map(([k,d])=>({k, v:d["Venta neta"]})),{centro:"6 sedes", label:"Torta de venta por sede"});
      case "Matriz": return `<div class="sheetwrap"><table class="sheet"><tr><td class="hd">Sede</td><td class="hd">Venta neta</td><td class="hd">Cumplimiento</td></tr>${Object.entries(cs).map(([k,d])=>`<tr><td>${k}</td><td class="num">${nf.format(d["Venta neta"])}</td><td class="num">${pct1(d["Cumplimiento"])}</td></tr>`).join("")}</table></div>`;
      case "Segmentación": return `<div class="row" style="padding:14px 0">${DM.canal.map((c,i)=>`<span class="tag" style="${i===0?"background:var(--s1);color:#fff;border-color:var(--s1)":""}">${c}</span>`).join("")}</div>`;
      case "Velocímetro": return `<svg viewBox="0 0 200 110" role="img" aria-label="Velocímetro"><path d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke="var(--surface-2)" stroke-width="18"/><path d="M20,100 A80,80 0 0 1 ${100+80*Math.cos(Math.PI*(1-ctl["Cumplimiento"]))},${100-80*Math.sin(Math.PI*(1-ctl["Cumplimiento"]))}" fill="none" stroke="var(--s1)" stroke-width="18"/><text x="100" y="96" text-anchor="middle" style="font-size:18px;font-weight:700;fill:var(--ink)">${pct1(ctl["Cumplimiento"])}</text></svg>`;
    } };
  const draw = ()=>{
    const P = PREG[S.p], v = S.elegido[S.p], bien = v && P.ok.includes(v);
    const hechas = PREG.filter((p,i)=>S.elegido[i] && p.ok.includes(S.elegido[i])).length;
    el.innerHTML = `<div class="stack">
      <p class="read">El comité tiene seis preguntas. Elige una, luego el visual que la responde mejor y mira la vista previa. Cuando aciertes, verás cómo se hace lo mismo en Tableau.</p>
      <div class="chips">${PREG.map((p,i)=>`<button type="button" class="chip" data-p="${i}" aria-pressed="${i===S.p}" style="${S.elegido[i]&&p.ok.includes(S.elegido[i])?"border-color:var(--good)":""}">${i+1}. ${p.q}</button>`).join("")}</div>
      <div class="panel"><b>${P.q}</b><div class="row" style="margin-top:10px">${VIS.map(x=>`<button type="button" class="btn ${v===x?"primary":""}" data-v="${x}">${x}</button>`).join("")}</div></div>
      ${v?`<div class="two"><div class="panel">${prev(v)}</div><div class="stack">
        <div class="callout ${bien?"good":"gap"}"><span class="k">${bien?"Responde la pregunta":"No es la mejor opción"}</span><p>${bien?"":`Para esta pregunta conviene: <b>${P.ok.join(" o ")}</b>. `}${v==="Velocímetro"?"Un velocímetro ocupa mucho espacio para una sola cifra y no muestra contra qué se compara.":v==="Torta"&&S.p!==3?"Con seis partes parecidas, el ojo no compara ángulos.":bien?"Este visual responde sin explicación adicional.":"Este visual responde otra pregunta."}</p></div>
        ${bien?`<div class="callout tip"><span class="k">En Tableau</span><p>${P.tab}</p></div>`:""}</div></div>`:""}
      <div class="row"><span class="tag ${hechas===6?"ok":""}">${hechas} de 6 preguntas con su visual</span></div>
      <div class="insight">${hechas===6?"La página del comité está completa: tres tarjetas o cifras, la comparación, la evolución, el detalle y el filtro. Es la página que armas en Power BI en la sección siguiente.":"Avanza pregunta por pregunta. La página final tendrá un visual por pregunta."}</div></div>`;
    el.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{ S.p=+b.dataset.p; draw() });
    el.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{ S.elegido[S.p]=b.dataset.v; draw() });
  };
  draw();
};
