import { useEffect } from 'react'
import { inicializarSesion } from '../api/auth'

export function AuthBootstrap() {
  useEffect(() => {
    void inicializarSesion()

    // Cuando Chrome restaura la pagina desde Back/Forward Cache (bfcache),
    // el JS queda "congelado" tal como estaba y NO se vuelven a correr
    // los efectos de montaje (este mismo useEffect no se re-ejecuta).
    // Si el accessToken en memoria quedo viejo/vencido, cualquier fetch
    // posterior (ej. /carrito/) falla con 401 sin que nadie lo revalide.
    //
    // event.persisted === true indica justamente ese caso: la pagina
    // viene de bfcache, no de una carga nueva. Ahi forzamos de nuevo
    // inicializarSesion() y avisamos a componentes como el Header o
    // el carrito para que vuelvan a pedir sus datos.
    function manejarPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void inicializarSesion()
        window.dispatchEvent(new Event('carrito:actualizado'))
      }
    }

    window.addEventListener('pageshow', manejarPageShow)
    return () => {
      window.removeEventListener('pageshow', manejarPageShow)
    }
  }, [])

  return null
}