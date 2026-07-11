export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  esta_activo: boolean;
}

export interface ProductoImagen {
  id: string;
  producto: string;
  url: string;
  es_principal: boolean;
  orden: number;
}

export interface ProductoVariante {
  id: string
  producto: string
  nombre: string
  sku: string
  modificador_precio: string
  precio_total?: string
  inventario: number
  stock_minimo: number
  atributos: Record<string, string>
  tiene_stock?: boolean
  esta_activo: boolean
}

export interface CategoriaDetalleProducto {
  id: string
  nombre: string
  slug: string
  esta_activo: boolean
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  categoria_nombre: string
  categoria_detalle?: CategoriaDetalleProducto
  descripcion?: string
  precio_base: string
  porcentaje_descuento: string
  precio_con_descuento: string
  tasa_iva: string
  monto_iva_incluido: string
  imagen_principal: string | null
  es_destacado: boolean
  esta_activo: boolean
  imagenes?: ProductoImagen[]
  variantes?: ProductoVariante[]
}

export interface ProductoDetalle {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  categoria_detalle: Categoria;
  descripcion: string;
  precio_base: string;
  porcentaje_descuento: string;
  precio_con_descuento: string;
  tasa_iva: string;
  monto_iva_incluido: string;
  es_destacado: boolean;
  variantes: ProductoVariante[];
  imagenes: ProductoImagen[];
  esta_activo: boolean;
  fecha_creacion: string;
}

export interface VarianteDetalleCarrito {
  id: string
  nombre: string
  sku: string
  precio_total: string
  inventario: number
  tiene_stock: boolean
  esta_activo: boolean
}

export interface CarritoItem {
  id: string
  variante: string
  variante_detalle: VarianteDetalleCarrito
  cantidad: number
  subtotal: number
  esta_activo: boolean
}

export interface Carrito {
  id: string
  usuario: number
  items: CarritoItem[]
  cantidad_items: number
  total: number
  esta_activo: boolean
}