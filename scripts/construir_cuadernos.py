"""
Genera los cuadernos de Google Colab de control (código oculto, enfoque visual).

Uso:  python scripts/construir_cuadernos.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cuadernos.comun import escribir  # noqa: E402
from cuadernos.dax import tutorial_dax  # noqa: E402
from cuadernos.piloto import cuaderno_03, cuaderno_04, cuaderno_06  # noqa: E402
from cuadernos.resto import cuaderno_01, cuaderno_02, cuaderno_05, cuaderno_07, cuaderno_08  # noqa: E402

if __name__ == "__main__":
    escribir("01_conectar_y_perfilar.ipynb", cuaderno_01())
    escribir("02_transformar_para_el_modelo.ipynb", cuaderno_02())
    escribir("03_modelo_estrella.ipynb", cuaderno_03())
    escribir("04_medidas_dax.ipynb", cuaderno_04())
    escribir("05_inteligencia_de_tiempo.ipynb", cuaderno_05())
    escribir("06_informe_que_responde.ipynb", cuaderno_06())
    escribir("07_interactividad_y_narrativa.ipynb", cuaderno_07())
    escribir("08_publicar_y_gobernar.ipynb", cuaderno_08())
    escribir("tutorial_dax.ipynb", tutorial_dax())
