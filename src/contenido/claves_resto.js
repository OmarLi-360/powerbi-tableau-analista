/* ======================================================================
   CONTENIDO · Claves 1, 2 (Preparar), 5 (Modelar), 7 (Comunicar) y 8 (Publicar)
   ====================================================================== */
const ventaMensual = (sede=-1) => { // [año2024[12], año2025[12]] sin anuladas
  const r = [Array(12).fill(0), Array(12).fill(0)];
  for(let i=0;i<NL;i++){ if(C.estado[i]===2) continue; if(sede>=0 && C.ciudad[i]!==sede) continue; r[C.anio[i]][C.mes[i]] += C.subtotal[i] }
  return r;
};

/* ---------------------------------------------------------------------
   CLAVE 1 · Conectar y perfilar
   --------------------------------------------------------------------- */
MOD[1] = {
 minutos:45, notebook:"01_conectar_y_perfilar.ipynb",
 objetivos:["Conectar Power BI a archivos CSV y revisar la vista previa antes de cargar.","Leer la calidad, la distribución y el perfil de cada columna en Power Query.","Corregir tipos en la consulta, no en el informe."],
 entender:`
  <p>Power BI usa el mismo <b>Power Query</b> de Excel. Al conectar un archivo (<b>Inicio › Obtener datos › Texto o CSV</b>) aparece una vista previa con dos botones: <b>Cargar</b> (directo al modelo) y <b>Transformar datos</b> (abre el Editor de Power Query). Un analista casi siempre elige Transformar: primero mira, después carga.</p>
  <p>En el Editor, la pestaña <b>Vista</b> tiene tres casillas que hacen el diagnóstico:</p>
  <ol><li><b>Calidad de columna</b>: porcentaje de valores <b>válidos</b>, con <b>error</b> y <b>vacíos</b>. Un error aparece cuando un valor no encaja en el tipo de la columna, por ejemplo «$ 1.234.567» en una columna numérica.</li>
  <li><b>Distribución de columnas</b>: cuántos valores <b>distintos</b> y <b>únicos</b> hay. Una llave debe tener tantos distintos como filas; una columna como Ciudad debería tener pocos (6 sedes, no 16 variantes).</li>
  <li><b>Perfil de columna</b>: mínimo, máximo, promedio y los valores más frecuentes de la columna seleccionada.</li></ol>
  <p>Ojo: por omisión Power Query <b>perfila solo las primeras 1.000 filas</b>. Para ver todo, haz clic en el texto de la barra inferior y elige <b>Generación de perfiles de columna basada en todo el conjunto de datos</b>.</p>
  <p>Al conectar, Power Query agrega el paso automático <b>Tipo cambiado</b>, que adivina los tipos mirando las primeras filas. Si más abajo hay un valor distinto, ese valor queda como <b>Error</b>. Se corrige en la consulta: limpiar el texto y luego fijar el tipo.</p>`,
 brechaTxt:"Si los datos se cargan sin mirarlos, los problemas aparecen en el tablero: totales cortos, fechas que no agrupan y ciudades repetidas con distintos nombres.",
 pbi:[
  ["Conecta la exportación del ERP", "<b>Inicio › Obtener datos › Texto o CSV</b> › <code>ventas_erp_sucio.csv</code>. En la vista previa, revisa que el <b>Origen del archivo</b> sea <b>65001: Unicode (UTF-8)</b> para que las tildes salgan bien. Pulsa <b>Transformar datos</b>."],
  ["Activa el diagnóstico", "Pestaña <b>Vista</b>: marca <b>Calidad de columna</b>, <b>Distribución de columnas</b> y <b>Perfil de columna</b>. Abajo a la izquierda, cambia a <b>todo el conjunto de datos</b>."],
  ["Lee la calidad", "Observa el porcentaje de error en Fecha y Cantidad, y que Valor Neto quedó como texto (icono ABC). Haz clic en un Error para ver el valor que lo causó."],
  ["Lee la distribución", "Mira Ciudad: muestra 16 valores distintos en lugar de 6. Mira Cod Cliente: hay códigos con espacios o en minúsculas."],
  ["Corrige en la consulta", "Borra el paso <b>Tipo cambiado</b>. En Cantidad y Valor Neto: <b>Reemplazar valores</b> («und», «$», «.») y luego tipo <b>Número entero</b>. En Cod Cliente: <b>Transformar › Formato › Recortar</b> y <b>MAYÚSCULAS</b>. En Fecha: columna personalizada con <code>try Date.FromText([Fecha], [Culture=\"es-CO\"]) otherwise Date.From(Number.From([Fecha]))</code>."],
  ["Comprueba y carga", "La calidad de las columnas corregidas debe estar en 100 % válido (Valor Neto conserva sus vacíos). <b>Inicio › Cerrar y aplicar</b>."],
 ],
 tableau:[
  ["Conecta el archivo", "<b>Conectar › Archivo de texto</b> › <code>ventas_erp_sucio.csv</code>. La pestaña <b>Origen de datos</b> muestra la vista previa con el tipo de cada columna (icono sobre el nombre)."],
  ["Cambia el tipo", "Haz clic en el icono del tipo y elige Número o Fecha. Los valores que no encajan quedan como <b>nulos</b>: Tableau no muestra «Error»."],
  ["Revisa los nulos", "En una hoja, arrastra la columna a Filas: el indicador de valores nulos aparece abajo a la derecha. Para limpiar a fondo se usa Tableau Prep o Power Query antes."],
 ],
 colabQue:"Ves el perfil de cada columna de la exportación como lo muestra Power Query, compara el paso automático de tipos con la corrección, y comprueba que ventas.csv llega limpio.",
 ia:[
  {t:"Interpretar un perfil", p:`En el Editor de Power Query de Power BI, la columna [NOMBRE] muestra: válidos [X] %, errores [Y] %, vacíos [Z] %, [N] valores distintos.
Al hacer clic en un error aparece el valor [VALOR].
Explícame la causa más probable y los pasos en Power Query (menú por menú, en español) para corregirlo.`},
  {t:"Escribir una conversión en M", p:`En Power Query tengo una columna Fecha de texto con tres formatos: dd/mm/aaaa, aaaa-mm-dd y números seriales como 45299.
Escribe una columna personalizada en M que convierta todo a fecha y explica qué hace try … otherwise.`},
 ],
 iaCuidado:"Describe las columnas y pega dos o tres valores de ejemplo, no el archivo completo. Si los datos son de clientes reales, anonimízalos antes.",
 quiz:[
  {q:"Al conectar un CSV, ¿qué conviene hacer primero?",
   o:["Cargar y revisar en el informe","Transformar datos y revisar la calidad de cada columna","Crear las medidas","Publicar"], a:1,
   w:"Primero se mira: el diagnóstico en Power Query evita problemas que después cuestan encontrar en el tablero."},
  {q:"La columna Cantidad muestra 3 % de error. ¿Qué significa?",
   o:["Que faltan datos","Que hay valores que no encajan en el tipo número, como «33 und»","Que hay duplicados","Que la columna está vacía"], a:1,
   w:"Un error es un valor que no se pudo convertir al tipo de la columna. Se corrige limpiando el texto antes de fijar el tipo."},
  {q:"Ciudad muestra 16 valores distintos y la empresa tiene 6 sedes. ¿Qué indica?",
   o:["Nada","Variantes escritas de la misma ciudad que hay que normalizar","Que hay 10 sedes nuevas","Un error de tipo"], a:1,
   w:"La distribución delata variantes como «Bogota», «BOGOTÁ» o «Bogotá D.C.»."},
  {q:"¿Por qué cambiar el perfil a «todo el conjunto de datos»?",
   o:["Para que cargue más rápido","Porque por omisión Power Query perfila solo las primeras 1.000 filas","Para cambiar el tipo","No hace falta"], a:1,
   w:"Un error en la fila 1.500 no aparece en el perfil de las primeras 1.000."},
 ],
 docente:{
  duracion:[["Apertura: cargar sin mirar",5,"Carga el ERP directo y muestra el total corto."],["Simulador de perfil",10,"Comparen el tipo automático con el corregido."],["Power BI: Power Query",25,"Seis pasos con el ERP sucio."],["Autoevaluación",5,"Cuestionario."]],
  preguntas:["¿Qué archivos de su trabajo llegan con estos problemas?","¿Por qué Tableau muestra nulos y Power BI errores?"],
  errores:["No cambiar el perfil a todo el conjunto de datos.","Corregir tipos en el informe con medidas en lugar de en la consulta."],
  cierre:"Primero se mira, después se carga."},
};

/* ---------------------------------------------------------------------
   CLAVE 2 · Transformar para el modelo
   --------------------------------------------------------------------- */
const COLS_PLANA = [
  ["fecha","Ventas",619],["anio","Calendario",2],["mes","Calendario",12],["trimestre","Calendario",4],
  ["id_factura","Ventas",7000],["ciudad","Sedes",6],["region","Sedes",6],["vendedor","Vendedores",18],
  ["cliente","Clientes",397],["segmento","Clientes",4],["canal","Ventas",3],["categoria","Productos",5],
  ["producto","Productos",73],["cantidad","Ventas",300],["subtotal","Ventas",7085],["margen_bruto","Ventas",8489],["estado","Ventas",3],
];
/* celdas aproximadas del modelo según a qué tabla va cada columna (asg: columna → tabla) */
function celdasModelo(asg){
  const n = X.filas.ventas, dims = {Clientes:X.filas.clientes, Productos:X.filas.productos, Sedes:X.filas.sedes, Vendedores:X.filas.vendedores, Calendario:1096};
  const enVentas = COLS_PLANA.filter(c=>asg[c[0]]==="Ventas").length;
  const usadas = Object.keys(dims).filter(d=>COLS_PLANA.some(c=>asg[c[0]]===d));
  const llaves = usadas.filter(d=>d!=="Calendario" || asg.fecha!=="Ventas").length;   // la fecha ya es la llave del Calendario
  return n*(enVentas + llaves) + usadas.reduce((a,d)=>a+dims[d]*(1+COLS_PLANA.filter(c=>asg[c[0]]===d).length),0);
}
MOD[2] = {
 minutos:50, notebook:"02_transformar_para_el_modelo.ipynb",
 objetivos:["Distinguir columnas de hechos y de dimensión.","Crear y marcar la tabla Calendario.","Resolver la diferencia de detalle entre ventas (día) y metas (mes)."],
 entender:`
  <p>En Excel la costumbre es una tabla plana con todo unido. En Power BI conviene lo contrario: <b>separar</b>.</p>
  <ol><li><b>Hechos</b>: lo que pasó, con números que se suman (cantidad, subtotal, margen) y las <b>llaves</b> hacia las dimensiones.</li>
  <li><b>Dimensiones</b>: los atributos que describen (segmento del cliente, categoría del producto, región de la sede). Se guardan una vez por cliente, producto o sede, no en cada venta.</li></ol>
  <p>Una pista práctica: si una columna tiene <b>pocos valores distintos</b> que se repiten miles de veces (segmento: 4 valores en 17.106 filas), probablemente pertenece a una dimensión.</p>
  <p>Todo modelo necesita una tabla <b>Calendario</b> propia, con <b>todos los días</b> sin huecos. Las ventas no ocurren todos los días (domingos y festivos), y las funciones de tiempo de DAX necesitan fechas continuas. Se crea con <code>CALENDAR</code> y se marca con <b>Marcar como tabla de fechas</b>.</p>
  <p>El <b>nivel de detalle</b> (granularidad) importa: las ventas son por día y las metas por mes. Para relacionar Metas con el Calendario se le agrega una columna con el primer día de cada mes (<code>fecha_mes</code>).</p>`,
 brechaTxt:"Una tabla plana repite el segmento, la ciudad y la categoría en cada fila; y sin Calendario, los días sin ventas desaparecen de los gráficos y las funciones de tiempo fallan.",
 pbi:[
  ["Revisa la granularidad", "En la vista de tabla, compara Ventas (una fila por línea de factura y día) con Metas (una fila por sede y mes)."],
  ["Crea el Calendario", "<b>Modelado › Nueva tabla</b>: <code>Calendario = ADDCOLUMNS(CALENDAR(DATE(2024,1,1), DATE(2026,12,31)), \"Año\", YEAR([Date]), \"Mes\", MONTH([Date]), \"Nombre mes\", FORMAT([Date], \"mmm\"), \"Trimestre\", \"T\" & QUARTER([Date]))</code>."],
  ["Márcala como tabla de fechas", "Selecciona Calendario › <b>Herramientas de tabla › Marcar como tabla de fechas</b> › columna Date. Ordena «Nombre mes» por «Mes» (<b>Herramientas de columna › Ordenar por columna</b>)."],
  ["Prepara Metas", "<b>Nueva columna</b> en Metas: <code>fecha_mes = DATE(Metas[anio], Metas[mes], 1)</code>."],
  ["Oculta lo que no se usa", "En la vista de modelo, oculta las llaves de la tabla de hechos (clic derecho › Ocultar en la vista de informe). Quien arme el informe usará las columnas de las dimensiones."],
 ],
 tableau:[
  ["Fechas", "Tableau crea solo la jerarquía de fechas (año, trimestre, mes, día) sobre cualquier campo de fecha. No necesita tabla de calendario."],
  ["Metas por mes", "Para comparar con metas, crea en Metas un campo calculado <code>MAKEDATE([anio], [mes], 1)</code> y relaciónalo con la fecha de ventas a nivel de mes, o usa una combinación de datos por mes."],
 ],
 colabQue:"Ves cuántos días no tienen ventas (y por qué hace falta un Calendario), cuántas celdas se repiten en la tabla plana frente al modelo estrella, y la diferencia de detalle entre ventas y metas.",
 ia:[
  {t:"Separar hechos y dimensiones", p:`Tengo una tabla plana en Power BI con estas columnas: [LISTA DE COLUMNAS].
Propón cómo separarla en una tabla de hechos y dimensiones (modelo estrella): qué columnas van en cada tabla y cuál es la llave de cada dimensión.`},
  {t:"Tabla de fechas", p:`Escribe en DAX una tabla Calendario de 2024 a 2026 con año, mes, nombre del mes en español y trimestre.
Explica por qué hay que marcarla como tabla de fechas y cómo ordenar el nombre del mes.`},
 ],
 iaCuidado:"Pega solo los nombres de columnas, no filas de datos. Verifica la tabla Calendario: debe tener una fila por día (1.096 de 2024 a 2026).",
 quiz:[
  {q:"¿En qué tabla va la columna segmento?",
   o:["Ventas","Clientes","Calendario","Metas"], a:1,
   w:"El segmento describe al cliente: se guarda una vez por cliente, no en cada línea de venta."},
  {q:"¿Por qué se necesita una tabla Calendario aunque Ventas ya tiene fechas?",
   o:["Por estética","Porque las ventas no ocurren todos los días y las funciones de tiempo necesitan fechas continuas","Porque Power BI no lee fechas","Para ocupar menos espacio"], a:1,
   w:"De 731 días de 2024–2025, 112 no tienen ventas. El Calendario los incluye todos."},
  {q:"Metas es mensual y Ventas diaria. ¿Cómo se relaciona Metas con el Calendario?",
   o:["Por la columna mes","Con una columna fecha_mes = primer día del mes","No se puede","Uniéndola con Ventas"], a:1,
   w:"El primer día del mes existe en el Calendario y representa el mes completo."},
  {q:"Una columna con 4 valores distintos en 17.106 filas, probablemente…",
   o:["Es una llave de la tabla de hechos","Pertenece a una dimensión","Es una medida","Debe borrarse"], a:1,
   w:"Pocos valores que se repiten mucho son atributos descriptivos: van en una dimensión."},
 ],
 docente:{
  duracion:[["Apertura: la tabla plana",5,"Muestra la tabla de Andina_listo con 18 columnas repetidas."],["Simulador: ¿a qué tabla va?",12,"Clasifiquen las 17 columnas."],["Power BI: Calendario y metas",25,"Cinco pasos."],["Autoevaluación",8,"Cuestionario."]],
  preguntas:["¿Qué columnas de su trabajo se repiten miles de veces?","¿Qué pasa en un gráfico mensual si un mes no tiene ventas?"],
  errores:["Calendario sin marcar como tabla de fechas.","Nombre del mes ordenado alfabéticamente (abr, ago, dic…)."],
  cierre:"Hechos al centro, dimensiones alrededor y un Calendario sin huecos."},
};

/* ---------------------------------------------------------------------
   CLAVE 5 · Inteligencia de tiempo
   --------------------------------------------------------------------- */
MOD[5] = {
 minutos:50, notebook:"05_inteligencia_de_tiempo.ipynb",
 objetivos:["Crear medidas de acumulado del año y año anterior.","Calcular la variación porcentual de forma segura.","Entender por qué la tabla de fechas marcada es indispensable."],
 entender:`
  <p>Las preguntas de tiempo son las más comunes en un comité: ¿cómo vamos en el año?, ¿cuánto crecimos frente al año pasado? DAX las responde con funciones de <b>inteligencia de tiempo</b>, que funcionan con cualquier filtro (sede, canal, cliente).</p>
  <pre class="code">Venta YTD = TOTALYTD([Venta neta], Calendario[Date])
Venta AA = CALCULATE([Venta neta], SAMEPERIODLASTYEAR(Calendario[Date]))
Var % AA = DIVIDE([Venta neta] - [Venta AA], [Venta AA])
Venta YTD AA = CALCULATE([Venta YTD], SAMEPERIODLASTYEAR(Calendario[Date]))</pre>
  <ol><li><b>TOTALYTD</b> acumula desde el 1 de enero hasta la fecha del contexto.</li>
  <li><b>SAMEPERIODLASTYEAR</b> desplaza el filtro de fechas un año atrás.</li>
  <li><b>DIVIDE</b> evita el error cuando el año anterior no tiene datos.</li></ol>
  <p>Tres condiciones para que funcionen: usar la columna de fechas del <b>Calendario</b> (no la de Ventas), que el Calendario esté <b>marcado como tabla de fechas</b> y que los ejes y segmentaciones usen el Calendario.</p>
  <p>Cuidado con los periodos incompletos: si el año en curso va hasta marzo, el acumulado se compara con enero–marzo del año anterior, no con el año completo.</p>`,
 brechaTxt:"Comparar contra el año anterior copiando cifras a mano funciona una vez; con una medida, la comparación sirve para cualquier sede, canal o mes.",
 pbi:[
  ["Revisa el Calendario", "Debe estar marcado como tabla de fechas y relacionado con Ventas[fecha] y Metas[fecha_mes]."],
  ["Crea las cuatro medidas", "En _Medidas: Venta YTD, Venta AA, Var % AA (formato porcentaje) y Venta YTD AA, como en «Entender»."],
  ["Gráfico de líneas", "Calendario[Mes] en el eje, [Venta YTD] y [Venta YTD AA] en valores, y una segmentación de Calendario[Año] en 2025."],
  ["Matriz por sede", "Sedes[ciudad] en filas; [Venta neta], [Venta AA] y [Var % AA] en valores. Con 2025, la variación total debe dar <b>+18,9 %</b>."],
  ["Formato condicional", "En Var % AA: iconos o color de fondo según el valor (verde si es mayor que el total, gris si no)."],
 ],
 tableau:[
  ["Acumulado", "Venta neta en Filas, MONTH(fecha) en Columnas › clic derecho en la medida › <b>Cálculo rápido de tabla › Total acumulado</b>, calculado a lo largo de la tabla y reiniciado por año."],
  ["Año anterior", "<b>Cálculo rápido de tabla › Diferencia porcentual</b>, relativa a la anterior, a lo largo de YEAR(fecha)."],
 ],
 colabQue:"Ves el acumulado de 2025 contra el de 2024 mes a mes, la variación de cada sede frente al año anterior y la tabla de control de las medidas de tiempo.",
 ia:[
  {t:"Medidas de tiempo", p:`En Power BI tengo la medida [Venta neta] y una tabla Calendario marcada como tabla de fechas (columna Date).
Escribe las medidas de acumulado del año, año anterior y variación porcentual contra el año anterior, y explica qué pasa si uso Ventas[fecha] en lugar de Calendario[Date].`},
  {t:"Explicar un resultado", p:`Mi medida Venta AA sale vacía en todas las filas. Uso: [PEGA LA MEDIDA].
¿Qué revisar en el modelo, en orden?`},
 ],
 iaCuidado:"Comprueba la variación total contra la tabla de control antes de presentarla: un error de contexto puede mostrar un crecimiento que no existe.",
 quiz:[
  {q:"¿Qué hace TOTALYTD([Venta neta], Calendario[Date])?",
   o:["Suma todo el año siempre","Acumula desde el 1 de enero hasta la fecha del contexto","Compara con el año anterior","Promedia los meses"], a:1,
   w:"En marzo, devuelve la venta de enero a marzo del año del contexto."},
  {q:"Venta AA sale vacía. ¿Qué es lo más probable?",
   o:["No hubo ventas el año anterior","La medida usa una columna de fechas que no es la del Calendario marcado","El formato","La segmentación de canal"], a:1,
   w:"Las funciones de tiempo necesitan la columna de un Calendario marcado y relacionado."},
  {q:"¿Por qué usar DIVIDE en Var % AA?",
   o:["Por estilo","Porque el año anterior puede no tener datos y dividir por cero daría error","Para redondear","Para sumar"], a:1,
   w:"En 2024, Venta AA no existe para enero de 2023: DIVIDE devuelve vacío."},
  {q:"El año en curso va hasta marzo. ¿Con qué se compara el acumulado del año?",
   o:["Con el año anterior completo","Con enero a marzo del año anterior","Con el trimestre siguiente","Con la meta anual"], a:1,
   w:"SAMEPERIODLASTYEAR desplaza el mismo periodo un año atrás."},
 ],
 docente:{
  duracion:[["Apertura: la comparación hecha a mano",5,"Muestra una tabla de Excel con el año anterior copiado."],["Simulador",12,"Cambien sede y vista; activen el error del Calendario."],["Power BI: cuatro medidas",25,"Comparar la variación con la tabla de control."],["Autoevaluación",8,"Cuestionario."]],
  preguntas:["¿Qué comparación de tiempo pide su jefe cada mes?","¿Qué pasa con la variación en un mes incompleto?"],
  errores:["Usar Ventas[fecha] en lugar de Calendario[Date].","Segmentación de año desde Ventas."],
  cierre:"Con un Calendario marcado, una medida de tiempo responde para cualquier filtro."},
};

/* ---------------------------------------------------------------------
   CLAVE 7 · Interactividad y narrativa
   --------------------------------------------------------------------- */
MOD[7] = {
 minutos:50, notebook:"07_interactividad_y_narrativa.ipynb",
 objetivos:["Crear una página de detalle con obtención de detalles.","Contar un hallazgo en pasos con marcadores.","Diseñar información sobre herramientas que agregue contexto."],
 entender:`
  <p>La interactividad sirve cuando <b>guía</b> al lector, no cuando lo obliga a explorar al azar. Tres herramientas cubren casi todo:</p>
  <ol><li><b>Obtención de detalles</b> (drillthrough): una página de detalle que recibe un filtro. El lector hace clic derecho en la barra de Cali › <b>Obtener detalles</b> y llega a la página de Cali. Una sola página sirve para las seis sedes.</li>
  <li><b>Marcadores</b>: guardan el estado de la página (filtros, visuales visibles, selección). Con tres marcadores y botones se cuenta una historia: el resultado, el problema, la causa.</li>
  <li><b>Información sobre herramientas</b> (tooltip): lo que aparece al pasar el mouse. Puede ser una pequeña página con contexto: cumplimiento, facturas y tendencia de la sede.</li></ol>
  <p>Además, Power BI tiene un <b>diseño para móvil</b> (Vista › Diseño para móvil) donde se reorganizan los visuales para la pantalla del celular, donde muchos gerentes miran el tablero.</p>
  <p>En Tableau las equivalentes son las <b>acciones de filtro</b>, las <b>historias</b> (story points) y las <b>descripciones emergentes</b>.</p>`,
 brechaTxt:"Seis copias de la misma página, una por sede, multiplican el trabajo: cada cambio hay que hacerlo seis veces y alguna queda distinta.",
 pbi:[
  ["Crea la página de detalle", "Nueva página «Detalle sede». En el panel de Visualizaciones, sección <b>Obtención de detalles</b>, arrastra Sedes[ciudad]. Power BI agrega un botón «Atrás» arriba a la izquierda."],
  ["Llénala", "Tarjetas de venta y cumplimiento, línea mensual de venta contra meta y una tabla con los 10 mejores clientes (filtro <b>N superior</b>)."],
  ["Pruébala", "En la página del comité, clic derecho en la barra de Barranquilla › <b>Obtener detalles › Detalle sede</b>."],
  ["Crea la información sobre herramientas", "Nueva página, en <b>Formato › Información de página</b> activa «Permitir uso como información sobre herramientas» y tamaño «Información sobre herramientas». Pon tres tarjetas. En las barras del comité: <b>Formato › Información sobre herramientas › Página</b> › elige la nueva."],
  ["Cuenta la historia con marcadores", "<b>Vista › Marcadores</b>: guarda «1 Resultado» (sin filtros), «2 El rezago» (Barranquilla seleccionada) y «3 La causa» (página de detalle). Agrega botones (<b>Insertar › Botones › Marcador</b>)."],
  ["Diseño para móvil", "<b>Vista › Diseño para móvil</b>: arrastra primero las tarjetas, luego las barras."],
 ],
 tableau:[
  ["Acción de filtro", "En el dashboard: <b>Dashboard › Acciones › Agregar acción › Filtrar</b>, origen la hoja de sedes y destino la hoja de detalle."],
  ["Historia", "<b>Nueva historia</b>: cada punto es una hoja o dashboard con una leyenda que cuenta el paso."],
  ["Descripción emergente", "En Marcas › Descripción emergente: escribe el texto e inserta campos como Cumplimiento y Facturas."],
 ],
 colabQue:"Recorres la ruta de detalle (empresa → sede → categoría → producto), ves qué información conviene poner en la información sobre herramientas y cómo se reorganiza un tablero para móvil.",
 ia:[
  {t:"Guion de marcadores", p:`Tengo un tablero comercial en Power BI con: cumplimiento por sede, venta mensual y una página de detalle por sede.
El hallazgo es: [HALLAZGO].
Propón un guion de tres marcadores (qué muestra cada uno y qué texto acompaña) para presentarlo al comité en dos minutos.`},
  {t:"Información sobre herramientas", p:`¿Qué tres cifras pondrías en la información sobre herramientas de un gráfico de barras de venta por sede, para que el gerente entienda el contexto sin cambiar de página? Explica por qué.`},
 ],
 iaCuidado:"La IA sugiere estructuras; los textos de los marcadores deben citar las cifras de tu modelo, verificadas.",
 quiz:[
  {q:"¿Para qué sirve la obtención de detalles?",
   o:["Para exportar","Para pasar de un resumen a una página de detalle filtrada por lo que se eligió","Para cambiar colores","Para publicar"], a:1,
   w:"Una sola página de detalle recibe el filtro (por ejemplo, la sede) desde cualquier visual."},
  {q:"¿Qué guarda un marcador?",
   o:["Solo el título","El estado de la página: filtros, selección y visuales visibles","El archivo completo","Las medidas"], a:1,
   w:"Por eso permite contar una historia en pasos."},
  {q:"¿Cuál es el equivalente de los marcadores en Tableau?",
   o:["Hojas","Historias (story points)","Filtros","Extractos"], a:1,
   w:"Una historia es una secuencia de vistas con su leyenda."},
  {q:"¿Por qué no hacer una página por sede?",
   o:["Porque Power BI no lo permite","Porque cada cambio habría que repetirlo seis veces; la obtención de detalles lo resuelve con una","Porque ocupa más memoria","No hay problema"], a:1,
   w:"Una página de detalle sirve para todas las sedes y para las que se abran."},
 ],
 docente:{
  duracion:[["Apertura: seis páginas iguales",5,"Muestra el problema de mantenerlas."],["Simulador",10,"Recorran detalle, marcadores y tooltip."],["Power BI",30,"Seis pasos."],["Autoevaluación",5,"Cuestionario."]],
  preguntas:["¿Qué historia de tres pasos contaría su tablero?","¿Qué ve su jefe desde el celular?"],
  errores:["Olvidar el campo en la sección Obtención de detalles.","Marcadores que guardan filtros que no se querían guardar."],
  cierre:"La interactividad guía; no reemplaza el mensaje."},
};

/* ---------------------------------------------------------------------
   CLAVE 8 · Publicar, gobernar y portafolio
   --------------------------------------------------------------------- */
MOD[8] = {
 minutos:45, notebook:"08_publicar_y_gobernar.ipynb",
 objetivos:["Conocer cómo se publica y comparte en el servicio de Power BI.","Entender la seguridad de nivel de fila (RLS) y probarla en Power BI Desktop.","Decidir qué se puede publicar en Tableau Public y qué no."],
 entender:`
  <p>En la empresa, un informe no se envía por correo: se <b>publica</b> en un <b>área de trabajo</b> del servicio de Power BI (app.powerbi.com). Allí se programa la <b>actualización</b> de los datos y se comparte con quien corresponda. Compartir requiere licencia (Pro o capacidad de la organización); con la cuenta gratuita solo puedes publicar en «Mi área de trabajo» para ti.</p>
  <p>La <b>seguridad de nivel de fila (RLS)</b> hace que cada persona vea solo sus filas: el jefe de la sede Cali ve Cali; la gerente ve todo. Se define en Power BI Desktop con <b>roles</b>:</p>
  <pre class="code">Rol «Jefe Cali» en la tabla Sedes:  [ciudad] = "Cali"
Rol dinámico en Vendedores:         [correo] = USERPRINCIPALNAME()</pre>
  <p>Como Sedes filtra a Ventas por la relación, el filtro del rol llega a las ventas. Se prueba con <b>Modelado › Ver como</b>.</p>
  <p><b>Publicar en la web</b> crea un enlace público que cualquiera puede ver: nunca con datos de la empresa, y muchas organizaciones lo tienen desactivado. Para tu <b>portafolio</b>, la herramienta es <b>Tableau Public</b>, siempre con datos ficticios o públicos.</p>`,
 brechaTxt:"El .pbix enviado por correo viaja con todos los datos, sin control de versiones ni de quién ve qué.",
 pbi:[
  ["Crea un rol", "<b>Modelado › Administrar roles › Crear</b>: nombre «Jefe Cali», tabla Sedes, filtro <code>[ciudad] = \"Cali\"</code>."],
  ["Prueba el rol", "<b>Modelado › Ver como › Jefe Cali</b>. La tarjeta de venta neta 2025 debe mostrar <b>2.348.175.015</b> (solo Cali). Sal de «Ver como» al terminar."],
  ["Documenta el modelo", "Agrega descripciones a las medidas (panel Propiedades › Descripción). Quien herede el informe sabrá qué calcula cada una."],
  ["Publica (opcional)", "<b>Inicio › Publicar</b> con tu cuenta. Con licencia gratuita queda en «Mi área de trabajo»; allí puedes ver el informe en el navegador, pero no compartirlo."],
 ],
 tableau:[
  ["Publica en tu perfil", "<b>Archivo › Guardar en Tableau Public</b>. En la configuración del libro puedes ocultar las hojas y permitir o no la descarga."],
  ["Describe", "En tu perfil, agrega título, descripción con la aclaración de datos ficticios y etiquetas (Power BI, Tableau, análisis de ventas)."],
 ],
 colabQue:"Compruebas que cada rol ve solo sus filas y que la suma de las sedes da el total, y revisas qué publicar dónde con una lista de decisiones.",
 ia:[
  {t:"Diseñar roles", p:`En mi modelo de Power BI hay una tabla Sedes (id_sede, ciudad) que filtra a Ventas. Quiero que cada jefe de sede vea solo su sede y que la gerencia vea todo.
Propón los roles de seguridad de nivel de fila (estáticos y una versión dinámica con USERPRINCIPALNAME) y cómo probarlos en Power BI Desktop.`},
  {t:"Descripción para el portafolio", p:`Escribe una descripción de 60 palabras para mi tablero en Tableau Public: [DESCRIBE EL TABLERO Y EL HALLAZGO].
Aclara que los datos son ficticios y menciona las herramientas usadas.`},
 ],
 iaCuidado:"Nunca pegues credenciales, correos reales de la empresa ni datos de clientes en una IA. Para el portafolio, usa solo datos ficticios.",
 quiz:[
  {q:"¿Cómo se comparte un informe en una empresa que usa Power BI?",
   o:["Enviando el .pbix por correo","Publicándolo en un área de trabajo del servicio y dando acceso","Con una captura","Publicar en la web"], a:1,
   w:"El área de trabajo controla versiones, accesos y la actualización de los datos."},
  {q:"¿Qué hace la seguridad de nivel de fila?",
   o:["Oculta columnas","Hace que cada usuario vea solo las filas que le corresponden","Cifra el archivo","Bloquea la edición"], a:1,
   w:"El filtro del rol se aplica a todo el modelo a través de las relaciones."},
  {q:"¿Puedes publicar en Tableau Public un tablero con datos reales de clientes de tu empresa?",
   o:["Sí, si es para el portafolio","No: todo lo que se publica en Tableau Public es público","Sí, con contraseña","Solo los fines de semana"], a:1,
   w:"Tableau Public no tiene contenido privado. Usa datos ficticios o públicos."},
  {q:"¿Cómo pruebas un rol en Power BI Desktop?",
   o:["Publicando","Modelado › Ver como","Exportando a Excel","No se puede"], a:1,
   w:"«Ver como» muestra el informe como lo vería un usuario de ese rol."},
 ],
 docente:{
  duracion:[["Apertura: el .pbix por correo",5,"Qué riesgos tiene."],["Simulador: roles y decisiones",12,"Prueben cada rol y cada caso de publicación."],["Power BI: rol y Ver como",20,"Cifra de control de Cali."],["Autoevaluación",8,"Cuestionario."]],
  preguntas:["¿Qué datos de su trabajo nunca deberían salir de la empresa?","¿Qué pondrían en su perfil de Tableau Public?"],
  errores:["Usar Publicar en la web con datos de la empresa.","Crear el rol en Ventas[id_sede] con códigos que nadie entiende."],
  cierre:"En la empresa se publica con control; en el portafolio, con datos ficticios."},
};

/* ---------- «Ver el error» ---------- */
ERRORES[1] = ()=>{
  const A = X.perfil.erp.auto, F = X.perfil.erp.corregido;
  const fila = (c,p)=>`<tr><td class="mono">${c}</td><td>${p.tipo}</td><td class="num" style="${p.errores?"color:var(--bad);font-weight:600":""}">${p.errores}</td><td class="num">${p.distintos}</td></tr>`;
  const cols = ["Fecha","Cod Cliente","Ciudad","Cantidad","Valor Neto"];
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Cargado directo (tipo automático)</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">Columna</td><td class="hd">Tipo</td><td class="hd">Errores</td><td class="hd">Distintos</td></tr>${cols.map(c=>fila(c,A[c])).join("")}</table></div>
     <p class="muted small" style="margin-top:8px">Valor Neto quedó como texto: no se suma. Fecha y Cantidad tienen errores. Ciudad tiene 16 «sedes».</p></div>
   <div class="panel good"><span class="eyebrow">Perfilado y corregido en Power Query</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">Columna</td><td class="hd">Tipo</td><td class="hd">Errores</td><td class="hd">Distintos</td></tr>${cols.map(c=>fila(c,F[c])).join("")}</table></div>
     <p class="muted small" style="margin-top:8px">Tipos correctos y cero errores. Ciudad todavía muestra 16 valores: se normaliza con Reemplazar valores o con un maestro.</p></div></div>`;
};
ERRORES[2] = ()=>{
  const n = X.filas.ventas, plana = n*COLS_PLANA.length;
  const estrella = celdasModelo(Object.fromEntries(COLS_PLANA.map(c=>[c[0],c[1]])));
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Tabla plana: ${COLS_PLANA.length} columnas × ${nf.format(n)} filas</span>
     <p style="margin:10px 0 4px; font-size:1.6rem; font-weight:700">${nf.format(plana)} celdas</p>
     <ul class="plain small"><li>«Corporativo» escrito miles de veces.</li><li>Sin Calendario: 112 días sin ventas no existen.</li><li>Metas no cabe: es mensual, no por línea.</li></ul></div>
   <div class="panel good"><span class="eyebrow">Modelo estrella</span>
     <p style="margin:10px 0 4px; font-size:1.6rem; font-weight:700">≈ ${nf.format(estrella)} celdas</p>
     <ul class="plain small"><li>Cada atributo se guarda una vez por cliente, producto o sede.</li><li>Calendario continuo de 1.096 días.</li><li>Metas como segunda tabla de hechos.</li></ul></div></div>`;
};
ERRORES[5] = ()=>{
  const [a,b] = ventaMensual(), ta=a.reduce((x,y)=>x+y,0), tb=b.reduce((x,y)=>x+y,0);
  return `<div class="two">
   <div class="panel bad"><span class="eyebrow">Comparación copiada a mano</span><div class="sheetwrap" style="margin-top:8px"><table class="sheet"><tr><td class="hd">Mes</td><td class="hd">2025</td><td class="hd">2024 (pegado)</td></tr>
     ${[0,1,2].map(m=>`<tr><td>${MESES[m]}</td><td class="num">${nf.format(b[m])}</td><td class="num">${nf.format(a[m])}</td></tr>`).join("")}<tr><td>…</td><td></td><td></td></tr></table></div>
     <p class="muted small" style="margin-top:8px">Sirve para la empresa completa. Si el gerente pide Cali o el canal E-commerce, hay que volver a copiar.</p></div>
   <div class="panel good"><span class="eyebrow">Una medida para cualquier filtro</span><pre class="code" style="margin-top:8px">Var % AA = DIVIDE([Venta neta] - [Venta AA], [Venta AA])</pre>
     <p class="small" style="margin-top:8px">2025 frente a 2024: <b>${pct1(tb/ta-1)}</b>. La misma medida responde por sede, canal, cliente o mes.</p></div></div>`;
};
ERRORES[7] = ()=>`<div class="two">
   <div class="panel bad"><span class="eyebrow">Una página por sede</span><div class="chips" style="margin-top:8px">${DM.ciudad.map(c=>`<span class="tag">Página ${c}</span>`).join("")}</div>
     <p class="muted small" style="margin-top:8px">Cambiar un visual exige hacerlo seis veces. Una sede nueva exige otra página.</p></div>
   <div class="panel good"><span class="eyebrow">Una página de detalle</span><p class="small" style="margin-top:8px"><b>Resumen</b> → clic derecho en una barra › <b>Obtener detalles</b> → <b>Detalle sede</b> (filtrada) → botón <b>Atrás</b>.</p>
     <p class="muted small">Un solo diseño para todas las sedes, presentes y futuras.</p></div></div>`;
ERRORES[8] = ()=>`<div class="two">
   <div class="panel bad"><span class="eyebrow">El .pbix por correo</span><ul class="plain small" style="margin-top:8px"><li>Viaja con todos los datos de todas las sedes.</li><li>«Informe_final_v3.pbix» en diez buzones.</li><li>Nadie sabe cuál es la versión vigente.</li><li>Los datos no se actualizan solos.</li></ul></div>
   <div class="panel good"><span class="eyebrow">Publicado con control</span><ul class="plain small" style="margin-top:8px"><li>Un área de trabajo con la única versión.</li><li>Actualización programada cada mañana.</li><li>Cada jefe ve solo su sede (RLS).</li><li>El portafolio, aparte, en Tableau Public con datos ficticios.</li></ul></div></div>`;

/* ======================================================================
   SIMULADORES
   ====================================================================== */

/* ---- Clave 1: perfil de columnas ---- */
SIMS[1] = function(el){
  let S = {tabla:"erp", modo:"auto", col:"Cantidad"};
  const draw = ()=>{
    const T = X.perfil[S.tabla], P = T[S.modo], cols = Object.keys(P); if(!P[S.col]) S.col = cols[0];
    const p = P[S.col], pv = x=>pct1(x/p.n);
    const barra = (c)=>{ const q=P[c]; const w=[q.validos,q.errores,q.vacios].map(x=>x/q.n*100);
      return `<div title="${c}: válidos ${pct1(q.validos/q.n)}, errores ${pct1(q.errores/q.n)}, vacíos ${pct1(q.vacios/q.n)}" style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin-top:4px"><i style="width:${w[0]}%;background:var(--good)"></i><i style="width:${w[1]}%;background:var(--bad)"></i><i style="width:${w[2]}%;background:var(--s0)"></i></div>` };
    const maxTop = Math.max(...p.top.map(t=>t[1]));
    el.innerHTML = `<div class="stack">
      <p class="read">Así se ve una tabla en el Editor de Power Query con <b>Calidad de columna</b> activada. Elige la tabla y haz clic en una columna para ver su distribución y su perfil. Compara el tipo automático con el corregido.</p>
      <div class="ctl"><label for="s1t">Archivo<select id="s1t"><option value="erp">ventas_erp_sucio.csv (exportación del ERP)</option><option value="ventas">ventas.csv (curso)</option></select></label>
        ${S.tabla==="erp"?`<label for="s1m">Tipos<select id="s1m"><option value="auto">Paso automático «Tipo cambiado»</option><option value="corregido">Corregidos en la consulta</option></select></label>`:""}</div>
      <div class="sheetwrap"><table class="sheet"><thead><tr>${cols.map(c=>`<th data-c="${c}" style="cursor:pointer;min-width:96px;${c===S.col?"background:var(--sel)":""}"><span class="small">${P[c].tipo==="Texto"?"ABC":P[c].tipo==="Fecha"?"📅":"123"}</span> ${c}${barra(c)}</th>`).join("")}</tr></thead>
        <tbody><tr>${cols.map(c=>`<td class="small" style="${c===S.col?"background:var(--sel)":""}">✓ ${pct1(P[c].validos/P[c].n)}<br><span style="color:${P[c].errores?"var(--bad)":"var(--muted)"}">✗ ${pct1(P[c].errores/P[c].n)}</span><br><span class="muted">○ ${pct1(P[c].vacios/P[c].n)}</span></td>`).join("")}</tr></tbody></table></div>
      <div class="two"><div class="panel"><span class="eyebrow">Distribución · ${esc(S.col)}</span>
          <p class="small" style="margin:6px 0">${nf.format(p.distintos)} distintos · ${nf.format(p.unicos)} únicos · ${nf.format(p.n)} filas</p>
          ${p.top.map(t=>`<div class="small" style="display:grid;grid-template-columns:110px 1fr 46px;gap:6px;align-items:center;margin:3px 0"><span class="mono" style="overflow:hidden;text-overflow:ellipsis;white-space:pre">${esc(t[0])}</span><i style="display:block;height:10px;border-radius:3px;background:var(--s1);width:${t[1]/maxTop*100}%"></i><span class="num">${t[1]}</span></div>`).join("")}</div>
        <div class="panel"><span class="eyebrow">Perfil · ${esc(S.col)}</span><table class="datatbl small" style="margin-top:6px">
          <tr><td>Tipo</td><td><b>${p.tipo}</b></td></tr><tr><td>Válidos</td><td>${nf.format(p.validos)} (${pv(p.validos)})</td></tr>
          <tr><td>Errores</td><td style="${p.errores?"color:var(--bad);font-weight:600":""}">${nf.format(p.errores)}</td></tr><tr><td>Vacíos</td><td>${nf.format(p.vacios)}</td></tr>
          ${p.min?`<tr><td>Mínimo</td><td>${p.min}</td></tr><tr><td>Máximo</td><td>${p.max}</td></tr>`:""}</table></div></div>
      <div class="insight">${S.tabla==="ventas" ? "ventas.csv llega limpio: tipos correctos, sin errores ni vacíos, y las llaves con los valores esperados. Así debe verse un archivo listo para el modelo."
        : S.col==="Valor Neto" && S.modo==="auto" ? "Power Query vio montos con «$» entre las primeras filas y dejó la columna como <b>texto</b>: no hay errores, pero tampoco se puede sumar. Cambia a «Corregidos»."
        : S.col==="Ciudad" ? `La distribución delata el problema: <b>${p.distintos} valores distintos</b> para 6 sedes. El tipo está bien; lo que falla es la escritura. Se corrige con Reemplazar valores o cruzando con el maestro de sedes.`
        : S.col==="Cod Cliente" ? `Con tipo texto no hay errores, pero hay <b>${p.distintos}</b> códigos distintos${S.modo==="auto"?": espacios y minúsculas crean códigos falsos. Corregidos (Recortar + MAYÚSCULAS) bajan a "+X.perfil.erp.corregido["Cod Cliente"].distintos:""}.`
        : p.errores ? `<b>${nf.format(p.errores)} valores en Error</b> (${pv(p.errores)}): no encajan en el tipo ${p.tipo.toLowerCase()}. Haz clic en un Error en Power Query para ver el valor que lo causa. Cambia a «Corregidos».`
        : "Columna sana: tipo correcto y sin errores. Revisa la distribución para ver si los valores tienen sentido."}</div></div>`;
    $("#s1t").value=S.tabla; $("#s1t").onchange=e=>{S.tabla=e.target.value; S.col=Object.keys(X.perfil[S.tabla][S.modo])[0]; draw()};
    const m=$("#s1m"); if(m){ m.value=S.modo; m.onchange=e=>{S.modo=e.target.value;draw()} }
    el.querySelectorAll("[data-c]").forEach(th=>th.onclick=()=>{ S.col=th.dataset.c; draw() });
  };
  draw();
};

/* ---- Clave 2: ¿a qué tabla va cada columna? ---- */
SIMS[2] = function(el){
  const DEST = ["Ventas","Calendario","Clientes","Productos","Sedes","Vendedores"];
  const asg = {}; COLS_PLANA.forEach(c=>asg[c[0]]="Ventas");
  const draw = ()=>{
    const bien = COLS_PLANA.filter(c=>asg[c[0]]===c[1]).length, n = X.filas.ventas;
    const celdas = celdasModelo(asg), plana = n*COLS_PLANA.length;
    el.innerHTML = `<div class="stack">
      <p class="read">Esta es la tabla plana del curso de Excel (17 columnas). Decide a qué tabla del modelo estrella va cada columna. La pista está en los <b>valores distintos</b>: pocos valores que se repiten miles de veces suelen ser atributos de una dimensión.</p>
      <div class="sheetwrap"><table class="sheet"><thead><tr><th>Columna</th><th>Valores distintos</th><th>Va en la tabla…</th><th></th></tr></thead><tbody>
        ${COLS_PLANA.map(([c,dest,d])=>`<tr><td class="mono">${c}</td><td class="num">${nf.format(d)}</td><td><select data-c="${c}" aria-label="Tabla para ${c}">${DEST.map(x=>`<option ${asg[c]===x?"selected":""}>${x}</option>`).join("")}</select></td><td>${asg[c]===dest?'<span style="color:var(--good)">✓</span>':""}</td></tr>`).join("")}</tbody></table></div>
      <div class="row"><span class="tag ${bien===COLS_PLANA.length?"ok":""}">${bien} de ${COLS_PLANA.length} columnas en su tabla</span><span class="tag">Tabla plana: ${nf.format(plana)} celdas</span><span class="tag">Tu modelo: ≈ ${nf.format(celdas)} celdas (${pct1(celdas/plana)})</span></div>
      <div class="insight">${bien===COLS_PLANA.length ? `Modelo estrella completo. <b>fecha</b> queda en Ventas como llave hacia el Calendario; año, mes y trimestre salen del Calendario. El modelo guarda ${pct1(1-celdas/plana)} menos celdas y cada atributo se escribe una sola vez.`
        : asg.fecha!=="Ventas" ? "La fecha debe quedarse en Ventas: es la <b>llave</b> que conecta cada venta con su día en el Calendario."
        : "Sigue clasificando. Recuerda: Ventas guarda lo que se suma (cantidad, subtotal, margen), el estado, el canal y las llaves; lo descriptivo va en las dimensiones."}</div></div>`;
    el.querySelectorAll("[data-c]").forEach(s=>s.onchange=()=>{ asg[s.dataset.c]=s.value; draw() });
  };
  draw();
};

/* ---- Clave 5: inteligencia de tiempo ---- */
SIMS[5] = function(el){
  let S = {sede:-1, vista:"ytd", hasta:12, sinCal:false};
  const DAX = {mes:"Venta neta y Venta AA = CALCULATE([Venta neta], SAMEPERIODLASTYEAR(Calendario[Date]))",
    ytd:"Venta YTD = TOTALYTD([Venta neta], Calendario[Date])  ·  Venta YTD AA = CALCULATE([Venta YTD], SAMEPERIODLASTYEAR(Calendario[Date]))",
    var:"Var % AA = DIVIDE([Venta neta] - [Venta AA], [Venta AA])"};
  const draw = ()=>{
    const [a,b] = ventaMensual(S.sede), h=S.hasta;
    const cum = arr=>arr.reduce((r,x,i)=>(r.push((r[i-1]||0)+x),r),[]);
    let chart, cifra;
    if(S.sinCal){ chart = `<div class="callout gap" style="margin:0"><span class="k">Venta AA = (vacío)</span><p>Sin una tabla de fechas marcada y relacionada, SAMEPERIODLASTYEAR no tiene un calendario continuo sobre el cual desplazarse: la medida devuelve vacío o valores incompletos.</p></div>`; cifra="(vacío)" }
    else if(S.vista==="var"){ const v = b.slice(0,h).map((x,i)=>({k:MESES[i], v:x/a[i]-1}));
      chart = `<div class="sheetwrap"><table class="sheet"><tr><td class="hd">Mes</td><td class="hd">2025</td><td class="hd">2024 (AA)</td><td class="hd">Var % AA</td></tr>${v.map((x,i)=>`<tr><td>${x.k}</td><td class="num">${nf.format(b[i])}</td><td class="num">${nf.format(a[i])}</td><td class="num" style="color:${x.v>=0?"var(--good)":"var(--bad)"}">${x.v>=0?"+":""}${pct1(x.v)}</td></tr>`).join("")}</table></div>`;
      const sb=b.slice(0,h).reduce((x,y)=>x+y,0), sa=a.slice(0,h).reduce((x,y)=>x+y,0); cifra = (sb>=sa?"+":"")+pct1(sb/sa-1) }
    else { const xa = S.vista==="ytd"?cum(a):a, xb = S.vista==="ytd"?cum(b):b;
      chart = G.lineas(MESES.slice(0,h), [{n:"2025", v:xb.slice(0,h).map(x=>x/1e6)},{n:"2024", v:xa.slice(0,h).map(x=>x/1e6), c:"var(--s0)"}], {fmt:v=>nf.format(Math.round(v)), desdeCero:S.vista==="ytd", label:"Venta 2025 frente a 2024"});
      cifra = S.vista==="ytd" ? `${mill(xb[h-1])} frente a ${mill(xa[h-1])} (${xb[h-1]>=xa[h-1]?"+":""}${pct1(xb[h-1]/xa[h-1]-1)})` : `${mill(b[h-1])} frente a ${mill(a[h-1])}` }
    el.innerHTML = `<div class="stack">
      <p class="read">Elige la sede, la vista y hasta qué mes va el año (como si estuvieras en ese mes). Las cifras salen de las mismas medidas de DAX.</p>
      <div class="ctl"><label for="s5s">Sede<select id="s5s"><option value="-1">Todas</option>${DM.ciudad.map((c,i)=>`<option value="${i}">${c}</option>`).join("")}</select></label>
        <label for="s5v">Vista<select id="s5v"><option value="ytd">Acumulado del año (YTD)</option><option value="mes">Mensual: 2025 y año anterior</option><option value="var">Variación % contra el año anterior</option></select></label>
        <label for="s5h">Año hasta el mes<select id="s5h">${MESES.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("")}</select></label>
        <label class="chk" for="s5c"><input type="checkbox" id="s5c" ${S.sinCal?"checked":""}> Sin tabla de fechas marcada</label></div>
      ${fxbar("Medida", `<span class="mono">${esc(DAX[S.vista])}</span>`)}
      <div class="panel">${chart}</div>
      <div class="insight">${S.sinCal ? "Es el error más común: medidas de tiempo sobre Ventas[fecha] o un Calendario sin marcar. Revisa el Calendario y la relación antes de revisar la fórmula."
        : `<b>${S.sede<0?"Empresa":DM.ciudad[S.sede]}, enero a ${MESES[h-1].toLowerCase()}:</b> ${cifra}. ${h<12?"Observa que el año anterior también se corta en "+MESES[h-1].toLowerCase()+": SAMEPERIODLASTYEAR compara el mismo periodo.":"Con el año completo, la variación de la empresa coincide con la tabla de control (+18,9 %)."}`}</div></div>`;
    $("#s5s").value=S.sede; $("#s5v").value=S.vista; $("#s5h").value=S.hasta;
    $("#s5s").onchange=e=>{S.sede=+e.target.value;draw()}; $("#s5v").onchange=e=>{S.vista=e.target.value;draw()};
    $("#s5h").onchange=e=>{S.hasta=+e.target.value;draw()}; $("#s5c").onchange=e=>{S.sinCal=e.target.checked;draw()};
  };
  draw();
};

/* ---- Clave 7: detalle, marcadores e información sobre herramientas ---- */
SIMS[7] = function(el){
  const cs = X.control_sede, y25 = anioIdx(2025);
  let S = {pag:"resumen", sede:null, foco:null, mk:null, tip:null};
  const detalle = (c)=>{ const i = DM.ciudad.indexOf(c), [, b] = ventaMensual(i), mm = MESES.map((_,m)=>metaDe(2025, x=>x[1]===m+1 && x[2]===c));
    const cli = new Map(); for(let j=0;j<NL;j++){ if(C.anio[j]!==y25||C.estado[j]===2||C.ciudad[j]!==i) continue; cli.set(C.cliente[j],(cli.get(C.cliente[j])||0)+C.subtotal[j]) }
    const top = [...cli.entries()].sort((x,y)=>y[1]-x[1]).slice(0,5);
    return `<div class="row" style="justify-content:space-between"><button class="btn small" data-atras>← Atrás</button><span class="eyebrow">Página «Detalle sede» · filtro recibido: ciudad = ${c}</span></div>
      <div class="grid3" style="margin-top:10px"><div class="panel"><span class="muted small">Venta neta 2025</span><div style="font-size:1.4rem;font-weight:700">${mill(cs[c]["Venta neta"])}</div></div>
        <div class="panel"><span class="muted small">Cumplimiento</span><div style="font-size:1.4rem;font-weight:700;color:${cs[c]["Cumplimiento"]<1?"var(--bad)":"var(--good)"}">${pct1(cs[c]["Cumplimiento"])}</div></div>
        <div class="panel"><span class="muted small">Ticket promedio</span><div style="font-size:1.4rem;font-weight:700">${nf.format(Math.round(cs[c]["Ticket promedio"]))}</div></div></div>
      <div class="two" style="margin-top:10px"><div class="panel">${G.lineas(MESES,[{n:"Venta",v:b.map(x=>x/1e6)},{n:"Meta",v:mm.map(x=>x/1e6),c:"var(--s0)"}],{fmt:v=>nf.format(Math.round(v)),label:"Venta y meta mensual"})}</div>
        <div class="panel"><span class="eyebrow">5 mejores clientes</span><ol class="small" style="margin:6px 0 0 18px">${top.map(t=>`<li>${esc(D.clientes_nombres[t[0]])} · ${mill(t[1])}</li>`).join("")}</ol></div></div>`; };
  const resumen = ()=>{ const items = Object.entries(cs).map(([k,d])=>({k, v:d["Cumplimiento"]})).sort((a,b)=>b.v-a.v);
    return `<span class="eyebrow">Página «Comité» · Cumplimiento 2025 por sede (pasa el mouse y haz clic en una barra)</span>
      <div style="margin-top:8px">${items.map(it=>{ const f = S.foco && S.foco!==it.k, d=cs[it.k];
        return `<div data-s="${it.k}" style="display:grid;grid-template-columns:110px 1fr 70px;gap:8px;align-items:center;margin:6px 0;cursor:pointer;opacity:${f?.3:1}"><span class="small">${it.k}</span><i style="display:block;height:20px;border-radius:4px;width:${it.v/1.25*100}%;background:${it.v<1?"var(--s3)":"var(--s0)"}"></i><span class="small num">${pct1(it.v)}</span></div>
          ${S.tip===it.k?`<div class="callout" style="margin:0 0 6px 118px;padding:8px 10px"><span class="k">Información sobre herramientas</span><p class="small">Venta ${mill(d["Venta neta"])} · Meta ${mill(d["Meta"])} · ${nf.format(d["Facturas"])} facturas · ticket ${nf.format(Math.round(d["Ticket promedio"]))}</p></div>`:""}` }).join("")}</div>`; };
  const MK = [{n:"1 · Resultado", pag:"resumen", foco:null, t:"La empresa cerró en 95,3 % de la meta; dos sedes la superaron."},
              {n:"2 · El rezago", pag:"resumen", foco:"Barranquilla", t:"Barranquilla quedó 12 puntos debajo de su meta."},
              {n:"3 · El detalle", pag:"detalle", sede:"Barranquilla", t:"Los meses y los clientes que explican el rezago de Barranquilla."}];
  const draw = ()=>{
    el.innerHTML = `<div class="stack">
      <p class="read">Un informe con dos páginas: el resumen del comité y una página de detalle. Prueba la obtención de detalles (clic en una barra), la información sobre herramientas (pasa el mouse) y los marcadores para contar la historia en tres pasos.</p>
      <div class="row"><span class="eyebrow">Marcadores</span>${MK.map((m,i)=>`<button class="btn small ${S.mk===i?"primary":""}" data-mk="${i}">${m.n}</button>`).join("")}</div>
      ${S.mk!==null?`<div class="callout tip" style="margin:0"><span class="k">Texto del marcador</span><p>${MK[S.mk].t}</p></div>`:""}
      <div class="panel">${S.pag==="resumen"?resumen():detalle(S.sede)}</div>
      <div class="insight">${S.pag==="detalle" ? `Una sola página de detalle recibió el filtro <b>${S.sede}</b>. El botón Atrás vuelve al resumen. Prueba con otra sede: es la misma página.`
        : S.mk===1 ? "El marcador guardó la selección de Barranquilla: las demás barras se atenúan. Así el comité mira donde tú quieres."
        : "Pasa el mouse por una barra para ver la información sobre herramientas, o haz clic para obtener detalles de esa sede."}</div></div>`;
    el.querySelectorAll("[data-s]").forEach(r=>{ r.onclick=()=>{ S.pag="detalle"; S.sede=r.dataset.s; S.mk=null; S.tip=null; draw() };
      r.onmouseenter=()=>{ if(S.tip!==r.dataset.s){ S.tip=r.dataset.s; draw() } } });
    const at=$("[data-atras]",el); if(at) at.onclick=()=>{ S.pag="resumen"; S.mk=null; draw() };
    el.querySelectorAll("[data-mk]").forEach(b=>b.onclick=()=>{ const m=MK[+b.dataset.mk]; S.mk=+b.dataset.mk; S.pag=m.pag; S.foco=m.foco||null; S.sede=m.sede||null; S.tip=null; draw() });
  };
  draw();
};

/* ---- Clave 8: roles y decisiones de publicación ---- */
SIMS[8] = function(el){
  const cs = X.control_sede;
  const ROLES = [{n:"Gerente comercial (sin rol)", f:null}, ...DM.ciudad.map(c=>({n:`Jefe ${c}`, f:c}))];
  const CASOS = [
    {c:"Tablero comercial con datos reales para la gerencia y los jefes de sede.", ok:"Servicio de Power BI", x:"Área de trabajo con acceso por persona, actualización programada y RLS para los jefes."},
    {c:"Tu tablero de Distribuidora Andina (datos ficticios) para la hoja de vida.", ok:"Tableau Public", x:"Es público por diseño: ideal para el portafolio, siempre con datos ficticios o públicos."},
    {c:"Un informe con los salarios del equipo que quieres mostrar en LinkedIn.", ok:"No publicar", x:"Datos personales y confidenciales: no salen de la empresa (Ley 1581 de 2012)."},
    {c:"El tablero de ventas de la empresa con «Publicar en la web» para verlo desde el celular.", ok:"No publicar", x:"Publicar en la web crea un enlace que cualquiera puede abrir. Usa la app móvil de Power BI con tu cuenta."},
  ];
  const OP = ["Servicio de Power BI","Tableau Public","No publicar"];
  let S = {rol:0, resp:{}};
  const draw = ()=>{
    const R = ROLES[S.rol], filas = Object.entries(cs).filter(([c])=>!R.f || c===R.f);
    const tot = filas.reduce((a,[,d])=>a+d["Venta neta"],0), ok = CASOS.filter((k,i)=>S.resp[i]===k.ok).length;
    el.innerHTML = `<div class="stack">
      <p class="read"><b>Parte 1 · Seguridad de nivel de fila.</b> Usa «Ver como» con cada rol. El rol está definido en la tabla Sedes y el filtro llega a Ventas por la relación.</p>
      <div class="ctl"><label for="s8r">Ver como<select id="s8r">${ROLES.map((r,i)=>`<option value="${i}">${r.n}</option>`).join("")}</select></label></div>
      ${fxbar("Rol", `<span class="mono">${R.f?esc(`Sedes: [ciudad] = "${R.f}"`):"(sin filtro de rol)"}</span>`)}
      <div class="two"><div class="panel"><span class="muted small">Venta neta 2025</span><div style="font-size:1.5rem;font-weight:700">${nf.format(tot)}</div></div>
        <div class="sheetwrap"><table class="sheet"><tr><td class="hd">Sede</td><td class="hd">Venta neta 2025</td></tr>${filas.map(([c,d])=>`<tr><td>${c}</td><td class="num">${nf.format(d["Venta neta"])}</td></tr>`).join("")}</table></div></div>
      <p class="read" style="margin-top:8px"><b>Parte 2 · ¿Dónde se publica?</b> Elige para cada caso.</p>
      ${CASOS.map((k,i)=>`<div class="panel"><p class="small" style="margin:0 0 8px">${i+1}. ${k.c}</p><div class="row">${OP.map(o=>`<button class="btn small ${S.resp[i]===o?"primary":""}" data-c="${i}" data-o="${o}">${o}</button>`).join("")}</div>
        ${S.resp[i]?`<p class="small" style="margin:8px 0 0;color:${S.resp[i]===k.ok?"var(--good)":"var(--bad)"}">${S.resp[i]===k.ok?"✓":"✗ Mejor: "+k.ok+"."} ${k.x}</p>`:""}</div>`).join("")}
      <div class="row"><span class="tag ${ok===4?"ok":""}">${ok} de 4 decisiones correctas</span></div>
      <div class="insight">${R.f ? `Con el rol <b>Jefe ${R.f}</b>, todo el informe muestra solo ${R.f}: ${nf.format(tot)}, igual a la cifra de control de la sede. Así se comprueba un rol antes de publicar.` : "Sin rol se ve todo. Elige un jefe de sede para ver cómo el filtro del rol recorre el modelo."}</div></div>`;
    $("#s8r").value=S.rol; $("#s8r").onchange=e=>{S.rol=+e.target.value;draw()};
    el.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ S.resp[b.dataset.c]=b.dataset.o; draw() });
  };
  draw();
};
