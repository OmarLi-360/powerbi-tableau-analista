"""
Calcula las cifras de control del curso y los datos extra del tablero.

* data/cifras_de_control.md  → los valores que deben dar las medidas en Power BI y en Tableau.
                               El estudiante compara su tarjeta con esta tabla.
* assets/datos-extra.js      → metas mensuales por sede y cifras de control para los simuladores.

Los CSV de data/ son los mismos de Excel Corporativo · 12 Claves (semilla 2026).
Uso:  python scripts/cifras_control.py
"""
import json
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
DATA = RAIZ / "data"


def cargar(con_enero=False):
    v = pd.read_csv(DATA / "ventas.csv", parse_dates=["fecha"])
    m = pd.read_csv(DATA / "metas.csv")
    if con_enero:
        v = pd.concat([v, pd.read_csv(DATA / "nuevo_mes" / "ventas_2026_01.csv", parse_dates=["fecha"])])
        m = pd.concat([m, pd.read_csv(DATA / "nuevo_mes" / "metas_2026_01.csv")])
    s = pd.read_csv(DATA / "sedes.csv")
    v = v.merge(s[["id_sede", "ciudad"]], on="id_sede").assign(anio=lambda d: d.fecha.dt.year, mes=lambda d: d.fecha.dt.month)
    m = m.merge(s[["id_sede", "ciudad"]], on="id_sede")
    return v, m, s


def medidas(v, m):
    """Las seis medidas del curso, exactamente como se definen en DAX."""
    ok = v[v.estado != "Anulada"]
    venta = ok.subtotal.sum()
    facturas = ok.id_factura.nunique()
    meta = m.meta_subtotal.sum()
    return {
        "Venta neta": venta,
        "Meta": meta,
        "Cumplimiento": venta / meta if meta else None,
        "Facturas": facturas,
        "Ticket promedio": venta / facturas if facturas else None,
        "Margen %": ok.margen_bruto.sum() / venta if venta else None,
    }


def fmt(nombre, x):
    if x is None:
        return "—"
    if nombre in ("Cumplimiento", "Margen %"):
        return f"{x:.1%}".replace(".", ",").replace("%", " %")
    return f"{x:,.0f}".replace(",", ".")


def main():
    v, m, s = cargar()
    ve, me, _ = cargar(con_enero=True)
    filas = []
    for etiqueta, vv, mm in [
        ("Año 2024", v[v.anio == 2024], m[m.anio == 2024]),
        ("Año 2025", v[v.anio == 2025], m[m.anio == 2025]),
        ("Enero 2026 (Taller 2)", ve[(ve.anio == 2026) & (ve.mes == 1)], me[(me.anio == 2026) & (me.mes == 1)]),
    ]:
        filas.append((etiqueta, medidas(vv, mm)))
    por_sede = [(c, medidas(v[(v.anio == 2025) & (v.ciudad == c)], m[(m.anio == 2025) & (m.ciudad == c)])) for c in s.ciudad]

    nombres = list(filas[0][1].keys())
    md = ["# Cifras de control", "",
          "Si tu tarjeta en Power BI o en Tableau muestra otro valor, revisa la medida antes de seguir.",
          "Todas excluyen las facturas **Anuladas**. *Ticket promedio* = venta neta / facturas distintas.", "",
          "## Totales", "", "| Filtro | " + " | ".join(nombres) + " |", "|---" * (len(nombres) + 1) + "|"]
    md += [f"| {e} | " + " | ".join(fmt(n, x[n]) for n in nombres) + " |" for e, x in filas]
    md += ["", "## Por sede, año 2025", "", "| Sede | " + " | ".join(nombres) + " |", "|---" * (len(nombres) + 1) + "|"]
    md += [f"| {c} | " + " | ".join(fmt(n, x[n]) for n in nombres) + " |" for c, x in por_sede]
    md += ["", "Generado por `scripts/cifras_control.py`."]
    (DATA / "cifras_de_control.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    extra = {
        "metas": [[int(r.anio), int(r.mes), r.ciudad, int(r.meta_subtotal)] for r in m.itertuples()],
        "control": {e: {k: (float(x) if x is not None else None) for k, x in d.items()} for e, d in filas},
        "control_sede": {c: {k: float(x) for k, x in d.items()} for c, d in por_sede},
        "filas": {"ventas": len(v), "clientes": int(pd.read_csv(DATA / "clientes.csv").shape[0]),
                  "productos": int(pd.read_csv(DATA / "productos.csv").shape[0]),
                  "vendedores": int(pd.read_csv(DATA / "vendedores.csv").shape[0]), "sedes": len(s), "metas": len(m)},
    }
    (RAIZ / "assets" / "datos-extra.js").write_text(
        "window.DATA_EXTRA = " + json.dumps(extra, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print("\n".join(md[:12]))


if __name__ == "__main__":
    main()
