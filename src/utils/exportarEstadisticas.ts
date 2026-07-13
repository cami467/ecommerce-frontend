import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import {
  utils,
  writeFileXLSX,
  type WorkBook,
  type WorkSheet,
} from 'xlsx'
import type { EstadisticasAdmin } from '../types/estadisticas'

function fechaActualArchivo(): string {
  return new Date().toISOString().slice(0, 10)
}

function escaparCsv(valor: unknown): string {
  const texto = String(valor ?? '')

  if (
    texto.includes(',') ||
    texto.includes('"') ||
    texto.includes('\n')
  ) {
    return `"${texto.replace(/"/g, '""')}"`
  }

  return texto
}

function descargarBlob(
  contenido: BlobPart,
  nombreArchivo: string,
  tipo: string
): void {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo

  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  URL.revokeObjectURL(url)
}

function formatearGuaranies(valor: number): string {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function etiquetaEstado(estado: string): string {
  const etiquetas: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    processing: 'En proceso',
    shipped: 'Enviada',
    delivered: 'Entregada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }

  return etiquetas[estado] ?? estado
}

export function exportarEstadisticasCsv(
  estadisticas: EstadisticasAdmin
): void {
  const filas: string[][] = [
    ['REPORTE GENERAL DEL E-COMMERCE'],
    ['Fecha de exportación', new Date().toLocaleString('es-PY')],
    [],
    ['RESUMEN'],
    ['Indicador', 'Valor'],
    [
      'Ventas aprobadas',
      String(estadisticas.resumen.ventas_aprobadas),
    ],
    [
      'Órdenes totales',
      String(estadisticas.resumen.ordenes_totales),
    ],
    [
      'Pagos totales',
      String(estadisticas.resumen.pagos_totales),
    ],
    [
      'Pagos aprobados',
      String(estadisticas.resumen.pagos_aprobados),
    ],
    [
      'Pagos pendientes',
      String(estadisticas.resumen.pagos_pendientes),
    ],
    [
      'Usuarios registrados',
      String(estadisticas.resumen.usuarios_totales),
    ],
    [
      'Productos totales',
      String(estadisticas.resumen.productos_totales),
    ],
    [
      'Productos activos',
      String(estadisticas.resumen.productos_activos),
    ],
    [],
    ['VENTAS POR MES'],
    ['Mes', 'Total'],
    ...estadisticas.ventas_por_mes.map((venta) => [
      venta.mes,
      String(venta.total),
    ]),
    [],
    ['ÓRDENES POR ESTADO'],
    ['Estado', 'Cantidad'],
    ...estadisticas.ordenes_por_estado.map((item) => [
      etiquetaEstado(item.estado),
      String(item.cantidad),
    ]),
    [],
    ['PRODUCTOS MÁS VENDIDOS'],
    ['Producto', 'Cantidad', 'Ingresos'],
    ...estadisticas.productos_mas_vendidos.map((producto) => [
      producto.nombre_producto,
      String(producto.cantidad),
      String(producto.ingresos),
    ]),
    [],
    ['STOCK BAJO'],
    [
      'Producto',
      'Variante',
      'Inventario',
      'Stock mínimo',
    ],
    ...estadisticas.stock_bajo.map((item) => [
      item.producto,
      item.variante,
      String(item.inventario),
      String(item.stock_minimo),
    ]),
  ]

  const contenido = filas
    .map((fila) => fila.map(escaparCsv).join(','))
    .join('\r\n')

  // BOM para que Excel reconozca correctamente tildes y ñ.
  const contenidoConBom = `\uFEFF${contenido}`

  descargarBlob(
    contenidoConBom,
    `estadisticas-ecommerce-${fechaActualArchivo()}.csv`,
    'text/csv;charset=utf-8;'
  )
}

function agregarHoja(
  libro: WorkBook,
  datos: Record<string, unknown>[],
  nombre: string
): void {
  const hoja: WorkSheet = utils.json_to_sheet(datos)
  utils.book_append_sheet(libro, hoja, nombre)
}

export function exportarEstadisticasExcel(
  estadisticas: EstadisticasAdmin
): void {
  const libro = utils.book_new()

  agregarHoja(
    libro,
    [
      {
        Indicador: 'Ventas aprobadas',
        Valor: estadisticas.resumen.ventas_aprobadas,
      },
      {
        Indicador: 'Órdenes totales',
        Valor: estadisticas.resumen.ordenes_totales,
      },
      {
        Indicador: 'Pagos totales',
        Valor: estadisticas.resumen.pagos_totales,
      },
      {
        Indicador: 'Pagos aprobados',
        Valor: estadisticas.resumen.pagos_aprobados,
      },
      {
        Indicador: 'Pagos pendientes',
        Valor: estadisticas.resumen.pagos_pendientes,
      },
      {
        Indicador: 'Usuarios registrados',
        Valor: estadisticas.resumen.usuarios_totales,
      },
      {
        Indicador: 'Productos totales',
        Valor: estadisticas.resumen.productos_totales,
      },
      {
        Indicador: 'Productos activos',
        Valor: estadisticas.resumen.productos_activos,
      },
    ],
    'Resumen'
  )

  agregarHoja(
    libro,
    estadisticas.ventas_por_mes.map((venta) => ({
      Mes: venta.mes,
      'Ventas aprobadas': Number(venta.total),
    })),
    'Ventas por mes'
  )

  agregarHoja(
    libro,
    estadisticas.ordenes_por_estado.map((item) => ({
      Estado: etiquetaEstado(item.estado),
      Cantidad: item.cantidad,
    })),
    'Órdenes por estado'
  )

  agregarHoja(
    libro,
    estadisticas.productos_mas_vendidos.map((producto) => ({
      Producto: producto.nombre_producto,
      'Unidades vendidas': producto.cantidad,
      Ingresos: producto.ingresos,
    })),
    'Más vendidos'
  )

  agregarHoja(
    libro,
    estadisticas.stock_bajo.map((item) => ({
      Producto: item.producto,
      Variante: item.variante,
      Inventario: item.inventario,
      'Stock mínimo': item.stock_minimo,
    })),
    'Stock bajo'
  )

  writeFileXLSX(
    libro,
    `estadisticas-ecommerce-${fechaActualArchivo()}.xlsx`
  )
}

export function exportarEstadisticasPdf(
  estadisticas: EstadisticasAdmin
): void {
  const documento = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const margenIzquierdo = 14
  let posicionY = 18

  documento.setFontSize(18)
  documento.text(
    'Reporte administrativo del e-commerce',
    margenIzquierdo,
    posicionY
  )

  posicionY += 8

  documento.setFontSize(10)
  documento.text(
    `Generado: ${new Date().toLocaleString('es-PY')}`,
    margenIzquierdo,
    posicionY
  )

  posicionY += 8

  autoTable(documento, {
    startY: posicionY,
    head: [['Indicador', 'Valor']],
    body: [
      [
        'Ventas aprobadas',
        formatearGuaranies(
          estadisticas.resumen.ventas_aprobadas
        ),
      ],
      [
        'Órdenes totales',
        estadisticas.resumen.ordenes_totales,
      ],
      [
        'Pagos totales',
        estadisticas.resumen.pagos_totales,
      ],
      [
        'Pagos aprobados',
        estadisticas.resumen.pagos_aprobados,
      ],
      [
        'Pagos pendientes',
        estadisticas.resumen.pagos_pendientes,
      ],
      [
        'Usuarios registrados',
        estadisticas.resumen.usuarios_totales,
      ],
      [
        'Productos activos',
        `${estadisticas.resumen.productos_activos} de ${estadisticas.resumen.productos_totales}`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
    },
  })

  let siguienteY =
    (documento as jsPDF & {
      lastAutoTable?: { finalY: number }
    }).lastAutoTable?.finalY ?? posicionY

  siguienteY += 10

  documento.setFontSize(14)
  documento.text(
    'Ventas por mes',
    margenIzquierdo,
    siguienteY
  )

  autoTable(documento, {
    startY: siguienteY + 4,
    head: [['Mes', 'Total']],
    body: estadisticas.ventas_por_mes.map((venta) => [
      venta.mes,
      formatearGuaranies(Number(venta.total)),
    ]),
    theme: 'striped',
  })

  siguienteY =
    (documento as jsPDF & {
      lastAutoTable?: { finalY: number }
    }).lastAutoTable?.finalY ?? siguienteY

  siguienteY += 10

  documento.setFontSize(14)
  documento.text(
    'Órdenes por estado',
    margenIzquierdo,
    siguienteY
  )

  autoTable(documento, {
    startY: siguienteY + 4,
    head: [['Estado', 'Cantidad']],
    body: estadisticas.ordenes_por_estado.map((item) => [
      etiquetaEstado(item.estado),
      item.cantidad,
    ]),
    theme: 'striped',
  })

  siguienteY =
    (documento as jsPDF & {
      lastAutoTable?: { finalY: number }
    }).lastAutoTable?.finalY ?? siguienteY

  siguienteY += 10

  documento.setFontSize(14)
  documento.text(
    'Productos más vendidos',
    margenIzquierdo,
    siguienteY
  )

  autoTable(documento, {
    startY: siguienteY + 4,
    head: [['Producto', 'Cantidad', 'Ingresos']],
    body: estadisticas.productos_mas_vendidos.map(
      (producto) => [
        producto.nombre_producto,
        producto.cantidad,
        formatearGuaranies(Number(producto.ingresos)),
      ]
    ),
    theme: 'striped',
  })

  siguienteY =
    (documento as jsPDF & {
      lastAutoTable?: { finalY: number }
    }).lastAutoTable?.finalY ?? siguienteY

  siguienteY += 10

  documento.setFontSize(14)
  documento.text(
    'Alertas de stock',
    margenIzquierdo,
    siguienteY
  )

  autoTable(documento, {
    startY: siguienteY + 4,
    head: [
      ['Producto', 'Variante', 'Inventario', 'Mínimo'],
    ],
    body: estadisticas.stock_bajo.map((item) => [
      item.producto,
      item.variante,
      item.inventario,
      item.stock_minimo,
    ]),
    theme: 'striped',
  })

  documento.save(
    `estadisticas-ecommerce-${fechaActualArchivo()}.pdf`
  )
}