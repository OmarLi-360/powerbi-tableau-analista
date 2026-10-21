"""Cuadernos de control de las claves 3, 4 y 6 (piloto Power BI + Tableau).

Cada cuaderno calcula en Python lo mismo que el estudiante construye en Power BI,
para que compare sus cifras y entienda por qué cuadran (o no).
"""
from .comun import PAGES, PREPARACION, cierre, code, colab, encabezado, ficha, md, reto, tip_ia

TABLAS = '''
# @title Preparar el modelo: las tablas tal como quedan en Power BI
calendario = pd.DataFrame({"Date": pd.date_range("2024-01-01", "2026-12-31")})
calendario["Año"], calendario["Mes"] = calendario.Date.dt.year, calendario.Date.dt.month
metas = metas.assign(fecha_mes=pd.to_datetime(dict(year=metas.anio, month=metas.mes, day=1)))
TABLAS = {"Ventas": (ventas, "Hechos"), "Metas": (metas, "Hechos"), "Clientes": (clientes, "Dimensión"),
          "Productos": (productos, "Dimensión"), "Vendedores": (vendedores, "Dimensión"),
          "Sedes": (sedes, "Dimensión"), "Calendario": (calendario, "Dimensión")}
RELACIONES = [("Ventas", "id_cliente", "Clientes", "id_cliente"), ("Ventas", "sku", "Productos", "sku"),
              ("Ventas", "id_vendedor", "Vendedores", "id_vendedor"), ("Ventas", "id_sede", "Sedes", "id_sede"),
              ("Ventas", "fecha", "Calendario", "Date"), ("Metas", "id_sede", "Sedes", "id_sede"),
              ("Metas", "fecha_mes", "Calendario", "Date")]
display(Markdown(f"Modelo listo: **{len(TABLAS)} tablas** y **{len(RELACIONES)} relaciones**."))
'''

MEDIDAS = '''
# @title Definir las seis medidas (las mismas de DAX)
def medidas(v, m):
    """v: líneas de venta con el filtro de la celda; m: metas con el mismo filtro."""
    ok = v[v.estado != "Anulada"]                      # CALCULATE(..., Ventas[estado] <> "Anulada")
    venta, fact, meta = ok.subtotal.sum(), ok.id_factura.nunique(), m.meta_subtotal.sum()
    return {"Venta neta": venta, "Meta": meta,
            "Cumplimiento": venta / meta if meta else np.nan,          # DIVIDE([Venta neta], [Meta])
            "Facturas": fact,                                            # DISTINCTCOUNT(id_factura)
            "Ticket promedio": venta / fact if fact else np.nan,         # DIVIDE([Venta neta], [Facturas])
            "Margen %": ok.margen_bruto.sum() / venta if venta else np.nan}
ventas_ene = pd.read_csv(ruta("nuevo_mes/ventas_2026_01.csv"), parse_dates=["fecha"])
metas_ene = pd.read_csv(ruta("nuevo_mes/metas_2026_01.csv"))
V = (pd.concat([ventas, ventas_ene]).merge(sedes[["id_sede", "ciudad"]], on="id_sede")
     .merge(clientes[["id_cliente", "segmento"]], on="id_cliente").assign(anio=lambda d: d.fecha.dt.year, mes=lambda d: d.fecha.dt.month))
M = pd.concat([metas, metas_ene]).merge(sedes[["id_sede", "ciudad"]], on="id_sede")
def formato(nombre, x):
    if pd.isna(x): return "(vacío)"
    return porc(x) if nombre in ("Cumplimiento", "Margen %") else miles(x)
display(Markdown("Medidas listas: Venta neta, Meta, Cumplimiento, Facturas, Ticket promedio y Margen %."))
'''


# ============================================================================
# 03 · Modelo estrella y relaciones
# ============================================================================
def cuaderno_03():
    return [
        encabezado("Clave 3", "Modelo estrella y relaciones", "Verificar el modelo antes de construir el informe", 30, [
            "Ver por qué conviene separar hechos y dimensiones.",
            "Comprobar que cada llave sea única y que no haya ventas huérfanas.",
            "Reconocer el síntoma de una relación que falta."], "03_modelo_estrella.ipynb", "clave-03"),
        code(PREPARACION),
        code(TABLAS),
        md("""
## 1 · Hechos y dimensiones
En Power BI no se unen las tablas: se relacionan. La tabla de **hechos** (Ventas) tiene muchas filas y las **dimensiones** (clientes, productos, sedes…) pocas. Separarlas evita repetir el nombre del cliente, su segmento y su ciudad en cada una de las 17.106 líneas.
"""),
        ficha("¿Qué tan grande es cada tabla del modelo?", "Barras horizontales: filas por tabla, en escala logarítmica · Azul: hechos · Gris: dimensiones",
              "Las tablas van de 6 a 17.106 filas: en escala normal las dimensiones no se verían.",
              "Una tabla de conteos: no muestra la diferencia de tamaño de un vistazo.",
              "Las tablas grandes (hechos) quedan al centro de la estrella; las pequeñas (dimensiones) alrededor.",
              "Vista de tabla de Power BI: el contador de filas está abajo a la izquierda."),
        code('''
# @title Gráfico 1 · Filas por tabla
filas = pd.Series({n: len(t) for n, (t, _) in TABLAS.items()}).sort_values()
colores = [AZUL if TABLAS[n][1] == "Hechos" else GRIS for n in filas.index]
fig = go.Figure(go.Bar(x=filas.values, y=[f"{n} ({TABLAS[n][1].lower()})" for n in filas.index], orientation="h",
                       marker_color=colores, text=[miles(v) for v in filas.values], textposition="outside", cliponaxis=False))
fig.update_layout(title=f"Ventas tiene {miles(filas['Ventas'])} filas; la dimensión más pequeña, {filas.min()}",
                  xaxis_type="log", xaxis_title="Filas (escala logarítmica)", height=360)
fig.show()
'''),
        md("## 2 · Las llaves: únicas en la dimensión y sin huérfanos en los hechos"),
        ficha("¿Cada relación cumple las dos condiciones de una llave?", "Tabla de verificación: valores repetidos en la dimensión y valores sin pareja en los hechos, por relación",
              "Son comprobaciones de sí o no: una tabla con ✓ es más clara que un gráfico.",
              "Confiar en que Power BI avisará: si la llave se repite, Power BI crea una relación varios a varios sin preguntar.",
              "Las dos columnas deben estar en cero. Un repetido o un huérfano produce totales que no cuadran.",
              "En Power Query: selecciona la llave › Inicio › Mantener filas › Mantener duplicados. Si queda vacía, la llave es única."),
        code('''
# @title Verificar las llaves de cada relación
filas_v = []
for hecho, lh, dim, ld in RELACIONES:
    th, td = TABLAS[hecho][0], TABLAS[dim][0]
    llaves_h = th[lh].drop_duplicates()
    if ld == "Date":
        llaves_h = pd.to_datetime(llaves_h)
    repetidos = int(td[ld].duplicated().sum())
    huerfanos = int((~llaves_h.isin(td[ld])).sum())
    filas_v.append({"Relación": f"{hecho}[{lh}] → {dim}[{ld}]", "Repetidos en la dimensión": repetidos,
                    "Sin pareja en los hechos": huerfanos, "Estado": "✓" if repetidos == huerfanos == 0 else "✗ revisar"})
verif = pd.DataFrame(filas_v)
display(verif.style.hide(axis="index"))
display(Markdown(f"**{(verif.Estado == '✓').sum()} de {len(verif)}** relaciones cumplen las dos condiciones."))
'''),
        ficha("¿Por qué la relación es varios a uno?", "Histograma: cuántas líneas de venta tiene cada cliente",
              "Muestra que un cliente aparece muchas veces en Ventas (el lado «varios») y una sola vez en Clientes (el lado «uno»).",
              "Un promedio: escondería que hay clientes con 3 líneas y otros con más de 100.",
              "Cada barra agrupa clientes según su número de líneas. Ninguno tiene una sola: por eso es *:1 y no 1:1.",
              "Vista de modelo: doble clic en la relación Ventas–Clientes y revisa «Cardinalidad: Varios a uno (*:1)»."),
        code('''
# @title Gráfico 2 · Líneas de venta por cliente
por_cliente = ventas.groupby("id_cliente").size()
fig = go.Figure(go.Histogram(x=por_cliente, nbinsx=30, marker_color=AZUL, marker_line_color="white", marker_line_width=1))
fig.update_layout(title=f"Cada cliente aparece en promedio {por_cliente.mean():.0f} veces en Ventas y una sola vez en Clientes".replace(".", ","),
                  xaxis_title="Líneas de venta del cliente", yaxis_title="Clientes", height=340)
fig.show()
'''),
        md("## 3 · El síntoma de una relación que falta"),
        ficha("¿Qué muestra la matriz si falta la relación Ventas–Clientes?", "Barras: venta neta 2025 por segmento, con y sin la relación",
              "Compara el resultado correcto con el síntoma, segmento por segmento.",
              "Solo explicar el error: hay que verlo para reconocerlo en un tablero real.",
              "Sin relación, cada segmento muestra el total de la empresa. Con la relación, cada uno muestra su parte.",
              "Matriz con Clientes[segmento] en filas y [Venta neta] en valores."),
        code('''
# @title Gráfico 3 · Venta por segmento con y sin relación
relacion = "Sin relación"  # @param ["Activa", "Sin relación"]
v25 = df[(df.anio == 2025) & (df.estado != "Anulada")]
total = v25.subtotal.sum()
seg = v25.groupby("segmento")["subtotal"].sum() if relacion == "Activa" else pd.Series(total, index=sorted(clientes.segmento.unique()))
seg = seg.sort_values() / 1e6
fig = go.Figure(go.Bar(x=seg.values, y=seg.index, orientation="h", marker_color=AZUL if relacion == "Activa" else MAGENTA,
                       text=[f"{v:,.0f}".replace(",", ".") for v in seg.values], textposition="outside", cliponaxis=False))
fig.update_layout(title=("Cada segmento muestra su venta y la suma da el total" if relacion == "Activa"
                         else f"Sin relación, los {len(seg)} segmentos muestran el total: {millones(total)}"),
                  xaxis_title=MM, height=320)
dar_aire(fig, seg.max())
fig.show()
'''),
        md("## 4 · Retos de interpretación"),
        reto(1, "¿Cuántas filas tiene la tabla Calendario de 2024 a 2026?", ["365", "731", "1.096", "36"],
             'miles(len(calendario))', "Una fila por día: 366 de 2024 (bisiesto) + 365 + 365."),
        reto(2, "¿Cuál es la cardinalidad de la relación Ventas–Productos?", ["Uno a uno (1:1)", "Varios a uno (*:1)", "Varios a varios (*:*)", "Uno a varios desde Ventas"],
             '"Varios a uno (*:1)"', "Muchas líneas de venta son del mismo producto; cada producto aparece una vez en Productos."),
        reto(3, "Una matriz muestra el mismo total en todas las filas. ¿Qué revisas primero?",
             ["El formato del número", "La relación entre la tabla de las filas y Ventas", "El tipo de visual", "El tamaño de la página"],
             '"La relación entre la tabla de las filas y Ventas"', "Es el síntoma del gráfico 3: el filtro de la fila no llega a los hechos."),
        tip_ia("Para revisar un modelo con ayuda de IA, describe las tablas y relaciones sin pegar datos:",
               """Tengo en Power BI: Ventas (hechos), Metas (hechos) y las dimensiones Clientes, Productos, Vendedores, Sedes y Calendario.
Relaciones: [LISTA: tabla[campo] → tabla[campo], cardinalidad, dirección].
¿Es un modelo estrella correcto? ¿Qué relación falta o sobra y qué síntoma produciría?"""),
        cierre(["En un modelo estrella, los hechos van al centro y las dimensiones alrededor.",
                "Cada llave debe ser única en la dimensión y no dejar huérfanos en los hechos.",
                "El mismo total en todas las filas es el síntoma de una relación que falta."],
               f"[Clave 4 · Medidas DAX]({PAGES}#clave-04) · [Cuaderno 04]({colab('04_medidas_dax.ipynb')})"),
    ]


# ============================================================================
# 04 · Medidas DAX y el contexto de filtro
# ============================================================================
def cuaderno_04():
    return [
        encabezado("Clave 4", "Medidas DAX y el contexto de filtro", "Cifras de control para tus medidas", 30, [
            "Obtener la tabla de control de las seis medidas para cualquier año y sede.",
            "Ver cómo una misma medida cambia según el contexto de filtro.",
            "Entender por qué un porcentaje no se suma en el total."], "04_medidas_dax.ipynb", "clave-04"),
        code(PREPARACION),
        code(MEDIDAS),
        md("""
## 1 · Tu tabla de control
Elige el año y la sede **igual que en las segmentaciones de tu Power BI**. Las seis cifras deben coincidir con tus tarjetas. Si una no coincide, el problema está en la medida o en el modelo, no en el visual.
"""),
        code('''
# @title Tabla de control
anio = "2025"  # @param ["2024", "2025", "Enero 2026"]
sede = "Todas"  # @param ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira"]
fv = V.anio == (2026 if anio == "Enero 2026" else int(anio))
fm = M.anio == (2026 if anio == "Enero 2026" else int(anio))
if sede != "Todas":
    fv, fm = fv & (V.ciudad == sede), fm & (M.ciudad == sede)
control = medidas(V[fv], M[fm])
display(pd.DataFrame({"Medida": control.keys(), "Debe dar": [formato(k, x) for k, x in control.items()]}).style.hide(axis="index"))
display(Markdown(f"Filtro equivalente en Power BI: **Calendario[Año] = {anio.replace('Enero ', '')}**" + (f" y **Sedes[ciudad] = {sede}**" if sede != "Todas" else "")
                 + (" y **Calendario[Mes] = 1**" if anio == "Enero 2026" else "")))
'''),
        md("## 2 · El contexto de filtro"),
        ficha("¿Cómo cambia la medida en cada fila de la matriz?", "Barras por sede con la medida elegida · Línea punteada: el valor del total",
              "Cada barra es una celda de la matriz con su propio filtro de sede; la línea es la misma medida sin ese filtro.",
              "Sumar las barras para obtener el total: solo funciona con medidas aditivas como la venta.",
              "Para Venta neta y Facturas las barras suman el total. Para Ticket y Cumplimiento, el total es otro cálculo: no es la suma ni el promedio de las barras.",
              "Matriz con Sedes[ciudad] en filas y la medida en valores; mira la fila Total."),
        code('''
# @title Gráfico 1 · Una medida, seis contextos
medida = "Ticket promedio"  # @param ["Venta neta", "Facturas", "Ticket promedio", "Cumplimiento"]
anio_g = 2025
filas_s = {c: medidas(V[(V.anio == anio_g) & (V.ciudad == c)], M[(M.anio == anio_g) & (M.ciudad == c)])[medida] for c in ORDEN_CIUDADES}
total = medidas(V[V.anio == anio_g], M[M.anio == anio_g])[medida]
s = pd.Series(filas_s)
pct = medida == "Cumplimiento"
fig = go.Figure(go.Bar(x=s.index, y=s.values, marker_color=AZUL, text=[formato(medida, v) for v in s.values], textposition="outside"))
fig.add_hline(y=total, line_dash="dash", line_color=MAGENTA, annotation_text=f"Total: {formato(medida, total)}", annotation_position="top left")
suma = s.sum()
nota = (f"el total ({formato(medida, total)}) es la suma de las filas" if abs(suma - total) < 1
        else f"el total ({formato(medida, total)}) no es la suma ({formato(medida, suma)}) ni el promedio ({formato(medida, s.mean())}) de las filas")
fig.update_layout(title=f"{medida} 2025 por sede: {nota}", yaxis_tickformat=".0%" if pct else None, height=380,
                  yaxis_range=[0, max(s.max(), total) * 1.2])
fig.show()
'''),
        md("## 3 · El porcentaje que se suma"),
        ficha("¿Qué pasa si el cumplimiento es una columna calculada?", "Barras: cumplimiento por sede y dos totales: el de la columna sumada y el de la medida",
              "Pone lado a lado el total equivocado y el correcto, con las mismas filas.",
              "Mostrar solo el total correcto: el error no se ve.",
              "La barra magenta suma porcentajes: no significa nada. La azul divide la venta total entre la meta total.",
              "Compara una columna calculada con la medida [Cumplimiento] en la misma matriz."),
        code('''
# @title Gráfico 2 · Columna sumada frente a medida
cum = pd.Series({c: medidas(V[(V.anio == 2025) & (V.ciudad == c)], M[(M.anio == 2025) & (M.ciudad == c)])["Cumplimiento"] for c in ORDEN_CIUDADES})
total_medida = medidas(V[V.anio == 2025], M[M.anio == 2025])["Cumplimiento"]
etiquetas = list(cum.index) + ["Total: columna sumada", "Total: medida"]
valores = list(cum.values) + [cum.sum(), total_medida]
fig = go.Figure(go.Bar(x=etiquetas, y=valores, marker_color=[GRIS] * len(cum) + [MAGENTA, AZUL],
                       text=[porc(v) for v in valores], textposition="outside"))
fig.update_layout(title=f"Sumar porcentajes da {porc(cum.sum())}; la medida da {porc(total_medida)}",
                  yaxis_tickformat=".0%", height=380, yaxis_range=[0, cum.sum() * 1.15])
fig.show()
'''),
        md("## 4 · Retos de interpretación"),
        reto(1, "En 2025, ¿cuál es la venta neta de Cali?", ["2.348.175.015", "2.391.555.945", "2.040.095.660", "4.438.208.370"],
             'miles(medidas(V[(V.anio == 2025) & (V.ciudad == "Cali")], M[(M.anio == 2025) & (M.ciudad == "Cali")])["Venta neta"])',
             "Usa la tabla de control con año 2025 y sede Cali. La segunda opción incluye anuladas."),
        reto(2, "El ticket promedio total de 2025, ¿es el promedio de los tickets de las sedes?",
             ["Sí, siempre", "No: es la venta total dividida entre las facturas totales", "Solo si hay seis sedes", "Depende del visual"],
             '"No: es la venta total dividida entre las facturas totales"', "La medida se evalúa en el contexto del total, sin filtro de sede."),
        reto(3, "¿Qué medida da 100 % en cada fila si se escribe sin ALL?", ["Venta neta", "Participación", "Facturas", "Meta"],
             '"Participación"', "Sin ALL, el numerador y el denominador tienen el mismo filtro de sede."),
        tip_ia("Para escribir una medida nueva y verificarla:",
               """En Power BI tengo Ventas (subtotal, estado, id_factura, margen_bruto) relacionada con Sedes y Calendario.
Escribe en DAX la medida [NOMBRE] sin facturas anuladas y dime dos valores de prueba que pueda comparar con una tabla de control."""),
        cierre(["Una medida se calcula para cada celda con su propio contexto de filtro.",
                "El total no es la suma de las filas: es la misma medida con menos filtros.",
                "Porcentajes, promedios y razones van en medidas, nunca en columnas que se suman."],
               f"[Clave 6 · Informe que responde preguntas]({PAGES}#clave-06) · [Cuaderno 06]({colab('06_informe_que_responde.ipynb')})"),
    ]


# ============================================================================
# 06 · Informe que responde preguntas
# ============================================================================
def cuaderno_06():
    return [
        encabezado("Clave 6", "Informe que responde preguntas", "Visuales, segmentaciones y la página del comité", 30, [
            "Elegir el visual según la pregunta y ver qué pasa con la elección equivocada.",
            "Ver la página del comité con las cifras que debe mostrar tu Power BI.",
            "Relacionar cada visual de Power BI con su equivalente en Tableau."], "06_informe_que_responde.ipynb", "clave-06"),
        code(PREPARACION),
        code(MEDIDAS),
        md("""
## 1 · Pregunta y visual
Elige una pregunta del comité y un visual. El cuaderno lo dibuja con los datos reales y te dice si responde la pregunta.
"""),
        ficha("¿Este visual responde esta pregunta?", "Depende de tu elección: tarjeta, barras, líneas, torta o matriz",
              "Ver el visual equivocado con datos reales es la mejor forma de entender por qué no sirve.",
              "—", "Si tienes que explicar el gráfico para que se entienda la respuesta, no es el visual adecuado.",
              "Panel Visualizaciones de Power BI: el icono de cada visual."),
        code('''
# @title Gráfico 1 · Prueba un visual
pregunta = "¿Qué sedes cumplieron la meta?"  # @param ["¿Cuánto vendimos en 2025?", "¿Qué sedes cumplieron la meta?", "¿Cómo fue la venta mes a mes frente a la meta?", "¿Cuánto pesa cada canal?"]
visual = "Barras"  # @param ["Tarjeta", "Barras", "Líneas", "Torta", "Matriz"]
MEJOR = {"¿Cuánto vendimos en 2025?": ["Tarjeta"], "¿Qué sedes cumplieron la meta?": ["Barras"],
         "¿Cómo fue la venta mes a mes frente a la meta?": ["Líneas"], "¿Cuánto pesa cada canal?": ["Barras", "Torta"]}
v25, m25 = V[V.anio == 2025], M[M.anio == 2025]
ok25 = v25[v25.estado != "Anulada"]
if pregunta.startswith("¿Qué sedes"):
    datos = pd.Series({c: medidas(v25[v25.ciudad == c], m25[m25.ciudad == c])["Cumplimiento"] for c in ORDEN_CIUDADES}).sort_values(); es_pct = True
elif pregunta.startswith("¿Cómo fue"):
    datos = ok25.groupby("mes")["subtotal"].sum() / 1e6; es_pct = False
elif pregunta.startswith("¿Cuánto pesa"):
    datos = ok25.groupby("canal")["subtotal"].sum(); datos = (datos / datos.sum()).sort_values(); es_pct = True
else:
    datos = pd.Series({"Venta neta 2025": ok25.subtotal.sum()}); es_pct = False
fig = go.Figure()
if visual == "Tarjeta":
    fig.add_trace(go.Indicator(mode="number", value=datos.iloc[-1] * (100 if es_pct else 1),
                               number=dict(suffix=" %" if es_pct else "", valueformat=",.1f" if es_pct else ",.0f"), title=dict(text=str(datos.index[-1]))))
elif visual == "Barras":
    fig.add_bar(x=datos.values, y=[str(i) for i in datos.index], orientation="h", marker_color=AZUL,
                text=[porc(v) if es_pct else miles(v) for v in datos.values], textposition="outside", cliponaxis=False)
    if pregunta.startswith("¿Qué sedes"): fig.add_vline(x=1, line_dash="dash", annotation_text="Meta 100 %")
elif visual == "Líneas":
    fig.add_scatter(x=[str(i) for i in datos.index], y=datos.values, mode="lines+markers", line=dict(color=AZUL, width=3), name="Venta")
    if pregunta.startswith("¿Cómo fue"):
        fig.add_scatter(x=[str(i) for i in datos.index], y=m25.groupby("mes")["meta_subtotal"].sum().values / 1e6, name="Meta", line=dict(color=GRIS, dash="dash"))
elif visual == "Torta":
    fig.add_pie(labels=[str(i) for i in datos.index], values=datos.values, hole=0.5, sort=False)
else:
    fig.add_table(header=dict(values=["", "Valor"]), cells=dict(values=[[str(i) for i in datos.index], [porc(v) if es_pct else miles(v) for v in datos.values]]))
bien = visual in MEJOR[pregunta]
fig.update_layout(title=("✓ " if bien else "✗ ") + pregunta + ("" if bien else f" · mejor: {' o '.join(MEJOR[pregunta])}"), height=380, showlegend=visual in ("Líneas", "Torta"))
fig.show()
'''),
        md("## 2 · La página del comité"),
        ficha("¿Cómo debe verse la página del comité en Power BI?", "Tres tarjetas, barras de cumplimiento por sede con formato condicional y la línea mensual de venta contra meta",
              "Es la página del Taller P2: arriba las cifras, al centro la comparación y la evolución.",
              "Diez visuales: el comité tendría que buscar el mensaje.",
              "Cambia el canal como si usaras la segmentación: las cifras de las tarjetas deben coincidir con tu Power BI.",
              "Tarjetas + Gráfico de barras agrupadas + Gráfico de líneas + Segmentación de datos por Ventas[canal]."),
        code('''
# @title Gráfico 2 · La página del comité (con segmentación de canal)
canal = "Todos"  # @param ["Todos", "Presencial", "Televentas", "E-commerce"]
from plotly.subplots import make_subplots
vf = v25 if canal == "Todos" else v25[v25.canal == canal]
tot = medidas(vf, m25)
cum_s = pd.Series({c: medidas(vf[vf.ciudad == c], m25[m25.ciudad == c])["Cumplimiento"] for c in ORDEN_CIUDADES}).sort_values()
mensual = vf[vf.estado != "Anulada"].groupby("mes")["subtotal"].sum() / 1e6
fig = make_subplots(rows=2, cols=3, specs=[[{"type": "indicator"}] * 3, [{"type": "xy", "colspan": 2}, None, {"type": "xy"}]],
                    row_heights=[0.28, 0.72], subplot_titles=["", "", "", "Cumplimiento por sede", "Venta mensual y meta (millones)"])
for i, (k, suf, vf_) in enumerate([("Venta neta", "", ",.0f"), ("Cumplimiento", " %", ".1f"), ("Ticket promedio", "", ",.0f")], start=1):
    val = tot[k] * (100 if k == "Cumplimiento" else 1)
    fig.add_trace(go.Indicator(mode="number", value=val, number=dict(suffix=suf, valueformat=vf_, font=dict(size=30)), title=dict(text=k, font=dict(size=14))), row=1, col=i)
fig.add_trace(go.Bar(x=cum_s.values, y=cum_s.index, orientation="h", marker_color=[MAGENTA if c < 1 else GRIS for c in cum_s.values],
                     text=[porc(c) for c in cum_s.values], textposition="outside", cliponaxis=False, showlegend=False), row=2, col=1)
fig.add_trace(go.Scatter(x=[MESES[m - 1] for m in mensual.index], y=mensual.values, mode="lines", line=dict(color=AZUL, width=3), showlegend=False), row=2, col=3)
if canal == "Todos":
    fig.add_trace(go.Scatter(x=MESES, y=m25.groupby("mes")["meta_subtotal"].sum().values / 1e6, mode="lines", line=dict(color=GRIS, dash="dash"), showlegend=False), row=2, col=3)
fig.update_xaxes(tickformat=".0%", range=[0, cum_s.max() * 1.2], row=2, col=1)
fig.update_layout(title=f"Cierre 2025 · canal: {canal}" + (f" · {cum_s.index[0]} es la sede más lejos de la meta" if canal == "Todos" else " (la meta no tiene canal: el cumplimiento compara contra la meta total)"),
                  height=560, margin=dict(t=90))
fig.show()
'''),
        md("""
## 3 · El mismo informe en Tableau

| En Power BI | En Tableau Public |
|---|---|
| Tarjeta | Hoja con la medida en **Texto** |
| Gráfico de barras agrupadas | Dimensión en **Filas**, medida en **Columnas**, ordenar |
| Gráfico de líneas | Fecha (mes) en **Columnas**, medida en **Filas**, marca **Línea** |
| Segmentación de datos | Campo en **Filtros** › **Mostrar filtro** |
| Formato condicional | Campo calculado en **Color** |
| Página | **Dashboard** que junta las hojas |
"""),
        md("## 4 · Retos de interpretación"),
        reto(1, "¿Qué visual responde «¿cómo fue la venta mes a mes frente a la meta?»?", ["Tarjeta", "Barras", "Líneas", "Torta"],
             '"Líneas"', "La evolución en el tiempo se lee como una línea, con la meta como referencia."),
        reto(2, "En la página del comité con todos los canales, ¿qué sede quedó más lejos de su meta?",
             ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira"],
             'pd.Series({c: medidas(v25[v25.ciudad == c], m25[m25.ciudad == c])["Cumplimiento"] for c in ORDEN_CIUDADES}).idxmin()',
             "Es la primera barra magenta del gráfico 2."),
        reto(3, "En Tableau, ¿cómo se llama lo que en Power BI es una página de informe?", ["Hoja", "Dashboard", "Historia", "Libro"],
             '"Dashboard"', "Cada hoja es un visual; el dashboard las junta."),
        tip_ia("Para pasar un visual de Power BI a Tableau:",
               """En Power BI hice [TIPO DE VISUAL] con [CAMPO] en el eje y [MEDIDA] en valores, filtrado por [FILTRO].
Explícame paso a paso cómo hacer lo mismo en Tableau Public: qué va en Columnas, Filas, Marcas y Filtros."""),
        cierre(["Primero las preguntas; después un visual por pregunta.",
                "Arriba las cifras, al centro la comparación y la evolución, el filtro a la vista.",
                "La lógica es la misma en Power BI y en Tableau: cambian los nombres."],
               f"[Laboratorio · Taller P2]({PAGES}#taller-2)"),
    ]
