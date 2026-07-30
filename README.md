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

<img width="1363" height="720" alt="Captura de pantalla 2026-07-29 214208" src="https://github.com/user-attachments/assets/10218cc6-c878-474a-99d0-a3a3a2cbdd30" />

<img width="1366" height="768" alt="2" src="https://github.com/user-attachments/assets/fc06b6c5-78fd-4433-8e3f-3cf4b567ab10" />
