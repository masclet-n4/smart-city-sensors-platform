# 🌡️ Smart City — Temperature Sensor

Aplicación full-stack para gestionar sensores de temperatura, ingerir lecturas
desde fuentes heterogéneas y consultar el histórico de ejecuciones.

## 📋 Contenido

- [Arquitectura](#-arquitectura)
- [Proyecto](#-proyecto)
- [Ejecución](#-ejecución)
- [Uso](#-uso)
- [Decisiones técnicas](#-decisiones-técnicas)
- [Mejoras futuras](#-mejoras-futuras)

## 🏗️ Arquitectura

```text
                  ┌─────────────┐
                  │  Frontend   │
                  │ React + Vite│
                  └──────┬──────┘
                         │
                       HTTP
                         │
                         ▼
                  ┌─────────────┐
                  │   Backend   │
                  │   NestJS    │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ PostgreSQL  │
                  └─────────────┘
```

El frontend se sirve mediante Nginx y reenvía las peticiones `/api` al
backend. El backend gestiona la autenticación, la lógica de negocio y el acceso
a PostgreSQL mediante Prisma.

## 📁 Proyecto

- [`frontend/`](./frontend/README.md) — Aplicación web y documentación del frontend.
- [`backend/`](./backend/README.md) — API, lógica de negocio y documentación del backend.
- [`docker-compose.yaml`](./docker-compose.yaml) — Servicios de PostgreSQL, backend y frontend.

## 🚀 Ejecución

### Requisitos

- Node.js 24 o superior para desarrollo local.
- pnpm 10 o superior.
- Docker y Docker Compose para ejecutar todo el entorno.

### Configuración

El archivo de variables se encuentra en `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

Configura al menos estas variables:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/smart_city"
JWT_SECRET="change-this-secret"
CORS_ORIGIN="http://localhost:8080"
```

Cuando se utiliza Docker Compose, añade también las variables necesarias para
PostgreSQL y los puertos:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=smart_city
POSTGRES_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=8080
```

`DATABASE_URL` debe usar `postgres` como host dentro de Docker Compose. Desde
la máquina local, el backend usaría `localhost`.

### Ejecutar con Docker Compose

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`

Para detener los servicios:

```bash
docker compose down
```

Para eliminar también los datos persistidos de PostgreSQL:

```bash
docker compose down -v
```

### Ejecutar en local

Terminal 1 — backend:

```bash
cd backend
pnpm install
pnpm prisma generate
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

Terminal 2 — frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

En local, el frontend queda disponible en `http://localhost:5173` y Vite
reenvía `/api` al backend en `http://localhost:3000`.

## 👤 Usuarios de demostración

El seed crea tres usuarios y cinco sensores, además de ingestas históricas con
lecturas de temperatura para que la aplicación tenga datos desde el primer
arranque:

| Email | Password | Rol |
|---|---|
| `demo@example.com` | `demo1234` | Usuario genérico |
| `admin@example.com` | `admin1234` | Administrador |
| `operator@example.com` | `oper1234` | Operador |

Los sensores incluyen HTTP activos, manuales activos y un HTTP pausado para
probar todos los estados y tipos.

## 🧭 Flujo principal

1. Iniciar sesión con el usuario de demostración.
2. Consultar y gestionar sensores desde `/sensors`.
3. Abrir el detalle de un sensor para consultar lecturas o lanzar una ingesta.
4. Consultar el histórico de ejecuciones desde `/ingestions`.

La sesión se mantiene mediante una cookie `httpOnly`. Las rutas de sensores e
ingestas requieren autenticación.

## 💡 Decisiones técnicas

Las decisiones específicas de cada servicio se documentan en su README:

- [Decisiones del frontend](./frontend/README.md#-decisiones-técnicas)
- [Decisiones del backend](./backend/README.md#-decisiones-técnicas)

De forma general:

- React + Vite se utilizan para una interfaz rápida y modular.
- NestJS organiza la API mediante módulos e inyección de dependencias.
- El backend utiliza Clean Architecture por módulos.
- PostgreSQL y Prisma modelan y persisten sensores, usuarios, ingestas y lecturas.
- JWT en cookie `httpOnly` gestiona la sesión y bcrypt protege las contraseñas.
- Docker Compose permite levantar frontend, backend y base de datos con un único comando.

## 🧪 Verificación

Backend:

```bash
cd backend
pnpm test
pnpm test:e2e
```

Frontend:

```bash
cd frontend
pnpm build
pnpm lint
```

## 🔭 Mejoras futuras

- Añadir tests de componentes y de los flujos principales del frontend.

  **Rumbo:** Utilizar Playwright para cubrir los flujos críticos, como login,
  gestión de sensores, ingesta y consulta del histórico.

- Añadir una tarea programada para consultar automáticamente sensores de tipo
  `HTTP_POLL`.

- Añadir gráficas para visualizar la evolución de las lecturas de temperatura.

  **Rumbo:** Utilizaría una librería como Chart.js o Recharts, encapsulada en un
  componente propio para mantenerlo desacoplado de la librería. 
  La gráfica seria la mejor manera de mostrar el valor de temperatura en función del tiempo 
  en el detalle de cada sensor.

- Añadir registro de usuarios desde la API.

- Implementar revocación de sesiones y refresh tokens.

- Tabla de sesiones en bd para mantener el registro de sesiones activas.

- Añadir autorización por propietario del sensor.

-
