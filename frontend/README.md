# Smart City Temperature Sensor Platform — Frontend

Aplicación web para iniciar sesión, gestionar sensores de temperatura, lanzar
ingestas y consultar las lecturas y el histórico de ejecuciones.

## 🛠️ Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui y Base UI
- Lucide React
- pnpm
- Oxlint

## 🏗️ Arquitectura

El frontend utiliza una organización **feature-first**. Cada funcionalidad
agrupa sus páginas, componentes, modelos y llamadas HTTP, evitando crear capas
genéricas que solo deleguen llamadas.

```text
App / Router
      │
      ▼
Features ──▶ API de cada feature
      │              │
      ▼              ▼
Componentes     API REST del backend
      │
      ▼
Shared UI y utilidades
```

## 📁 Estructura

```text
src/
├── App.tsx                    # Rutas y estado inicial de sesión
├── main.tsx                   # Punto de entrada de React
├── index.css                  # Estilos globales y Tailwind
├── components/ui/             # Componentes UI compartidos
├── features/
│   ├── auth/
│   │   ├── api/               # Login, logout y sesión
│   │   ├── components/        # Layout autenticado
│   │   ├── model/             # Usuario actual
│   │   └── pages/             # Login
│   ├── sensors/
│   │   ├── api/               # CRUD, lecturas e ingestas
│   │   ├── components/        # Formularios, diálogos y acciones
│   │   ├── model/             # Sensores, lecturas e ingestas
│   │   └── pages/             # Listado y detalle
│   └── ingestions/
│       ├── api/               # Histórico de ejecuciones
│       └── pages/             # Histórico global
├── shared/
│   ├── api/                   # Cliente HTTP común
│   └── components/            # Tema y componentes transversales
└── lib/                       # Utilidades
```

## 💡 Decisiones técnicas

### React

**Motivo**

React era la tecnología recomendada para la parte frontend de la prueba, por lo
que decidí utilizarla para construir la interfaz mediante componentes
reutilizables.

### TypeScript

**Motivo**

Decidí utilizar TypeScript porque encaja bien con el dominio de la aplicación y
permite definir los contratos de sensores, lecturas, ingestas y sesiones.
Además, ayuda a detectar errores durante el desarrollo y mejora el
mantenimiento del código.

### Vite

**Motivo**

Ya estaba acostumbrado a trabajar con Vite en proyectos personales. Además,
ofrece un servidor de desarrollo rápido y una configuración sencilla para React
y TypeScript.

### Feature-first

**Motivo**

Inicialmente valoré utilizar Clean Architecture también en el frontend, pero
consideré que podía añadir complejidad innecesaria para el alcance de esta
prueba. Finalmente opté por una organización feature-first, ya que la
aplicación tiene varias funcionalidades independientes.

Agrupar cada funcionalidad en su propia feature facilita localizar el código y
evita mezclar la gestión de sesión con sensores o ingestas.

### React Router

**Motivo**

Es una herramienta que suelo utilizar cuando trabajo con React y permite
organizar de forma sencilla las páginas, las rutas protegidas y la navegación
entre ellas.

### Tailwind CSS y shadcn/ui

**Motivo**

Elegí Tailwind CSS y shadcn/ui porque permiten construir una interfaz
consistente sin tener que crear un sistema de estilos desde cero.

Además, shadcn/ui proporciona componentes cuyo código fuente queda dentro del
proyecto, lo que facilita su personalización y mantenimiento. Esta combinación
también simplifica la gestión de temas, colores y estilos compartidos.

### Cliente HTTP

Las peticiones pasan por `shared/api/api-client.ts`, que centraliza:

- El prefijo `/api`.
- El envío de cookies mediante `credentials: 'include'`.
- Las cabeceras JSON.
- La conversión de errores HTTP a `ApiError`.
- La reacción ante respuestas `401` (redirige al login).

En desarrollo, Vite reenvía `/api` a `http://localhost:3000`. En producción,
Nginx reenvía esas peticiones al backend para mantener el mismo origen en el
navegador.

## 🧭 Pantallas y rutas

| Ruta | Descripción | Auth |
|---|---|---|
| `/login` | Inicio de sesión | ❌ |
| `/sensors` | Listado, creación, edición, estado y borrado de sensores | ✅ |
| `/sensors/:id` | Detalle, lecturas e ingesta de un sensor | ✅ |
| `/ingestions` | Histórico de ejecuciones de ingesta | ✅ |

Al iniciar la aplicación se comprueba la sesión actual. Los usuarios no
autenticados son enviados a `/login` y los usuarios autenticados a `/sensors`.

## 🚀 Desarrollo

```bash
pnpm install
pnpm dev
```

La aplicación queda disponible por defecto en `http://localhost:5173`.

### Otros comandos

```bash
pnpm build
pnpm preview
pnpm lint
```


## 🔭 Mejoras futuras

- Añadir tests de componentes y de los flujos principales.

  **Rumbo:** Utilizar Playwright para navegar por la aplicación y cubrir los
  flujos críticos, como el login, la gestión de sensores y la ingesta de
  lecturas.

- Añadir gráficas en las lecturas de sensores.

  **Rumbo:** A mi me gusta usar Chart.js pero Recharts tambien es buena opcion. Cualquiera valdria, lo implementaria haciendo un wrapper alrededor de la libreria.
