/* ======================================================================
   CONTENIDO · Laboratorio Power BI + Tableau: talleres guiados P0 a P3
   Cada paso tiene un punto de control («Debes ver…») con cifras de control.
   ====================================================================== */
const CSV = f => `https://raw.githubusercontent.com/${REPO}/main/data/${f}`;
const ctl25 = () => X.control["Año 2025"], ctlEne = () => X.control["Enero 2026 (Taller 2)"];

const TALLERES = [
 {n:0, t:"Monta tu laboratorio", sub:"Power BI Desktop, Tableau Public y los datos listos en 25 minutos", min:25, nivel:"Inicial",
  her:"Power BI Desktop · Tableau Public", ent:"Captura de Power BI con la tabla Ventas cargada (17.106 filas)",
  obj:"Instalar las dos herramientas, crear tu cuenta de Tableau Public y comprobar que los datos de Distribuidora Andina cargan bien. Son los mismos datos del curso de Excel: si ya lo hiciste, conoces la empresa.",
  antes:["Haber visto las <a href=\"#herramientas\">fichas de las herramientas</a> (5 minutos).","Computador con Windows 10 u 11 para Power BI Desktop. Tableau Public funciona en Windows y Mac.","Permiso para instalar programas (en salas de cómputo, pídelo con anticipación).","Un correo para la cuenta de Tableau Public.","Conexión a internet."],
  pasos:[
   {h:"Carpeta", t:"Crea la carpeta del laboratorio", d:`En tu computador: <code>Laboratorio_Analista</code> con tres subcarpetas:<pre class="code">Laboratorio_Analista/
├── 1_datos      ← los CSV de Distribuidora Andina
├── 2_powerbi    ← tus archivos .pbix
└── 3_tableau    ← tus libros de Tableau (.twbx)</pre>`, ck:"Ves las tres subcarpetas."},
   {h:"Datos", t:"Descarga los CSV", d:`Descarga y guarda en <code>1_datos</code>: ${["ventas.csv","clientes.csv","productos.csv","vendedores.csv","sedes.csv","metas.csv"].map(f=>`<a href="${CSV(f)}">${f}</a>`).join(", ")}. Y para el Taller 2: <a href="${CSV("nuevo_mes/ventas_2026_01.csv")}">ventas_2026_01.csv</a> y <a href="${CSV("nuevo_mes/metas_2026_01.csv")}">metas_2026_01.csv</a>. Si el navegador abre el texto en lugar de descargar: clic derecho › Guardar como.`, ck:"Hay 8 archivos .csv en 1_datos."},
   {h:"Power BI", t:"Instala Power BI Desktop", d:`Desde la <b>Microsoft Store</b> busca «Power BI Desktop» e instálalo (se actualiza solo). Al abrir, si pide iniciar sesión, puedes cerrar esa ventana: para el curso no es obligatorio.`, ck:"Se abre Power BI Desktop con el lienzo en blanco."},
   {h:"Power BI", t:"Revisa el idioma y los separadores", d:`<b>Archivo › Opciones y configuración › Opciones</b>. En <b>Configuración regional</b> revisa el idioma de la aplicación (español) y cómo se separan los argumentos de DAX. En el curso las fórmulas usan coma (<code>,</code>); si tu Power BI espera punto y coma (<code>;</code>), cambia la opción de separadores de DAX o escribe con punto y coma.`, ck:"Los menús están en español."},
   {h:"Power BI", t:"Carga Ventas y comprueba", d:`<b>Inicio › Obtener datos › Texto o CSV</b> › <code>ventas.csv</code> › <b>Cargar</b>. Luego, en la <b>vista de tabla</b> (segundo icono a la izquierda), mira el contador de filas abajo a la izquierda. Guarda como <code>2_powerbi/Andina_P0.pbix</code>.`, ck:"Abajo dice 17.106 filas en la tabla ventas."},
   {h:"Tableau", t:"Crea tu cuenta y descarga Tableau Public", d:`En <a href="https://public.tableau.com" target="_blank" rel="noopener">public.tableau.com</a> crea tu cuenta (usa tu nombre real: será tu portafolio) y descarga <b>Tableau Public</b> para escritorio.`, ck:"Inicias sesión y ves tu perfil vacío."},
   {h:"Tableau", t:"Conecta ventas.csv en Tableau", d:`Abre Tableau Public › <b>Conectar › Archivo de texto</b> › <code>ventas.csv</code>. Ve a <b>Hoja 1</b> y arrastra <code>subtotal</code> a <b>Texto</b>.`, ck:"Ves la suma total de subtotal (incluye anuladas: aún no hemos filtrado)."},
  ],
  errores:[["No puedo instalar Power BI","El equipo no permite instalar o no es Windows.","Pide al administrador de la sala la instalación, o haz el curso en Tableau Public (plan B en cada clave)."],
           ["Los números salen con puntos y comas cambiados","Configuración regional del CSV.","En Power Query, cambia el tipo con <b>Usar configuración regional › Inglés (Estados Unidos)</b>: los CSV usan punto decimal."],
           ["Las tildes salen mal (Bogotá → BogotÃ¡)","Codificación del archivo.","En la ventana de vista previa elige <b>Origen del archivo: 65001: Unicode (UTF-8)</b>."]],
  reto:"Carga también clientes.csv y cuenta cuántos clientes hay (debes ver 420 filas).",
  docente:{duracion:[["Por qué dos herramientas",5,"Power BI es lo que piden las vacantes; Tableau Public es la vitrina del portafolio."],["Instalación y carga",20,"Nadie avanza sin ver 17.106 filas."]],
   errores:["Salas sin permisos de instalación: tramita antes la instalación.","Equipos Mac: asigna el plan B en Tableau o trabajo en parejas."],cierre:"Si todos ven 17.106 filas, el modelo de la próxima sesión arranca sin fricción."}},

 {n:1, t:"Del CSV al modelo", sub:"Modelo estrella, tabla de fechas y seis medidas que cuadran", min:90, nivel:"Intermedio",
  her:"Power BI Desktop · Colab", ent:"Andina_modelo.pbix con seis tarjetas iguales a la tabla de control", nb:"04_medidas_dax.ipynb",
  obj:"Construir el modelo que usarás en todo el curso: las seis tablas relacionadas en estrella, la tabla Calendario y las seis medidas base. El cuaderno de Colab calcula las mismas cifras para que compruebes tu trabajo.",
  antes:["Taller 0 terminado.","Claves 3 y 4 estudiadas (o abiertas al lado)."],
  pasos:[
   {h:"Power Query", t:"Carga las seis tablas", d:`<b>Obtener datos › Texto o CSV</b> para cada archivo. Antes de cargar, pulsa <b>Transformar datos</b> y revisa los tipos: fechas como Fecha, montos como Número entero. Renombra las consultas: Ventas, Clientes, Productos, Vendedores, Sedes, Metas. <b>Cerrar y aplicar</b>.`, ck:"En el panel Datos ves seis tablas."},
   {h:"DAX", t:"Crea la tabla Calendario", d:`<b>Modelado › Nueva tabla</b>:<pre class="code">Calendario = ADDCOLUMNS(CALENDAR(DATE(2024,1,1), DATE(2026,12,31)), "Año", YEAR([Date]), "Mes", MONTH([Date]))</pre>Luego <b>Marcar como tabla de fechas</b> con la columna Date.`, ck:"La tabla Calendario tiene 1.096 filas."},
   {h:"DAX", t:"Agrega fecha_mes a Metas", d:`Seleccionada la tabla Metas: <b>Nueva columna</b> <code>fecha_mes = DATE(Metas[anio], Metas[mes], 1)</code>.`, ck:"Metas tiene una columna de fechas, todas el día 1."},
   {h:"Modelo", t:"Relaciona en estrella", d:`Vista de modelo: borra las relaciones automáticas que no correspondan y crea las siete de la clave 3 (cinco desde Ventas, dos desde Metas), todas varios a uno y dirección única.`, ck:"Ves Ventas y Metas al centro y ninguna línea punteada."},
   {h:"DAX", t:"Crea las seis medidas", d:`En una tabla <code>_Medidas</code> (Inicio › Especificar datos): Venta neta, Meta, Cumplimiento, Facturas, Ticket promedio y Participación, como en la clave 4.`, ck:"Las seis medidas aparecen con el icono de calculadora."},
   {h:"Control", t:"Compara con la tabla de control", d:`Cuatro tarjetas y una segmentación de Calendario[Año]. Con 2025 deben dar: venta neta <b>${nf.format(ctl25()["Venta neta"])}</b>, cumplimiento <b>${pct1(ctl25()["Cumplimiento"])}</b>, facturas <b>${nf.format(ctl25()["Facturas"])}</b> y ticket promedio <b>${nf.format(Math.round(ctl25()["Ticket promedio"]))}</b>. Abre el cuaderno 04 para ver las demás combinaciones.`, ck:"Las cuatro tarjetas coinciden con la tabla de control."},
  ],
  errores:[["Venta neta da más de lo esperado","Falta el filtro de estado.","Revisa CALCULATE(…, Ventas[estado] <> \"Anulada\")."],
           ["Cumplimiento sale vacío","Metas no está relacionada con Calendario o Sedes.","Revisa fecha_mes y las dos relaciones de Metas."],
           ["La segmentación de año no filtra Metas","La segmentación usa Ventas[fecha] en lugar de Calendario.","Usa siempre Calendario[Año] en segmentaciones y ejes."]],
  reto:"Crea la medida Margen % = DIVIDE(CALCULATE(SUM(Ventas[margen_bruto]), Ventas[estado] <> \"Anulada\"), [Venta neta]). En 2025 debe dar 19,5 %.",
  docente:{duracion:[["Carga y calendario",25,"Revisar tipos antes de cargar."],["Relaciones",25,"Proyectar la vista de modelo de cada grupo."],["Medidas y control",40,"Nadie termina sin las cuatro tarjetas iguales a la tabla de control."]],
   errores:["Segmentación por Ventas[fecha] en lugar de Calendario.","Relaciones automáticas sin revisar."],cierre:"Un modelo que cuadra con la tabla de control es la base de cualquier tablero."}},

 {n:2, t:"Tablero del comité", sub:"La página del cierre 2025 y la actualización con enero de 2026", min:90, nivel:"Intermedio",
  her:"Power BI Desktop", ent:"Andina_comite.pbix y captura de la página con enero de 2026", nb:"06_informe_que_responde.ipynb",
  obj:"Diseñar la página del comité con las preguntas de la clave 6 y luego actualizarla con un mes nuevo, como pasa cada mes en una empresa. La cifra de control de enero de 2026 te dice si tu proceso funciona.",
  antes:["Taller 1 terminado: Andina_modelo.pbix con las seis medidas que cuadran."],
  pasos:[
   {h:"Diseño", t:"Escribe las preguntas en la página", d:`Cuadro de texto arriba con las tres preguntas del comité.`, ck:"La página empieza con las preguntas."},
   {h:"Visuales", t:"Arma la página", d:`Tres tarjetas, barras de cumplimiento por sede (ordenadas, con formato condicional), línea mensual de venta y meta, y una segmentación por canal.`, ck:"Con 2025, Barranquilla aparece al final de las barras con 87,7 %."},
   {h:"Power Query", t:"Anexa enero de 2026", d:`<b>Transformar datos</b> › <b>Nuevo origen › Texto o CSV</b> › <code>ventas_2026_01.csv</code>. Selecciona la consulta Ventas › <b>Anexar consultas</b> › elige la nueva. Haz lo mismo con <code>metas_2026_01.csv</code> en Metas. <b>Cerrar y aplicar</b>.`, ck:"Ventas tiene 18.020 filas."},
   {h:"Control", t:"Filtra enero de 2026 y compara", d:`Segmentación Año = 2026. Debes ver venta neta <b>${nf.format(ctlEne()["Venta neta"])}</b> y cumplimiento <b>${pct1(ctlEne()["Cumplimiento"])}</b>.`, ck:"Las dos tarjetas coinciden con la cifra de control de enero."},
   {h:"Narrativa", t:"Cambia el título por el hallazgo", d:`Reemplaza las preguntas por un título que diga qué pasó en enero, con su cifra.`, ck:"El título tiene una cifra y una conclusión."},
  ],
  errores:[["Enero no aparece","El Calendario termina antes o el anexo no se aplicó.","Revisa que CALENDAR llegue a 2026 y vuelve a Cerrar y aplicar."],
           ["La venta de enero es mayor que la cifra de control","Se anexó dos veces el mismo archivo.","En Power Query, revisa los pasos aplicados de Ventas."]],
  reto:"Agrega una página de detalle por sede con obtención de detalles desde las barras (clave 7).",
  docente:{duracion:[["Diseño de la página",45,"Revisar contra la clave 6."],["Actualización",30,"El momento clave: la cifra de enero."],["Presentación",15,"Dos minutos por grupo."]],
   errores:["Anexar en lugar de reemplazar, o al revés.","Títulos que describen el tema en vez del hallazgo."],cierre:"Actualizar el mes siguiente es lo que hace valioso un tablero."}},

 {n:3, t:"Portafolio en Tableau Public", sub:"El mismo tablero, publicado con tu nombre", min:60, nivel:"Intermedio",
  her:"Tableau Public", ent:"Enlace público al dashboard y texto para la hoja de vida",
  obj:"Reconstruir en Tableau el tablero del comité y publicarlo en tu perfil. Es la prueba visible de lo que sabes hacer: un enlace que va en la hoja de vida y en LinkedIn.",
  antes:["Taller 2 terminado (sabes qué preguntas responde el tablero).","Cuenta de Tableau Public creada en el Taller 0."],
  pasos:[
   {h:"Datos", t:"Conecta y relaciona", d:`Conecta ventas.csv y arrastra clientes, productos y sedes al lienzo. Revisa las llaves de cada relación.`, ck:"Ves las cuatro tablas unidas con líneas en el lienzo."},
   {h:"Cálculo", t:"Crea Venta neta", d:`Campo calculado: <code>SUM(IF [estado] &lt;&gt; "Anulada" THEN [subtotal] END)</code>. Filtra el año 2025.`, ck:`Muestra ${nf.format(ctl25()["Venta neta"])}.`},
   {h:"Hojas", t:"Una hoja por pregunta", d:`Hoja «Venta 2025» (cifra), hoja «Venta por sede» (barras ordenadas) y hoja «Venta mensual» (línea).`, ck:"Tres hojas con títulos que dicen el hallazgo."},
   {h:"Dashboard", t:"Arma el dashboard", d:`Nuevo dashboard de 1200 × 800, arrastra las hojas, agrega el filtro de canal y actívalo en todas las hojas.`, ck:"Al cambiar el canal se filtran las tres hojas."},
   {h:"Publicar", t:"Publica en tu perfil", d:`<b>Archivo › Guardar en Tableau Public</b>. En la descripción escribe: «Datos ficticios de una empresa simulada (Distribuidora Andina), curso Analista de datos · Dr. Bits».`, ck:"Tienes un enlace público que abre tu dashboard."},
   {h:"Portafolio", t:"Prepara tu presentación", d:`Escribe la línea para la hoja de vida y practica la explicación de dos minutos con la plantilla de abajo.`, ck:"Puedes explicar en dos minutos qué pregunta responde y qué decidiste."},
  ],
  plantilla:`LÍNEA PARA LA HOJA DE VIDA
Tablero comercial (Power BI y Tableau): modelo estrella de 7 tablas, 6 medidas DAX validadas con cifras de control y actualización mensual. [ENLACE A TABLEAU PUBLIC]

EXPLICACIÓN DE DOS MINUTOS
1. La pregunta: el comité necesitaba saber [QUÉ].
2. Los datos: [CUÁNTAS] filas de ventas, clientes, productos, sedes y metas.
3. El modelo: modelo estrella; las medidas excluyen facturas anuladas y las verifiqué contra cifras de control.
4. El hallazgo: [EL HALLAZGO CON SU CIFRA].
5. Lo que haría después: [SIGUIENTE PASO].`,
  errores:[["No aparece «Guardar en Tableau Public»","No iniciaste sesión.","Archivo › Iniciar sesión en Tableau Public."],
           ["Me preocupa publicar datos","Todo en Tableau Public es público.","Publica solo datos ficticios o públicos, nunca datos de una empresa."]],
  reto:"Agrega a tu perfil una historia (story) de tres pasos que explique el hallazgo de enero de 2026.",
  docente:{duracion:[["Reconstruir en Tableau",35,"Comparar decisiones con Power BI."],["Publicar y presentar",25,"Cada estudiante presenta su enlace en dos minutos."]],
   errores:["Publicar sin la aclaración de datos ficticios.","Dashboards sin filtro activo en todas las hojas."],cierre:"Su enlace es su carta de presentación: que explique una decisión, no solo que se vea bonito."}},
];

function viewLaboratorio(){
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><span class="eyebrow">Laboratorio · Talleres guiados</span><h1>Power BI + Tableau: del CSV al portafolio</h1>
      <p class="muted read" style="font-size:1.1rem">Cuatro talleres para construir el proceso completo de un analista de datos: preparar, modelar, comunicar, actualizar y mostrar tu trabajo. Cada paso tiene un punto de control con cifras que debes ver si vas bien.</p></div>
    ${docenteBox({duracion:[["Sesión 1",25,"Taller P0."],["Sesión 2",90,"Taller P1."],["Sesión 3",90,"Taller P2."],["Sesión 4",60,"Taller P3 con presentaciones."]],
      preguntas:["¿Qué hace cada herramienta mejor que la otra?"],cierre:"El objetivo no es la herramienta: es un proceso repetible que produce decisiones y un portafolio que lo demuestra."})}
    <section class="block" style="border-top:0; padding-top:0"><div class="sechead"><h2>Qué aporta cada herramienta</h2></div>
      <div class="scroll"><table class="datatbl"><tr><th></th><th>Power BI Desktop</th><th>Tableau Public</th><th>Colab</th></tr>
        <tr><td><b>Para qué en el curso</b></td><td>El modelo, las medidas y el tablero que piden las empresas.</td><td>Tu portafolio público con enlace.</td><td>Verificar las cifras con cálculos independientes.</td></tr>
        <tr><td><b>Costo</b></td><td>Gratis para crear. Compartir en la empresa requiere licencia.</td><td>Gratis; todo lo publicado es público.</td><td>Gratis.</td></tr>
        <tr><td><b>Equipo</b></td><td>Windows.</td><td>Windows o Mac.</td><td>Navegador.</td></tr></table></div></section>
    <section class="block" style="padding-bottom:40px"><div class="sechead"><h2>Los talleres</h2><p class="muted read">Hazlos en orden. Cada uno usa lo que produjo el anterior.</p></div>
      <div class="grid2">${TALLERES.map(x=>`<a class="tcard" href="#taller-${x.n}"><span class="tn">Taller P${x.n} · ${x.min} min · ${x.nivel}</span><h3>${x.t}</h3><p>${x.sub}</p>
        <div class="tags"><span class="tag">${x.her}</span>${pasosHechos(x)?`<span class="tag ok">${pasosHechos(x)} de ${x.pasos.length} pasos</span>`:""}</div><span class="small"><b>Entregable:</b> ${esc(x.ent)}</span></a>`).join("")}</div>
    </section></div>`;
}
function pasosHechos(x){ const st=PROG.check["taller-"+x.n]||{}; return Object.values(st).filter(Boolean).length }

function viewTaller(n){
  const x = TALLERES[n]; if(!x){ location.hash="#laboratorio"; return }
  const sig = TALLERES[n+1];
  app.innerHTML = `<div class="wrap">
    <div class="mhead"><a href="#laboratorio" class="muted small">← Laboratorio</a>
      <span class="eyebrow">Taller P${x.n} de P3</span><h1>${x.t}</h1><p class="muted" style="font-size:1.1rem">${x.sub}</p>
      <div class="taller-meta"><div><span>Duración</span>${x.min} min</div><div><span>Nivel</span>${x.nivel}</div><div><span>Herramientas</span>${x.her}</div><div><span>Entregable</span>${esc(x.ent)}</div></div></div>
    <div class="stack read" style="max-width:860px; padding-bottom:40px; gap:22px">
      ${docenteBox(x.docente)}
      <p style="font-size:1.05rem">${x.obj}</p>
      <div class="callout"><span class="k">Antes de empezar</span><ul class="plain">${x.antes.map(a=>`<li>${a}</li>`).join("")}</ul></div>
      <div><h2 style="margin-bottom:14px">Paso a paso</h2>
        <ol class="steps">${x.pasos.map(p=>`<li><div><span class="eyebrow">${p.h}</span><b>${p.t}</b><span>${p.d}</span><div class="checkpoint"><b>Debes ver:</b> ${p.ck}</div></div></li>`).join("")}</ol></div>
      ${x.plantilla?`<div><h3 style="margin-bottom:8px">Plantilla</h3>${promptsHTML([{t:"Copia y completa",p:x.plantilla}],"pl")}</div>`:""}
      <div><h3 style="margin-bottom:8px">Si algo falla</h3><div class="scroll"><table class="datatbl"><tr><th>Lo que pasa</th><th>Por qué</th><th>Qué hacer</th></tr>${x.errores.map(e=>`<tr><td><b>${e[0]}</b></td><td>${e[1]}</td><td>${e[2]}</td></tr>`).join("")}</table></div></div>
      <div class="callout good"><span class="k">Reto de extensión</span><p>${x.reto}</p></div>
      <div><h3 style="margin-bottom:8px">Mi avance</h3>${checklistHTML("taller-"+x.n, x.pasos.map(p=>p.t))}<p class="muted small" style="margin-top:6px">Se guarda en este navegador.</p></div>
      <div class="row">${x.nb?`<a class="btn primary" href="${colabURL(x.nb)}" target="_blank" rel="noopener">Abrir el cuaderno de control</a>`:""}<a class="btn" href="${GH}/blob/main/data/cifras_de_control.md" target="_blank" rel="noopener">Tabla de control</a>${sig?`<a class="btn" href="#taller-${sig.n}">Siguiente: Taller P${sig.n}</a>`:`<a class="btn" href="#laboratorio">Volver al laboratorio</a>`}</div>
    </div></div>`;
  wireCopy(app); wireChecklists(app);
}
