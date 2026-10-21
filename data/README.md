# Los datos: Distribuidora Andina S.A.S.

Empresa ficticia de suministros de oficina y tecnología con seis sedes. Son los mismos datos de [Excel Corporativo · 12 Claves](https://github.com/OmarLi-360/excel-corporativo-12-claves) (generados con semilla fija), organizados para un modelo estrella.

| Archivo | Filas | Tipo | Llave | Contenido |
|---|---|---|---|---|
| `ventas.csv` | 17.106 | Hechos | id_linea | Una fila por línea de factura, 2024 y 2025. `subtotal` es la venta neta sin IVA; `estado` puede ser Pagada, Pendiente o Anulada |
| `metas.csv` | 144 | Hechos | id_sede + anio + mes | Meta mensual de venta neta por sede |
| `clientes.csv` | 420 | Dimensión | id_cliente | Razón social, segmento, sede, días de crédito |
| `productos.csv` | 73 | Dimensión | sku | Producto, categoría, precios y costos |
| `vendedores.csv` | 18 | Dimensión | id_vendedor | Nombre, sede, ingreso y retiro |
| `sedes.csv` | 6 | Dimensión | id_sede | Ciudad, departamento, región |
| `ventas_erp_sucio.csv` | 1.854 | Práctica | — | Exportación del ERP con defectos (tipos mezclados, variantes de ciudad, duplicados) para la clave 1 |
| `nuevo_mes/ventas_2026_01.csv` | 914 | Hechos | id_linea | Enero de 2026 con el mismo esquema (Taller P2) |
| `nuevo_mes/metas_2026_01.csv` | 6 | Hechos | — | Metas de enero de 2026 |

La tabla **Calendario** se crea en Power BI con DAX (ver Taller P1).

Las medidas del curso excluyen siempre las facturas anuladas. Los valores que deben dar están en [cifras_de_control.md](cifras_de_control.md).
