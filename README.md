<p align="center"><img src="assets/logo-drbits.jpg" alt="Dr. Bits" width="240"></p>

<h1 align="center">Analista de datos · Power BI + Tableau</h1>

<p align="center">Curso interactivo de Power BI Desktop y Tableau Public para el perfil de analista de datos junior.<br>
Ocho claves alineadas con la certificación PL-300 · cuadernos de Colab con cifras de control · laboratorio del CSV al portafolio.</p>

<p align="center">
<a href="https://omarli-360.github.io/powerbi-tableau-analista/"><b>Abrir el tablero</b></a> ·
<a href="data/cifras_de_control.md">Cifras de control</a> ·
<a href="data/README.md">Los datos</a>
</p>

---

## Para quién es

Aprendices SENA y estudiantes que van hacia el perfil de **analista de datos junior**. Es la tercera etapa de una línea de formación:

1. [Excel Corporativo · 12 Claves](https://github.com/OmarLi-360/excel-corporativo-12-claves): datos ordenados, fórmulas confiables, tablas dinámicas, Power Query y auditoría.
2. Colab: visualizar y verificar con Python sin programar desde cero (curso rápido dentro del curso de Excel).
3. **Power BI + Tableau (este curso)**: modelo, medidas DAX, informes y portafolio público.
4. SQL (próximo curso).

Funciona para autoestudio y para clases con instructor (botón **Modo instructor** en cada clave y taller).

Requisitos: Windows para Power BI Desktop (gratuito), Windows o Mac para Tableau Public (gratuito), cuenta de Google para Colab.

## Por qué dos herramientas

* **Power BI** es la herramienta de BI más pedida en las vacantes de analista en Colombia. El curso cubre las cuatro áreas del examen **PL-300** (preparar, modelar, visualizar, administrar).
* **Tableau Public** permite publicar un tablero con un enlace público para la hoja de vida y LinkedIn, algo que la cuenta gratuita de Power BI no permite.
* Las **fichas de herramientas** muestran la pantalla de Power BI Desktop y de Tableau Public con cada parte señalada.
* **Colab** verifica: cada cuaderno calcula las mismas medidas en Python para comparar con las tarjetas de Power BI.

## Las 8 claves

| Tramo (área PL-300) | # | Clave | Estado |
|---|---|---|---|
| Preparar | 1 | Conectar y perfilar | **Completa** |
| | 2 | Transformar para el modelo | **Completa** |
| Modelar | 3 | Modelo estrella y relaciones | **Completa** |
| | 4 | Medidas DAX y el contexto de filtro | **Completa** |
| | 5 | Inteligencia de tiempo | **Completa** |
| Comunicar | 6 | Informe que responde preguntas | **Completa** |
| | 7 | Interactividad y narrativa | **Completa** |
| Publicar y portafolio | 8 | Publicar, gobernar y portafolio | **Completa** |

Cada clave completa tiene ocho pasos: para qué sirve (con su equivalente en Tableau), entender, ver el error, simulador, pasos en Power BI y en Tableau, verificación en Colab, apoyo de IA y autoevaluación.

## Laboratorio

| Taller | Qué construyes | Control |
|---|---|---|
| P0 · Monta tu laboratorio | Power BI Desktop, Tableau Public y los CSV | Ventas con 17.106 filas |
| P1 · Del CSV al modelo | Modelo estrella, Calendario y seis medidas | Venta neta 2025 = 14.692.379.210 |
| P2 · Tablero del comité | La página del cierre y la actualización con enero de 2026 | Venta neta enero 2026 = 1.204.089.720 |
| P3 · Portafolio en Tableau Public | El tablero publicado y tu presentación de dos minutos | Enlace público |

## Cuadernos de Colab

| Cuaderno | Para qué | Colab |
|---|---|---|
| `01_conectar_y_perfilar` | Calidad y distribución de cada columna de la exportación del ERP | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/01_conectar_y_perfilar.ipynb) |
| `02_transformar_para_el_modelo` | Días sin ventas, tabla plana frente a estrella y granularidad | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/02_transformar_para_el_modelo.ipynb) |
| `03_modelo_estrella` | Tamaño de las tablas, verificación de llaves y el síntoma de una relación que falta | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/03_modelo_estrella.ipynb) |
| `04_medidas_dax` | Tabla de control de las seis medidas y el contexto de filtro | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/04_medidas_dax.ipynb) |
| `05_inteligencia_de_tiempo` | Acumulado del año, variación mensual y anual por sede | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/05_inteligencia_de_tiempo.ipynb) |
| `06_informe_que_responde` | Pregunta y visual, y la página del comité | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/06_informe_que_responde.ipynb) |
| `07_interactividad_y_narrativa` | Ruta de detalle, información sobre herramientas y pequeños múltiplos | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/07_interactividad_y_narrativa.ipynb) |
| `08_publicar_y_gobernar` | Lo que ve cada rol de seguridad y dónde publicar | [Abrir](https://colab.research.google.com/github/OmarLi-360/powerbi-tableau-analista/blob/main/notebooks/08_publicar_y_gobernar.ipynb) |

## Los datos

Distribuidora Andina S.A.S., la misma empresa ficticia del curso de Excel (semilla 2026): ventas, clientes, productos, vendedores, sedes, metas y un mes nuevo (enero de 2026). Ver [data/README.md](data/README.md) y [las cifras de control](data/cifras_de_control.md).

## Estructura

```
├── index.html               Tablero (GitHub Pages). Lo genera scripts/construir_tablero.py
├── src/                     Estructura, motor y contenido del tablero
├── assets/                  Logo y datos compactos para los simuladores
├── data/                    CSV, nuevo_mes/ y cifras de control
├── notebooks/               Cuadernos de Colab (los genera scripts/construir_cuadernos.py)
└── scripts/                 Constructores y cálculo de cifras de control
```

```bash
pip install pandas numpy nbformat
python scripts/cifras_control.py        # data/cifras_de_control.md y assets/datos-extra.js
python scripts/construir_tablero.py     # index.html
python scripts/construir_cuadernos.py   # notebooks/
```

## Licencia y créditos

* Contenido educativo: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es). Código: [MIT](LICENSE).
* La marca y el logo de Dr. Bits no están cubiertos por estas licencias.
* Power BI es marca de Microsoft y Tableau es marca de Salesforce; este curso no está afiliado a ninguna de las dos.
* Los datos son ficticios.

Creado por **Omar Libardo Acelas Angulo** · [Dr. Bits](https://github.com/OmarLi-360) · ADNBITS S.A.S. · Bogotá, Colombia · 2026
