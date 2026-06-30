# E-Commerce Frontend

Cliente web (SPA) para consumir la API REST del backend de e-commerce desarrollado en Django REST Framework.

## Stack tecnológico

- React 18 + TypeScript
- Vite
- React Router DOM (enrutamiento)
- TanStack Query (manejo de estado de servidor, cache, mutaciones)
- Zustand (estado global de autenticación)
- Axios (cliente HTTP)
- Tailwind CSS v4 (estilos)

## Requisitos previos

- Node.js 18 o superior
- El backend de Django corriendo en paralelo (repositorio separado: `Proyecto_E-commerce`)

## Instalación

\`\`\`bash
npm install
\`\`\`

## Variables de entorno

Crear un archivo `.env.development` en la raíz con:

\`\`\`
VITE_API_URL=http://127.0.0.1:8000/api
\`\`\`

## Ejecución en desarrollo

1. Levantar el backend Django en otra terminal:
   \`\`\`bash
   python manage.py runserver
   \`\`\`
2. Levantar el frontend:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Abrir `http://localhost:5173`




## Estado del proyecto

En desarrollo.
