# Frontend — Estructura real

El frontend usa una organización feature-first. Las llamadas HTTP, los modelos y la presentación permanecen separados sin capas vacías.

## Árbol actual

```text
frontend/
├── Dockerfile
├── nginx.conf
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── components.json
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── model/
│   │   │   └── pages/
│   │   ├── sensors/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── model/
│   │   │   └── pages/
│   │   └── ingestions/
│   │       ├── api/
│   │       ├── components/
│   │       ├── model/
│   │       └── pages/
│   └── shared/
│       └── api/
│           └── api-client.ts
└── README.md
```

## Responsabilidades

- `features/auth`: sesión, login, logout y protección de rutas.
- `features/sensors`: CRUD, estado, detalle, lecturas e ingestas del sensor.
- `features/ingestions`: histórico global de ejecuciones.
- `components/layout`: navegación autenticada, tema y logout.
- `components/ui`: componentes compartidos de shadcn/ui.
- `shared/api/api-client.ts`: prefijo `/api`, credenciales, JSON y errores HTTP.

## Comunicación

El cliente usa `fetch('/api/...')` con `credentials: 'include'`.

- En desarrollo, Vite reenvía `/api` a `localhost:3000`.
- En Compose, Nginx reenvía `/api` a `backend:3000`.

El navegador siempre usa el mismo origen del frontend.
