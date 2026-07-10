import apiClient from './client'

export async function descargarFactura(ordenId: string): Promise<void> {
  const response = await apiClient.get(
    `/ordenes/${ordenId}/factura/`,
    {
      responseType: 'blob',
    }
  )

  // Los headers de Axios pueden venir tipados como string | number | boolean
  // | string[] | AxiosHeaders (por headers repetidos o especiales). Content-Type
  // siempre es un string simple en la práctica, así que forzamos la conversión
  // para que coincida con el tipo que espera el constructor de Blob.
  const contentType = String(
    response.headers['content-type'] ?? 'application/pdf'
  )

  const archivo = new Blob([response.data], {
    type: contentType,
  })

  const urlTemporal = window.URL.createObjectURL(archivo)

  const enlace = document.createElement('a')
  enlace.href = urlTemporal
  enlace.download = `factura-${ordenId}.pdf`

  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  window.URL.revokeObjectURL(urlTemporal)
}