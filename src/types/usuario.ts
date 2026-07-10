export interface Usuario {
  id: number
  email: string
  first_name: string
  last_name: string
  nombre_completo: string | null
  telefono: string | null
  avatar: string | null
  is_staff: boolean
  is_superuser?: boolean
}
