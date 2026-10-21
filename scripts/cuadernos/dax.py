"""Cuaderno del tutorial de DAX: cada medida del recetario calculada en Python para verificar."""
from .comun import PAGES, PREPARACION, cierre, code, colab, encabezado, ficha, md, reto, tip_ia
from .piloto import MEDIDAS


def tutorial_dax():
    return [
        encabezado("Tutorial", "DAX en Python: verifica tus medidas", "Recetario con cifras de control y el contexto de filtro en gráficos", 25, [
            "Obtener el valor que debe dar cada medida del recetario con cualquier filtro.",
            "Ver por qué el total no es la suma de las filas.",
            "Comparar una participación con y sin ALL."], "tutorial_dax.ipynb", "dax"),
        code(PREPARACION),
        code(MEDIDAS),
        md("""
## 1 · El recetario, con tus filtros
Elige los filtros **igual que en las segmentaciones de tu Power BI**. Cada fila muestra la medida en DAX, su equivalente en Python y el valor que debe dar tu tarjeta.
"""),
        code('''
# @title Recetario con cifras de control
anio = "2025"  # @param ["2024", "2025", "Enero 2026"]
sede = "Todas"  # @param ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira"]
canal = "Todos"  # @param ["Todos", "Presencial", "Televentas", "E-commerce"]
a = 2026 if anio == "Enero 2026" else int(anio)
v, m = V[V.anio == a], M[M.anio == a]
if sede != "Todas": v, m = v[v.ciudad == sede], m[m.ciudad == sede]
if canal != "Todos": v = v[v.canal == canal]
ok = v[v.estado != "Anulada"]
base = medidas(v, m)
vaa = V[(V.anio == a - 1) & (V.estado != "Anulada") & (V.mes.isin(v.mes.unique()))]
if sede != "Todas": vaa = vaa[vaa.ciudad == sede]
if canal != "Todos": vaa = vaa[vaa.canal == canal]
rec = [
    ("Venta neta", 'CALCULATE(SUM(Ventas[subtotal]), Ventas[estado] <> "Anulada")', "ok.subtotal.sum()", base["Venta neta"], False),
    ("Venta con anuladas", "SUM(Ventas[subtotal])", "v.subtotal.sum()", v.subtotal.sum(), False),
    ("Líneas", "COUNTROWS(Ventas)", "len(v)", len(v), False),
    ("Facturas", "CALCULATE(DISTINCTCOUNT(Ventas[id_factura]), …)", "ok.id_factura.nunique()", base["Facturas"], False),
    ("Clientes activos", "CALCULATE(DISTINCTCOUNT(Ventas[id_cliente]), …)", "ok.id_cliente.nunique()", ok.id_cliente.nunique(), False),
    ("Ticket promedio", "DIVIDE([Venta neta], [Facturas])", "venta / facturas", base["Ticket promedio"], False),
    ("Margen %", "DIVIDE([Margen bruto], [Venta neta])", "ok.margen_bruto.sum() / venta", base["Margen %"], True),
    ("Costo", "SUMX(FILTER(Ventas, …), Ventas[subtotal] - Ventas[margen_bruto])", "(ok.subtotal - ok.margen_bruto).sum()", (ok.subtotal - ok.margen_bruto).sum(), False),
    ("Meta", "SUM(Metas[meta_subtotal])", "m.meta_subtotal.sum()", base["Meta"], False),
    ("Cumplimiento", "DIVIDE([Venta neta], [Meta])", "venta / meta", base["Cumplimiento"], True),
    ("Venta AA", "CALCULATE([Venta neta], SAMEPERIODLASTYEAR(Calendario[Date]))", "venta del mismo periodo del año anterior", vaa.subtotal.sum() if len(vaa) else np.nan, False),
    ("Var % AA", "DIVIDE([Venta neta] - [Venta AA], [Venta AA])", "venta / venta_aa - 1", base["Venta neta"] / vaa.subtotal.sum() - 1 if len(vaa) else np.nan, True),
]
tabla = pd.DataFrame([{"Medida": r[0], "DAX": r[1], "En Python": r[2], "Debe dar": (porc(r[3], signo=r[0] == "Var % AA") if r[4] else miles(r[3])) if pd.notna(r[3]) else "(vacío)"} for r in rec])
display(tabla.style.hide(axis="index").set_properties(subset=["DAX", "En Python"], **{"font-family": "monospace", "font-size": "11px"}))
if canal != "Todos":
    display(Markdown("**Ojo:** Metas no tiene canal. Con un canal elegido, Meta y Cumplimiento comparan contra la meta completa de la sede."))
'''),
        md("## 2 · El total no es la suma de las filas"),
        ficha("¿Por qué los clientes por canal suman más que el total?", "Barras: clientes activos por canal · Línea: clientes activos en total",
              "Pone lado a lado lo que muestra cada fila y lo que muestra el total de una matriz.",
              "Una tabla: el total parece un error de cálculo.",
              "Un cliente que compra por dos canales cuenta en dos barras y una sola vez en la línea. El total se calcula con su propio contexto.",
              "Matriz con Ventas[canal] en filas y [Clientes activos] en valores; compara la suma de las filas con la fila Total."),
        code('''
# @title Gráfico 1 · Clientes activos por canal y en total
v25 = V[(V.anio == 2025) & (V.estado != "Anulada")]
por_canal = v25.groupby("canal")["id_cliente"].nunique().sort_values()
total = v25.id_cliente.nunique()
fig = go.Figure(go.Bar(x=por_canal.index, y=por_canal.values, marker_color=AZUL, text=por_canal.values, textposition="outside"))
fig.add_hline(y=total, line_dash="dash", line_color=MAGENTA, annotation_text=f"Total: {total}", annotation_position="top left")
fig.update_layout(title=f"Las filas suman {por_canal.sum()} clientes, pero el total es {total}: muchos compran por varios canales",
                  yaxis_title="Clientes activos 2025", height=360, yaxis_range=[0, max(total, por_canal.max()) * 1.2])
fig.show()
'''),
        md("## 3 · CALCULATE con y sin ALL"),
        ficha("¿Qué cambia si la participación no tiene ALL?", "Barras por sede: participación con ALL(Sedes) y sin ALL",
              "Compara las dos versiones de la misma medida en la misma matriz.",
              "Explicar ALL solo con texto.",
              "Sin ALL, cada sede se divide por sí misma: 100 % en todas. Con ALL, el denominador es el total y las barras suman 100 %.",
              "Participación = DIVIDE([Venta neta], CALCULATE([Venta neta], ALL(Sedes)))."),
        code('''
# @title Gráfico 2 · Participación con y sin ALL
version = "Con ALL(Sedes)"  # @param ["Con ALL(Sedes)", "Sin ALL"]
venta_s = v25.groupby("ciudad")["subtotal"].sum().reindex(ORDEN_CIUDADES)
part = venta_s / venta_s.sum() if version == "Con ALL(Sedes)" else venta_s / venta_s
fig = go.Figure(go.Bar(x=part.index, y=part.values, marker_color=AZUL if version.startswith("Con") else MAGENTA,
                       text=[porc(x) for x in part.values], textposition="outside"))
fig.update_layout(title=f"{version}: las barras suman {porc(part.sum())}", yaxis_tickformat=".0%", height=360, yaxis_range=[0, part.max() * 1.2])
fig.show()
'''),
        md("## 4 · Retos"),
        reto(1, "¿Cuántos clientes activos tuvo la empresa en 2025?", ["327", "369", "420", "845"],
             'str(v25.id_cliente.nunique())', "Es la línea del gráfico 1. 845 es la suma de las filas por canal."),
        reto(2, "¿Qué función DAX quita el filtro de sede del denominador?", ["SUM", "ALL", "FILTER", "VAR"],
             '"ALL"', "Dentro de CALCULATE, ALL(Sedes) ignora el filtro de sede."),
        reto(3, "¿Qué medida del recetario usa un iterador?", ["Venta neta", "Costo", "Meta", "Cumplimiento"],
             '"Costo"', "SUMX evalúa subtotal − margen fila por fila y suma los resultados."),
        tip_ia("Para escribir una medida nueva:",
               """En Power BI tengo Ventas (subtotal, estado, canal, id_cliente, margen_bruto), Metas, Sedes, Clientes y Calendario.
Escribe en DAX la medida [NOMBRE] con VAR y RETURN, sin facturas anuladas, y dime cómo verificarla con una matriz."""),
        cierre(["Cada medida del recetario tiene su valor de control: compáralo antes de diseñar el informe.",
                "El total se calcula con su propio contexto; no es la suma de las filas.",
                "CALCULATE agrega, reemplaza o quita filtros; ALL es la forma de quitarlos."],
               f"[Tutorial de DAX]({PAGES}#dax) · [Clave 4 · Medidas DAX]({PAGES}#clave-04)"),
    ]
