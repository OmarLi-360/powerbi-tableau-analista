"""
Genera los cuadernos de Google Colab de control (código oculto, enfoque visual).

Uso:  python scripts/construir_cuadernos.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cuadernos.comun import escribir  # noqa: E402
from cuadernos.piloto import cuaderno_03, cuaderno_04, cuaderno_06  # noqa: E402

if __name__ == "__main__":
    escribir("03_modelo_estrella.ipynb", cuaderno_03())
    escribir("04_medidas_dax.ipynb", cuaderno_04())
    escribir("06_informe_que_responde.ipynb", cuaderno_06())
