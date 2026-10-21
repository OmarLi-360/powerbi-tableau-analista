"""Cuadernos de control de las claves 1, 2, 5, 7 y 8 (Power BI + Tableau)."""
from .comun import PAGES, PREPARACION, cierre, code, colab, encabezado, ficha, md, reto, tip_ia

PERFIL = '''
# @title Preparar el perfil de columnas (como Power Query)
erp = pd.read_csv(ruta("ventas_erp_sucio.csv"), dtype=str, keep_default_na=False)
def es_entero(x): return x.strip().lstrip("-").isdigit()
def es_fecha(x):
    for f in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            pd.to_datetime(x, format=f); return True
        except ValueError:
            pass
    return False
def detectar(col):
    m = [x for x in col.head(200) if x != ""]
    if m and sum(map(es_entero, m)) / len(m) >= 0.9: return "Número entero"
    if m and sum(map(es_fecha, m)) / len(m) >= 0.9: return "Fecha"
    return "Texto"
def limpiar(nombre, x):
    if x == "": return x
    if nombre in ("Valor Neto", "Cantidad"): return x.replace("$", "").replace(".", "").replace("und", "").strip()
    if nombre == "Fecha" and es_entero(x): return (pd.Timestamp("1899-12-30") + pd.Timedelta(days=int(x))).strftime("%Y-%m-%d")
    if nombre == "Cod Cliente": return x.strip().upper()
    return x
TIPO_OK = {"Linea": "Número entero", "Cantidad": "Número entero", "Valor Neto": "Número entero", "Fecha": "Fecha"}
def perfil(tabla, modo):
    filas = []
    for c in tabla.columns:
        col = tabla[c] if modo == "Automáticos" else tabla[c].map(lambda x: limpiar(c, x))
        tipo = detectar(tabla[c]) if modo == "Automáticos" else TIPO_OK.get(c, "Texto")
        ok = col[col != ""]
        validos = ok.map(es_entero).sum() if tipo == "Número entero" else ok.map(es_fecha).sum() if tipo == "Fecha" else len(ok)
        filas.append({"Columna": c, "Tipo": tipo, "Válidos": int(validos), "Errores": int(len(ok) - validos),
                      "Vacíos": int((col == "").sum()), "Distintos": col[col != ""].nunique()})
    return pd.DataFrame(filas).set_index("Columna")
display(Markdown(f"Exportación leída: **{miles(len(erp))} filas** y {erp.shape[1]} columnas, todo como texto (como llega el CSV)."))
'''

MEDIDAS_T = '''
# @title Preparar ventas, metas y el Calendario
validas_t = validas.copy()
metas_c = metas.merge(sedes[["id_sede", "ciudad"]], on="id_sede")
mensual = validas_t.groupby(["ciudad", "anio", "mes"])["subtotal"].sum()
def serie(sede, anio):
    s = validas_t[validas_t.anio == anio]
    if sede != "Todas": s = s[s.ciudad == sede]
    return s.groupby("mes")["subtotal"].sum().reindex(range(1, 13), fill_value=0)
display(Markdown("Listo: venta neta mensual por sede y año (sin anuladas)."))
'''


# ============================================================================
# 01 · Conectar y perfilar
# ============================================================================
def cuaderno_01():
    return [
        encabezado("Clave 1", "Conectar y perfilar", "La calidad de cada columna antes de cargar", 25, [
            "Ver la calidad de cada columna con el tipo automático y con el corregido.",
            "Leer la distribución para encontrar variantes y llaves sucias.",
            "Comprobar que el archivo del curso llega limpio."], "01_conectar_y_perfilar.ipynb", "clave-01"),
        code(PREPARACION),
        code(PERFIL),
        md("""
## 1 · Calidad de columna
Es lo que muestra Power Query con **Vista › Calidad de columna**: el porcentaje de valores válidos, con error y vacíos. Elige si quieres ver los tipos que adivina el paso automático **Tipo cambiado** o los tipos después de corregir en la consulta.
"""),
        ficha("¿Qué columnas llegan con problemas?", "Barras apiladas al 100 %: válidos, errores y vacíos por columna",
              "Es la misma barra que Power Query dibuja sobre cada columna, en un solo gráfico.",
              "Una tabla de conteos: los porcentajes pequeños de error pasan desapercibidos.",
              "Cualquier segmento rojo es un valor que no encaja en el tipo. El gris son vacíos: pueden ser válidos (una venta sin valor) o un problema.",
              "Editor de Power Query › Vista › Calidad de columna, con el perfil basado en todo el conjunto de datos."),
        code('''
# @title Gráfico 1 · Calidad de columna
tipos = "Automáticos"  # @param ["Automáticos", "Corregidos"]
p = perfil(erp, tipos)
pct = p[["Válidos", "Errores", "Vacíos"]].div(len(erp))
fig = go.Figure()
for col, color in [("Válidos", BIEN), ("Errores", MAL), ("Vacíos", GRIS)]:
    fig.add_bar(name=col, y=[f"{c} ({p.Tipo[c]})" for c in p.index], x=pct[col], orientation="h", marker_color=color,
                text=[f"{v:.1%}".replace(".", ",") if v > 0.005 else "" for v in pct[col]])
con_error = p[p.Errores > 0]
fig.update_layout(barmode="stack", xaxis_tickformat=".0%", height=420, yaxis=dict(autorange="reversed"), legend=dict(orientation="h", y=-0.12),
                  title=(f"Tipos automáticos: {len(con_error)} columnas con errores ({', '.join(con_error.index)})" if len(con_error)
                         else "Tipos corregidos: ninguna columna con errores"))
fig.show()
display(p.style.format({"Válidos": miles, "Errores": miles, "Vacíos": miles, "Distintos": miles}))
'''),
        md("## 2 · Distribución: lo que el tipo no muestra"),
        ficha("¿De cuántas formas llega escrita la ciudad?", "Barras: filas por cada valor distinto de Ciudad · Magenta: variantes que no son el nombre oficial",
              "Con el tipo correcto no hay errores, pero la distribución muestra 16 valores donde debería haber 6.",
              "Mirar solo la calidad de columna: diría 100 % válido.",
              "Cada barra magenta es una ciudad «nueva» en el tablero. Se normaliza con Reemplazar valores o con un maestro de sedes.",
              "Vista › Distribución de columnas; y en el perfil, la lista de valores más frecuentes."),
        code('''
# @title Gráfico 2 · Distribución de Ciudad
dist = erp["Ciudad"].value_counts().sort_values()
oficiales = set(sedes.ciudad)
fig = go.Figure(go.Bar(x=dist.values, y=[f"«{c}»" for c in dist.index], orientation="h",
                       marker_color=[AZUL if c in oficiales else MAGENTA for c in dist.index],
                       text=dist.values, textposition="outside", cliponaxis=False))
fig.update_layout(title=f"{len(dist)} valores distintos para {len(oficiales)} sedes: {miles(dist[[c not in oficiales for c in dist.index]].sum())} filas con variantes",
                  xaxis_title="Filas", height=480)
dar_aire(fig, dist.max())
fig.show()
'''),
        md("## 3 · El archivo del curso"),
        ficha("¿ventas.csv está listo para el modelo?", "Barras: valores distintos de cada columna de ventas.csv frente al número de filas",
              "Una llave como id_linea debe tener tantos valores distintos como filas; los atributos, pocos.",
              "Revisar solo los tipos: no muestra si una llave se repite.",
              "id_linea llega a 17.106 (una por fila): es llave. canal y estado tienen 3: son atributos.",
              "Distribución de columnas: «distintos» y «únicos» bajo cada encabezado."),
        code('''
# @title Gráfico 3 · Distintos por columna en ventas.csv
cols = ["id_linea", "id_factura", "fecha", "id_cliente", "sku", "id_vendedor", "id_sede", "canal", "estado"]
dist_v = ventas[cols].nunique()
fig = go.Figure(go.Bar(x=dist_v.index, y=dist_v.values, marker_color=[AZUL if v == len(ventas) else GRIS for v in dist_v.values],
                       text=[miles(v) for v in dist_v.values], textposition="outside"))
fig.add_hline(y=len(ventas), line_dash="dash", line_color=MAGENTA, annotation_text=f"Filas: {miles(len(ventas))}")
fig.update_layout(title="Solo id_linea es única en cada fila: es la llave de la tabla Ventas", yaxis_type="log", yaxis_title="Valores distintos (escala log)", height=380)
fig.show()
'''),
        md("## 4 · Retos de interpretación"),
        reto(1, "Con los tipos automáticos, ¿cuántos errores tiene la columna Fecha?", ["0", "38", "54", "75"],
             'str(perfil(erp, "Automáticos").loc["Fecha", "Errores"])', "Son las fechas que llegaron como número serial (45299): no encajan en el tipo fecha."),
        reto(2, "Valor Neto quedó como texto sin errores. ¿Qué pasa si la cargas así?",
             ["Nada, está bien", "No se puede sumar: hay que limpiar «$» y puntos y cambiar a número", "Power BI la convierte sola en el informe", "Se borran los vacíos"],
             '"No se puede sumar: hay que limpiar «$» y puntos y cambiar a número"', "Sin errores no significa listo: el tipo también debe ser el correcto."),
        reto(3, "¿Qué columna de ventas.csv es la llave de la tabla?", ["id_factura", "id_linea", "id_cliente", "fecha"],
             '"id_linea"', "Es la única con tantos valores distintos como filas."),
        tip_ia("Para entender un error de Power Query:",
               """En Power Query, la columna [NOMBRE] tiene [X] % de errores y el valor que lo causa es [VALOR].
Explica la causa y los pasos (menú por menú, en español) para corregirlo en la consulta."""),
        cierre(["Primero se perfila, después se carga.",
                "Calidad de columna muestra errores y vacíos; la distribución muestra variantes y llaves.",
                "Se corrige en la consulta, no en el informe."],
               f"[Clave 2 · Transformar para el modelo]({PAGES}#clave-02) · [Cuaderno 02]({colab('02_transformar_para_el_modelo.ipynb')})"),
    ]


# ============================================================================
# 02 · Transformar para el modelo
# ============================================================================
def cuaderno_02():
    return [
        encabezado("Clave 2", "Transformar para el modelo", "Hechos, dimensiones y tabla de fechas", 25, [
            "Ver cuántos días no tienen ventas y por qué hace falta un Calendario.",
            "Comparar el tamaño de la tabla plana con el del modelo estrella.",
            "Entender la diferencia de detalle entre ventas y metas."], "02_transformar_para_el_modelo.ipynb", "clave-02"),
        code(PREPARACION),
        md("## 1 · Los días sin ventas"),
        ficha("¿Cuántos días de cada mes no tuvieron ventas?", "Barras apiladas por mes: días con ventas y días sin ventas, 2024 y 2025",
              "Muestra que los huecos son regulares (domingos y festivos) y suman más de cien días.",
              "Solo el total de días sin ventas: no se ve que pasa todos los meses.",
              "La parte gris son días que no existen en Ventas[fecha]. Por eso el Calendario se crea aparte, con todos los días.",
              "Tabla Calendario con CALENDAR(DATE(2024,1,1), DATE(2026,12,31)) y Marcar como tabla de fechas."),
        code('''
# @title Gráfico 1 · Días con y sin ventas
cal = pd.DataFrame({"Date": pd.date_range("2024-01-01", "2025-12-31")})
cal["con_ventas"] = cal.Date.isin(ventas.fecha.dt.normalize())
cal["periodo"] = cal.Date.dt.to_period("M").dt.to_timestamp()
g = cal.groupby("periodo")["con_ventas"].agg(["sum", "count"])
fig = go.Figure()
fig.add_bar(x=g.index, y=g["sum"], name="Con ventas", marker_color=AZUL)
fig.add_bar(x=g.index, y=g["count"] - g["sum"], name="Sin ventas", marker_color=GRIS)
sin = int((~cal.con_ventas).sum())
eje_meses(fig, g.index)
fig.update_layout(barmode="stack", title=f"{sin} de {len(cal)} días de 2024–2025 no tienen ventas: el Calendario los incluye",
                  yaxis_title="Días", height=360, legend=dict(orientation="h", y=-0.2))
fig.show()
'''),
        md("## 2 · Tabla plana o modelo estrella"),
        ficha("¿Cuánto se repite en la tabla plana?", "Barras: celdas de la tabla plana y del modelo estrella, por tabla",
              "Compara el tamaño total y muestra que las dimensiones son pequeñas.",
              "Hablar de «eficiencia» sin cifras.",
              "En la tabla plana, el segmento y la ciudad se escriben 17.106 veces. En la estrella, una vez por cliente o sede.",
              "Power BI comprime los datos, pero el modelo estrella sigue siendo más claro, más rápido y más fácil de mantener."),
        code('''
# @title Gráfico 2 · Celdas en cada diseño
n = len(ventas)
plana = n * 17
estrella = {"Ventas (hechos + llaves)": n * 11, "Clientes": len(clientes) * 3, "Productos": len(productos) * 3,
            "Sedes": len(sedes) * 3, "Vendedores": len(vendedores) * 2, "Calendario": 1096 * 4}
fig = go.Figure()
fig.add_bar(name="Tabla plana", x=["Tabla plana"], y=[plana], marker_color=GRIS, text=[miles(plana)], textposition="outside")
base = 0
for i, (k, v) in enumerate(estrella.items()):
    fig.add_bar(name=k, x=["Modelo estrella"], y=[v], marker_color=[AZUL, TEAL, MAGENTA, "#7A86E8", "#E8A33D", "#5BAA6A"][i])
tot = sum(estrella.values())
fig.update_layout(barmode="stack", title=f"El modelo estrella guarda {porc(1 - tot / plana)} menos celdas ({miles(tot)} frente a {miles(plana)})",
                  yaxis_title="Celdas", height=440, legend=dict(orientation="h", y=-0.15))
dims = tot - estrella["Ventas (hechos + llaves)"]
fig.add_annotation(x="Modelo estrella", y=tot, text=f"{miles(tot)}<br>(dimensiones: {miles(dims)})", showarrow=False, yshift=22)
fig.show()
'''),
        md("## 3 · La granularidad: día frente a mes"),
        ficha("¿Por qué Metas necesita una columna fecha_mes?", "Arriba: venta diaria de 2025 · Abajo: meta mensual de 2025",
              "Dos paneles con el mismo eje de tiempo muestran que una tabla tiene 365 puntos y la otra 12.",
              "Unir metas y ventas en una tabla: la meta quedaría repetida en cada venta del mes.",
              "Para comparar, ambas se llevan al nivel del mes: las ventas se suman por mes y la meta se relaciona con el Calendario por el primer día del mes.",
              "Metas[fecha_mes] = DATE(Metas[anio], Metas[mes], 1) y relación con Calendario[Date]."),
        code('''
# @title Gráfico 3 · Venta diaria y meta mensual
from plotly.subplots import make_subplots
d = validas[validas.anio == 2025].groupby(validas.fecha.dt.normalize())["subtotal"].sum() / 1e6
m = metas[metas.anio == 2025].groupby("mes")["meta_subtotal"].sum() / 1e6
fm = pd.to_datetime([f"2025-{x:02d}-01" for x in m.index])
fig = make_subplots(rows=2, cols=1, shared_xaxes=True, vertical_spacing=0.08,
                    subplot_titles=[f"Ventas: {len(d)} días con datos", "Metas: 12 meses (una fila por sede y mes)"])
fig.add_scatter(x=d.index, y=d.values, mode="lines", line=dict(color=AZUL, width=1), row=1, col=1, showlegend=False)
fig.add_bar(x=fm, y=m.values, marker_color=GRIS, row=2, col=1, showlegend=False)
eje_meses(fig, fm)
fig.update_layout(title="Ventas es diaria y Metas mensual: se comparan al nivel del mes", height=460, yaxis_title=MM)
fig.show()
'''),
        md("## 4 · Retos de interpretación"),
        reto(1, "¿Cuántos días de 2024–2025 no tienen ventas?", ["0", "52", "112", "365"], "str(sin)",
             "Es la parte gris del gráfico 1."),
        reto(2, "¿En qué tabla del modelo va la columna categoría?", ["Ventas", "Productos", "Calendario", "Sedes"],
             '"Productos"', "Describe al producto: se guarda una vez por producto."),
        reto(3, "¿Qué columna se agrega a Metas para relacionarla con el Calendario?",
             ["mes", "fecha_mes = DATE(anio, mes, 1)", "id_linea", "ciudad"],
             '"fecha_mes = DATE(anio, mes, 1)"', "El primer día del mes existe en el Calendario y representa el mes."),
        tip_ia("Para diseñar el modelo a partir de una tabla plana:",
               """Tengo una tabla plana con estas columnas: [LISTA].
Propón un modelo estrella: tabla de hechos, dimensiones, llaves y la tabla Calendario en DAX."""),
        cierre(["Hechos con números y llaves; dimensiones con atributos, una vez cada uno.",
                "El Calendario tiene todos los días, haya o no ventas.",
                "Tablas con distinto detalle se comparan a través de dimensiones comunes."],
               f"[Clave 3 · Modelo estrella]({PAGES}#clave-03) · [Cuaderno 03]({colab('03_modelo_estrella.ipynb')})"),
    ]


# ============================================================================
# 05 · Inteligencia de tiempo
# ============================================================================
def cuaderno_05():
    return [
        encabezado("Clave 5", "Inteligencia de tiempo", "Acumulado del año, año anterior y variación", 25, [
            "Comparar el acumulado de 2025 con el de 2024 para cualquier sede.",
            "Ver la variación mensual de cada sede frente al año anterior.",
            "Tener la tabla de control de las medidas de tiempo."], "05_inteligencia_de_tiempo.ipynb", "clave-05"),
        code(PREPARACION),
        code(MEDIDAS_T),
        ficha("¿Cómo va el año frente al anterior?", "Líneas: venta acumulada de 2025 (TOTALYTD) y de 2024 (SAMEPERIODLASTYEAR), mes a mes",
              "El acumulado muestra la distancia entre los años en cada momento del año.",
              "Barras mensuales: un mes malo parece una tendencia.",
              "La distancia vertical entre las líneas es la diferencia acumulada. Si se abre, el año va mejor que el anterior.",
              "Venta YTD = TOTALYTD([Venta neta], Calendario[Date]); Venta YTD AA = CALCULATE([Venta YTD], SAMEPERIODLASTYEAR(Calendario[Date]))."),
        code('''
# @title Gráfico 1 · Acumulado del año
sede = "Todas"  # @param ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira"]
y24, y25 = serie(sede, 2024).cumsum() / 1e6, serie(sede, 2025).cumsum() / 1e6
x = pd.to_datetime([f"2025-{m:02d}-01" for m in range(1, 13)])
fig = go.Figure()
fig.add_scatter(x=x, y=y25, name="Venta YTD 2025", line=dict(color=AZUL, width=3))
fig.add_scatter(x=x, y=y24, name="Venta YTD AA (2024)", line=dict(color=GRIS, width=2, dash="dash"))
var = y25.iloc[-1] / y24.iloc[-1] - 1
eje_meses(fig, x)
fig.update_layout(title=f"{sede if sede != 'Todas' else 'La empresa'} cerró 2025 con {porc(var, signo=True)} frente a 2024",
                  yaxis_title=MM, height=380, legend=dict(orientation="h", y=-0.2))
fig.show()
'''),
        ficha("¿En qué meses creció o cayó cada sede?", "Mapa de calor: variación % contra el mismo mes del año anterior, por sede y mes",
              "Seis sedes por doce meses: la cuadrícula muestra patrones (una sede débil todo el año o un mes malo para todas).",
              "Seis gráficos de líneas: obliga a comparar entre gráficos.",
              "Azul es crecimiento, magenta es caída. Una fila con mucho magenta es una sede con problemas, no un mes malo.",
              "Matriz con Sedes[ciudad] en filas, Calendario[Mes] en columnas y [Var % AA] con formato condicional."),
        code('''
# @title Gráfico 2 · Variación mensual por sede
z = pd.DataFrame({c: serie(c, 2025) / serie(c, 2024) - 1 for c in ORDEN_CIUDADES}).T
fig = go.Figure(go.Heatmap(z=z.values, x=MESES, y=z.index, zmid=0, colorscale=[[0, MAGENTA], [0.5, "#F4F6FB"], [1, AZUL]],
                           text=[[porc(v, signo=True) for v in fila] for fila in z.values], texttemplate="%{text}", colorbar=dict(tickformat=".0%")))
negativos = (z < 0).sum(axis=1)
fig.update_layout(title=f"{negativos.idxmax()} tuvo más meses por debajo del año anterior ({negativos.max()} de 12)",
                  yaxis=dict(autorange="reversed"), height=380)
fig.show()
'''),
        ficha("¿Qué sede creció más en el año?", "Barras: variación 2025 frente a 2024 por sede · Línea: variación de la empresa",
              "Es la tabla de control de Var % AA en forma de ranking.",
              "Solo la cifra total: no se ve quién empuja y quién frena.",
              "Las sedes por encima de la línea crecen más que la empresa.",
              "Matriz con [Venta neta], [Venta AA] y [Var % AA] por sede, filtro Año = 2025."),
        code('''
# @title Gráfico 3 · Variación anual por sede
v = pd.Series({c: serie(c, 2025).sum() / serie(c, 2024).sum() - 1 for c in ORDEN_CIUDADES}).sort_values()
total = serie("Todas", 2025).sum() / serie("Todas", 2024).sum() - 1
fig = go.Figure(go.Bar(x=v.values, y=v.index, orientation="h", marker_color=[AZUL if x > total else GRIS for x in v.values],
                       text=[porc(x, signo=True) for x in v.values], textposition="outside", cliponaxis=False))
fig.add_vline(x=total, line_dash="dash", line_color=MAGENTA, annotation_text=f"Empresa {porc(total, signo=True)}")
fig.update_layout(title=f"{v.index[-1]} creció {porc(v.iloc[-1], signo=True)}; la empresa, {porc(total, signo=True)}",
                  xaxis_tickformat=".0%", height=360, xaxis_range=[0, v.max() * 1.25])
fig.show()
'''),
        md("## Retos de interpretación"),
        reto(1, "¿Cuánto creció la empresa en 2025 frente a 2024?", ["+12,0 %", "+18,9 %", "+25,2 %", "+39,1 %"],
             'porc(serie("Todas", 2025).sum() / serie("Todas", 2024).sum() - 1, signo=True)', "Es el final de la línea azul del gráfico 1 con «Todas»."),
        reto(2, "¿Qué sede creció más en 2025?", ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Pereira"],
             'pd.Series({c: serie(c, 2025).sum() / serie(c, 2024).sum() - 1 for c in ORDEN_CIUDADES}).idxmax()', "Es la barra más larga del gráfico 3."),
        reto(3, "Venta AA sale vacía en todas las filas. ¿Qué revisas primero?",
             ["El color del visual", "Que la medida use Calendario[Date] y que el Calendario esté marcado y relacionado", "El número de decimales", "La segmentación de canal"],
             '"Que la medida use Calendario[Date] y que el Calendario esté marcado y relacionado"', "Es la condición para que funcionen las funciones de tiempo."),
        tip_ia("Para crear medidas de tiempo:",
               """En Power BI tengo [Venta neta] y un Calendario marcado (columna Date).
Escribe Venta YTD, Venta AA y Var % AA, y dame una prueba con valores que pueda comparar."""),
        cierre(["TOTALYTD acumula; SAMEPERIODLASTYEAR desplaza un año; DIVIDE protege la variación.",
                "Todo depende de un Calendario marcado y relacionado.",
                "Una misma medida responde para cualquier sede, canal o mes."],
               f"[Clave 6 · Informe que responde preguntas]({PAGES}#clave-06) · [Cuaderno 06]({colab('06_informe_que_responde.ipynb')})"),
    ]


# ============================================================================
# 07 · Interactividad y narrativa
# ============================================================================
def cuaderno_07():
    return [
        encabezado("Clave 7", "Interactividad y narrativa", "Detalle, información sobre herramientas y móvil", 25, [
            "Recorrer una ruta de detalle de la empresa al producto.",
            "Diseñar la información que aparece al pasar el mouse.",
            "Ver una página pensada para el celular."], "07_interactividad_y_narrativa.ipynb", "clave-07"),
        code(PREPARACION),
        ficha("¿De dónde sale la venta? Empresa → sede → categoría → producto", "Gráfico solar interactivo: haz clic en un anillo para entrar al detalle y en el centro para volver",
              "Representa la jerarquía completa y permite profundizar con clics, como la obtención de detalles.",
              "Cuatro tablas separadas: se pierde la relación entre niveles.",
              "Haz clic en una sede: el gráfico muestra solo sus categorías. Es la misma idea de una página de detalle filtrada.",
              "En Power BI: jerarquía en el eje y botones de exploración (flecha hacia abajo), u obtención de detalles hacia otra página."),
        code('''
# @title Gráfico 1 · Ruta de detalle
v25 = validas[validas.anio == 2025]
fig = px.sunburst(v25, path=["ciudad", "categoria", "producto"], values="subtotal", color="ciudad",
                  color_discrete_sequence=[AZUL, TEAL, MAGENTA, "#7A86E8", "#E8A33D", "#5BAA6A"])
fig.update_traces(hovertemplate="<b>%{label}</b><br>Venta neta: $ %{value:,.0f}<br>%{percentParent:.1%} del nivel superior<extra></extra>")
fig.update_layout(title="Venta neta 2025: haz clic en una sede para ver sus categorías y productos", height=560)
fig.show()
'''),
        ficha("¿Qué conviene mostrar al pasar el mouse?", "Barras de venta por sede con información sobre herramientas: meta, cumplimiento, facturas y ticket",
              "La barra responde la pregunta principal; la información sobre herramientas da el contexto sin ocupar espacio.",
              "Poner todas las cifras como etiquetas: la página se llena de números.",
              "Pasa el mouse por cada barra: ves las cuatro cifras que el gerente pediría a continuación.",
              "Página de información sobre herramientas con tres o cuatro tarjetas, asignada en Formato › Información sobre herramientas."),
        code('''
# @title Gráfico 2 · Información sobre herramientas
met = metas[metas.anio == 2025].merge(sedes[["id_sede", "ciudad"]], on="id_sede").groupby("ciudad")["meta_subtotal"].sum()
t = v25.groupby("ciudad").agg(venta=("subtotal", "sum"), facturas=("id_factura", "nunique")).join(met).sort_values("venta")
t["cumpl"], t["ticket"] = t.venta / t.meta_subtotal, t.venta / t.facturas
fig = go.Figure(go.Bar(x=t.venta / 1e6, y=t.index, orientation="h", marker_color=[MAGENTA if c < 1 else GRIS for c in t.cumpl],
                       customdata=np.c_[t.meta_subtotal / 1e6, t.cumpl * 100, t.facturas, t.ticket],
                       hovertemplate="<b>%{y}</b><br>Venta: $ %{x:,.0f} M<br>Meta: $ %{customdata[0]:,.0f} M<br>Cumplimiento: %{customdata[1]:.1f} %<br>Facturas: %{customdata[2]:,.0f}<br>Ticket: $ %{customdata[3]:,.0f}<extra></extra>"))
fig.update_layout(title="Pasa el mouse por una barra: magenta son las sedes debajo de la meta", xaxis_title=MM, height=360)
fig.show()
'''),
        ficha("¿Cómo se ve el detalle de todas las sedes en el celular?", "Pequeños múltiplos: venta mensual 2025 de cada sede, en dos columnas angostas",
              "Mismos ejes para todas: se comparan las formas de un vistazo y caben en una pantalla vertical.",
              "Un gráfico con seis líneas encimadas: ilegible en el celular.",
              "Cada panel es una sede. En Power BI, el diseño para móvil apila los visuales en una columna.",
              "Vista › Diseño para móvil; en el informe, el visual con «Pequeños múltiplos» (Sedes[ciudad])."),
        code('''
# @title Gráfico 3 · Pequeños múltiplos por sede
m = v25.groupby(["ciudad", "mes"])["subtotal"].sum().reset_index()
m["Mes"] = m.mes.map(lambda x: MESES[x - 1]); m["Millones"] = m.subtotal / 1e6
fig = px.line(m, x="Mes", y="Millones", facet_col="ciudad", facet_col_wrap=2, category_orders={"ciudad": ORDEN_CIUDADES, "Mes": MESES},
              color_discrete_sequence=[AZUL])
fig.for_each_annotation(lambda a: a.update(text=a.text.split("=")[-1]))
fig.update_layout(title="Venta mensual 2025 por sede (escala común)", height=620, width=520)
fig.show()
'''),
        md("## Retos de interpretación"),
        reto(1, "En el gráfico 1, ¿qué categoría vende más en Barranquilla?", ["Papelería", "Tecnología", "Aseo y cafetería", "Mobiliario", "Impresión"],
             'v25[v25.ciudad == "Barranquilla"].groupby("categoria")["subtotal"].sum().idxmax()', "Haz clic en Barranquilla y mira el anillo más grande."),
        reto(2, "¿Qué herramienta de Power BI lleva de una barra a una página de detalle filtrada?",
             ["Marcador", "Obtención de detalles", "Segmentación", "Información sobre herramientas"],
             '"Obtención de detalles"', "Una sola página de detalle recibe el filtro desde cualquier visual."),
        reto(3, "¿Cuál es el equivalente de los marcadores en Tableau?", ["Hojas", "Historias", "Filtros", "Parámetros"],
             '"Historias"', "Una historia es una secuencia de vistas para contar un hallazgo."),
        tip_ia("Para el guion de una presentación con marcadores:",
               """Mi tablero muestra [RESUMEN]. El hallazgo principal es [HALLAZGO].
Propón tres marcadores (qué muestra cada uno y una frase de texto) para presentarlo en dos minutos."""),
        cierre(["La obtención de detalles reemplaza las páginas repetidas.",
                "La información sobre herramientas da contexto sin llenar la página.",
                "Los marcadores cuentan la historia en pasos; el diseño para móvil la lleva al celular."],
               f"[Clave 8 · Publicar y portafolio]({PAGES}#clave-08) · [Cuaderno 08]({colab('08_publicar_y_gobernar.ipynb')})"),
    ]


# ============================================================================
# 08 · Publicar, gobernar y portafolio
# ============================================================================
def cuaderno_08():
    return [
        encabezado("Clave 8", "Publicar, gobernar y portafolio", "Seguridad por filas y qué publicar dónde", 20, [
            "Comprobar que cada rol de seguridad ve solo sus filas.",
            "Verificar que la suma de los roles da el total.",
            "Decidir dónde publicar cada tablero."], "08_publicar_y_gobernar.ipynb", "clave-08"),
        code(PREPARACION),
        md("""
## 1 · Seguridad de nivel de fila (RLS)
Cada jefe de sede tiene un rol con el filtro `Sedes[ciudad] = "…"`. Este cuaderno calcula lo que vería cada rol con **Modelado › Ver como**, para que compares con tu Power BI.
"""),
        ficha("¿Qué venta ve cada rol?", "Barras: venta neta 2025 visible para cada rol · Línea: lo que ve la gerencia (sin rol)",
              "Comprueba de un vistazo que cada rol ve solo su parte y que nadie ve más que la gerencia.",
              "Revisar rol por rol sin comparar: un rol mal escrito (por ejemplo «Bogota» sin tilde) vería cero sin que nadie lo note.",
              "Las barras de los jefes suman exactamente la línea de la gerencia. Si un rol mostrara cero, el filtro está mal escrito.",
              "Modelado › Administrar roles; luego Modelado › Ver como para cada rol."),
        code('''
# @title Gráfico 1 · Lo que ve cada rol
rol_mal_escrito = False  # @param {type:"boolean"}
v25 = validas[validas.anio == 2025]
roles = {f"Jefe {c}": (c if not (rol_mal_escrito and c == "Bogotá") else "Bogota") for c in ORDEN_CIUDADES}
visto = pd.Series({r: v25[v25.ciudad == f]["subtotal"].sum() for r, f in roles.items()}) / 1e6
total = v25.subtotal.sum() / 1e6
fig = go.Figure(go.Bar(x=visto.index, y=visto.values, marker_color=[MAGENTA if v == 0 else AZUL for v in visto.values],
                       text=[f"{v:,.0f}".replace(",", ".") for v in visto.values], textposition="outside"))
fig.add_hline(y=total, line_dash="dash", line_color=GRIS, annotation_text=f"Gerencia (sin rol): {millones(total * 1e6)}")
fig.update_layout(title=(f"Los seis roles suman {millones(visto.sum() * 1e6)}, igual a lo que ve la gerencia" if abs(visto.sum() - total) < 1
                         else f"Un rol ve $ 0: el filtro «Bogota» no coincide con «Bogotá»; faltan {millones((total - visto.sum()) * 1e6)}"),
                  yaxis_title=MM, height=380, yaxis_range=[0, total * 1.1])
fig.show()
'''),
        md("""
## 2 · ¿Dónde se publica?

| Caso | Dónde | Por qué |
|---|---|---|
| Tablero con datos reales para la gerencia | **Servicio de Power BI** (área de trabajo) | Acceso por persona, actualización programada y RLS |
| Tu tablero con datos ficticios para la hoja de vida | **Tableau Public** | Es público: sirve como portafolio |
| Datos personales (salarios, clientes) | **No se publica** | Ley 1581 de 2012: datos personales protegidos |
| «Publicar en la web» con datos de la empresa | **No se publica** | Cualquiera con el enlace lo ve |
"""),
        ficha("¿Qué parte del informe ve cada jefe?", "Barras: porcentaje de las filas de Ventas que ve cada rol",
              "Muestra que el rol no es un filtro visual: recorta las filas que el usuario puede consultar.",
              "Pensar que basta con ocultar un visual: quien exporta los datos los vería todos.",
              "Cada jefe ve entre el 7 % y el 30 % de las filas. Con RLS, exportar no le da acceso al resto.",
              "Modelado › Ver como › rol; luego exporta los datos de un visual y revisa cuántas filas salen."),
        code('''
# @title Gráfico 2 · Filas visibles por rol
filas = v25.groupby("ciudad").size().reindex(ORDEN_CIUDADES) / len(v25)
fig = go.Figure(go.Bar(x=[f"Jefe {c}" for c in filas.index], y=filas.values, marker_color=TEAL, text=[porc(v) for v in filas.values], textposition="outside"))
fig.update_layout(title=f"Cada jefe ve solo su parte de las {miles(len(v25))} líneas de 2025", yaxis_tickformat=".0%", height=340, yaxis_range=[0, filas.max() * 1.25])
fig.show()
'''),
        md("## 3 · Retos de interpretación"),
        reto(1, "¿Qué venta neta 2025 ve el rol «Jefe Medellín»?", ["2.906.529.105", "4.438.208.370", "14.692.379.210", "2.348.175.015"],
             'miles(v25[v25.ciudad == "Medellín"].subtotal.sum())', "Es la barra de Medellín del gráfico 1; debe coincidir con «Ver como» en Power BI."),
        reto(2, "¿Dónde publicas tu tablero de portafolio con datos ficticios?", ["Servicio de Power BI", "Tableau Public", "Por correo", "Publicar en la web con datos reales"],
             '"Tableau Public"', "Es público por diseño, ideal para el portafolio con datos ficticios."),
        reto(3, "Un rol muestra $ 0. ¿Qué es lo más probable?", ["No hay ventas", "El valor del filtro no coincide exactamente (tildes, espacios)", "Falta una medida", "El visual está mal"],
             '"El valor del filtro no coincide exactamente (tildes, espacios)"', "Activa «rol mal escrito» en el gráfico 1 para verlo."),
        tip_ia("Para diseñar los roles de seguridad:",
               """En Power BI, Sedes (ciudad) filtra a Ventas. Quiero que cada jefe vea solo su sede y la gerencia todo.
Propón los roles, una versión dinámica con USERPRINCIPALNAME y cómo probarlos con Ver como."""),
        cierre(["En la empresa se publica en un área de trabajo, con actualización programada y roles.",
                "RLS recorta las filas; se prueba con Ver como y se verifica que los roles sumen el total.",
                "El portafolio va en Tableau Public, siempre con datos ficticios o públicos."],
               f"[Laboratorio · Taller P3]({PAGES}#taller-3)"),
    ]
