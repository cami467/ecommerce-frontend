import { useEffect } from 'react'
import { inicializarSesion } from '../api/auth'

export function AuthBootstrap() {
  useEffect(() => {
    void inicializarSesion()
  }, [])

  return null
}
