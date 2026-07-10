import { useEffect, useRef, useState } from 'react'
import { useNotificaciones } from '../../context/NotificacionesContext'
import type { Notificacion } from '../../types/notificacion'

// Importamos íconos de Heroicons
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/solid'

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function iconoPorTipo(tipo: string) {
  if (tipo === 'pago_aprobado')
    return <CheckCircleIcon className="h-5 w-5 text-green-600" />
  if (tipo === 'pago_rechazado')
    return <XCircleIcon className="h-5 w-5 text-red-600" />
  if (tipo === 'orden_confirmada')
    return <CubeIcon className="h-5 w-5 text-blue-600" />
  if (tipo === 'orden_cancelada')
    return <MinusCircleIcon className="h-5 w-5 text-gray-600" />
  return <BellIcon className="h-5 w-5 text-gray-500" />
}

export function NotificacionesDropdown() {
  const {
    notificaciones,
    cantidadNoLeidas,
    cargando,
    marcarLeida,
    marcarTodas,
  } = useNotificaciones()

  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function cerrarAlHacerClickFuera(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false)
      }
    }

    document.addEventListener('mousedown', cerrarAlHacerClickFuera)

    return () => {
      document.removeEventListener('mousedown', cerrarAlHacerClickFuera)
    }
  }, [])

  async function handleAbrirNotificacion(notificacion: Notificacion) {
    if (!notificacion.leida) {
      await marcarLeida(notificacion.id)
    }
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="relative rounded p-2 hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <BellIcon className="h-6 w-6 text-gray-700" />

        {cantidadNoLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {cantidadNoLeidas > 99 ? '99+' : cantidadNoLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-gray-900">Notificaciones</h2>
              <p className="text-xs text-gray-500">
                {cantidadNoLeidas} sin leer
              </p>
            </div>

            {cantidadNoLeidas > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando ? (
              <p className="p-4 text-sm text-gray-500">
                Cargando notificaciones...
              </p>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  No tenés notificaciones.
                </p>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <button
                  key={notificacion.id}
                  type="button"
                  onClick={() => handleAbrirNotificacion(notificacion)}
                  className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    !notificacion.leida ? 'bg-blue-50/60' : 'bg-white'
                  }`}
                >
                  <span className="mt-1">{iconoPorTipo(notificacion.tipo)}</span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={`text-sm ${
                          !notificacion.leida
                            ? 'font-bold text-gray-900'
                            : 'font-medium text-gray-700'
                        }`}
                      >
                        {notificacion.titulo}
                      </span>

                      {!notificacion.leida && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-gray-600">
                      {notificacion.mensaje}
                    </span>

                    <span className="mt-1 block text-[11px] text-gray-400">
                      {formatearFecha(notificacion.fecha_creacion)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
