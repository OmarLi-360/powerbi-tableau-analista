"""Piezas compartidas por todos los cuadernos v2 (enfoque visual, sin código expuesto)."""
from pathlib import Path

import nbformat as nbf
import pandas as pd

RAIZ = Path(__file__).resolve().parents[2]
REPO = "OmarLi-360/powerbi-tableau-analista"
RAW = f"https://raw.githubusercontent.com/{REPO}/main"
PAGES = "https://omarli-360.github.io/powerbi-tableau-analista/"


def colab(archivo):
    return f"https://colab.research.google.com/github/{REPO}/blob/main/notebooks/{archivo}"


def md(texto):
    return nbf.v4.new_markdown_cell(texto.strip("\n"))


def code(texto, oculto=True):
    """Por omisión el código queda oculto: Colab muestra solo el título y los controles."""
    c = nbf.v4.new_code_cell(texto.strip("\n"))
    if oculto:
        c.metadata["cellView"] = "form"
    return c


def encabezado(etiqueta, titulo, sub, minutos, objetivos, archivo, ancla):
    obj = "\n".join(f"{i}. {o}" for i, o in enumerate(objetivos, 1))
    return md(f"""
<img src="{RAW}/assets/logo-drbits.jpg" alt="Dr. Bits" width="170">

# {etiqueta} · {titulo}
**Analista de datos · Power BI + Tableau** — {sub} · ⏱ {minutos} min

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colab(archivo)}) &nbsp; [Volver al tablero]({PAGES}#{ancla})

<sub>Si al abrir un enlace Google muestra «Redirect Notice», haz clic en el enlace azul de esa página: es un aviso de seguridad de Google, no un error.</sub>

**Al terminar podrás:**
{obj}

---
### Cómo usar este cuaderno (no necesitas programar)
1. **Guarda tu copia:** *Archivo › Guardar una copia en Drive*. Así tus cambios no se pierden. Si no lo haces, no pasa nada grave: el original está protegido y nadie puede dañarlo desde aquí, pero lo que cambies se borra al cerrar.
2. **Ejecuta todo:** *Entorno de ejecución › Ejecutar todas* (Ctrl+F9). Si Colab avisa que el cuaderno no es de Google, elige *Ejecutar de todos modos*.
3. **Juega con los controles:** las celdas con listas desplegables a la derecha se pueden cambiar. Elige una opción y pulsa el botón ▶ de esa celda para redibujar.

El código está oculto a propósito: aquí importa entender el dato y el gráfico. Si tienes curiosidad, haz doble clic en una celda para verlo.
""")


def ficha(pregunta, que, porque, descartado, lectura, excel):
    """Ficha de decisión que acompaña a cada gráfico."""
    return md(f"""
> **Ficha de decisión**
>
> | | |
> |---|---|
> | **Pregunta** | {pregunta} |
> | **Qué se grafica** | {que} |
> | **Por qué esta forma** | {porque} |
> | **Qué se descartó** | {descartado} |
> | **Cómo se lee** | {lectura} |
> | **En Excel 365** | {excel} |
""")


def reto(i, pregunta, opciones, esperado_py, explicacion):
    """Reto de interpretación: el estudiante elige en una lista desplegable."""
    lista = ", ".join(f'"{o}"' for o in ["Elige una opción", *opciones])
    return code(f'''
# @title Reto {i} · {pregunta}
respuesta = "Elige una opción"  # @param [{lista}]
revisar(respuesta, {esperado_py}, """{explicacion}""")
''')


def tip_ia(texto, prompt):
    return md(f"""
## Apóyate en IA
{texto}

```text
{prompt}
```

> **Verifica siempre.** Compara la respuesta de la IA con un dato que ya conozcas. No pegues datos personales reales (Ley 1581 de 2012): estos datos son ficticios, los de tu empresa no.
""")


def cierre(resumen, siguiente):
    items = "\n".join(f"* {r}" for r in resumen)
    return md(f"""
## Resumen
{items}

**Siguiente:** {siguiente}

<sub>Dr. Bits · ADNBITS S.A.S. · Contenido CC BY-SA 4.0 · Datos ficticios de Distribuidora Andina S.A.S.</sub>
""")


# ---------------------------------------------------------------------------
# Celda de preparación: datos, formatos, plantilla de gráficos y revisor de retos
# ---------------------------------------------------------------------------
PREPARACION = '''
# @title Preparar el entorno (se ejecuta sola con «Ejecutar todas»)
import os, sys, warnings
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
from IPython.display import display, Markdown, HTML
warnings.filterwarnings("ignore")

EN_COLAB = "google.colab" in sys.modules
REPO = "OmarLi-360/powerbi-tableau-analista"
BASE_URL = f"https://raw.githubusercontent.com/{REPO}/main/data/"
BASE_LOCAL = "../data/"

def ruta(nombre):
    local = os.path.join(BASE_LOCAL, nombre)
    return local if os.path.exists(local) else BASE_URL + nombre

# --- formatos colombianos -------------------------------------------------
def miles(x):    return f"{x:,.0f}".replace(",", ".")
def pesos(x):    return "$ " + miles(x)
def millones(x): return "$ " + f"{x/1e6:,.0f}".replace(",", ".") + " M"
def porc(v, signo=False):
    t = f"{v:+.1%}" if signo else f"{v:.1%}"
    return t.replace(".", ",").replace("%", " %")
MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
MM = "Millones de pesos"

# --- plantilla de gráficos Dr. Bits ----------------------------------------
AZUL, TEAL, MAGENTA, GRIS = "#4A5AD8", "#0E9BB8", "#D0336F", "#9AA3BF"
BIEN, MAL = "#15784A", "#B42318"
ejes = dict(gridcolor="#E4E8F2", zeroline=False, linecolor="#C9D0E2", exponentformat="none", separatethousands=True)
pio.templates["drbits"] = go.layout.Template(layout=dict(
    font=dict(family="Source Sans 3, Segoe UI, Arial, sans-serif", size=14, color="#11153A"),
    title=dict(font=dict(size=18, color="#00006A"), x=0, xanchor="left"),
    colorway=[AZUL, TEAL, MAGENTA], plot_bgcolor="white", paper_bgcolor="white",
    xaxis=ejes, yaxis=ejes, separators=",.", hoverlabel=dict(font_size=13),
    margin=dict(t=80, l=10, r=30, b=40)))
pio.templates.default = "plotly_white+drbits"

def eje_meses(fig, fechas, cada=None):
    """Etiquetas de meses en español en ejes de tiempo (Plotly las pone en inglés)."""
    f = pd.to_datetime(pd.Series(sorted(set(pd.to_datetime(list(fechas))))))
    paso = cada or (1 if len(f) <= 13 else 3)
    f = f.iloc[::paso]
    fig.update_xaxes(tickvals=list(f), ticktext=[f"{MESES[d.month - 1]} {d.year}" for d in f])

def dar_aire(fig, maximo, eje="x"):
    (fig.update_xaxes if eje == "x" else fig.update_yaxes)(range=[0, maximo * 1.22])

# --- revisor de retos -----------------------------------------------------
def revisar(respuesta, esperado, explicacion=""):
    if respuesta == "Elige una opción":
        display(Markdown("**Elige una opción en la lista de la derecha** y vuelve a ejecutar esta celda con ▶."))
    elif str(respuesta) == str(esperado):
        display(Markdown(f"✅ **Correcto.** {explicacion}"))
    else:
        display(Markdown(f"❌ **Todavía no.** Revisa el gráfico de arriba e inténtalo otra vez. *(Elegiste: {respuesta})*"))

# --- datos de Distribuidora Andina ----------------------------------------
ventas = pd.read_csv(ruta("ventas.csv"), parse_dates=["fecha"])
clientes = pd.read_csv(ruta("clientes.csv"))
productos = pd.read_csv(ruta("productos.csv"))
vendedores = pd.read_csv(ruta("vendedores.csv"))
sedes = pd.read_csv(ruta("sedes.csv"))
metas = pd.read_csv(ruta("metas.csv"))
df = (ventas
      .merge(sedes[["id_sede", "ciudad"]], on="id_sede", validate="many_to_one")
      .merge(productos[["sku", "producto", "categoria"]], on="sku", validate="many_to_one")
      .merge(clientes[["id_cliente", "razon_social", "segmento"]], on="id_cliente", validate="many_to_one")
      .merge(vendedores[["id_vendedor", "nombre_vendedor"]], on="id_vendedor", validate="many_to_one")
      .assign(anio=lambda d: d.fecha.dt.year, mes=lambda d: d.fecha.dt.month))
validas = df[df["estado"] != "Anulada"]          # las anuladas no son venta
ORDEN_CIUDADES = (validas[validas.anio == 2025].groupby("ciudad")["subtotal"].sum()
                  .sort_values(ascending=False).index.tolist())
display(Markdown(f"Datos listos: **{miles(len(ventas))} líneas de venta**, {len(clientes)} clientes, {len(productos)} productos. "
                 f"Fuente: {'archivos locales' if os.path.exists(BASE_LOCAL) else 'GitHub'}."))
'''


# ---------------------------------------------------------------------------
# Datos para calcular respuestas y opciones de los retos al construir
# ---------------------------------------------------------------------------
def datos():
    d = RAIZ / "data"
    v = pd.read_csv(d / "ventas.csv", parse_dates=["fecha"])
    s = pd.read_csv(d / "sedes.csv")
    p = pd.read_csv(d / "productos.csv")
    c = pd.read_csv(d / "clientes.csv")
    m = pd.read_csv(d / "metas.csv")
    df = (v.merge(s[["id_sede", "ciudad"]], on="id_sede").merge(p[["sku", "categoria"]], on="sku")
           .merge(c[["id_cliente", "segmento"]], on="id_cliente")
           .assign(anio=lambda x: x.fecha.dt.year, mes=lambda x: x.fecha.dt.month))
    return df, df[df.estado != "Anulada"], s, m


def pct(v):
    return f"{v:.0%}".replace("%", " %")


def escribir(nombre, celdas):
    nb = nbf.v4.new_notebook()
    nb.cells = celdas
    nb.metadata = {"kernelspec": {"name": "python3", "display_name": "Python 3"},
                   "language_info": {"name": "python"},
                   "colab": {"provenance": [], "toc_visible": True}}
    ruta = RAIZ / "notebooks" / nombre
    nbf.write(nb, ruta)
    print("escrito", ruta.name, f"({len(celdas)} celdas)")
