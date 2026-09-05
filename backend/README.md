# Smart City Temperature Sensor Platform — Backend

API REST para autenticar usuarios, gestionar sensores, ingerir lecturas de
temperatura y consultar el histórico de ingestas.

## 🛠️ Stack

- NestJS 12
- TypeScript
- PostgreSQL
- Prisma 7
- JWT
- bcrypt
- class-validator y class-transformer
- Vitest y Supertest
- pnpm

## 🏗️ Arquitectura

El backend sigue una Clean Architecture organizada por módulos. Los casos de
uso dependen de puertos definidos en la aplicación, mientras que Prisma, JWT,
bcrypt y NestJS se mantienen en los adaptadores de infraestructura y
presentación.

```text
Presentation ──▶ Application ──▶ Domain
      │                ▲
      └── Infrastructure ──────┘
```

## 📁 Estructura

```text
src/
├── common/              # Filtros y errores compartidos
├── config/              # Validación de variables de entorno
├── modules/
│   ├── auth/            # Login, sesión y usuario actual
│   ├── sensors/         # CRUD de sensores
│   ├── ingestions/      # Ingesta y consulta de lecturas
│   └── mock/            # Fuentes HTTP de prueba
├── shared/database/     # Módulo y servicio de base de datos
└── main.ts              # Bootstrap de NestJS
```

## 💡 Decisiones técnicas

### Clean Architecture

Clean Architecture organizada por módulos.

**Motivo**

Tenía curiosidad por poner en práctica este enfoque y aprovechar la prueba para
entender mejor cómo estructurar una aplicación desde el principio. Además, por
lo que estuve estudiando, encaja bien con NestJS gracias a su sistema de
módulos e inyección de dependencias, y permite mantener la lógica de negocio
separada del framework y de la persistencia.

### NestJS

**Motivo**

Ya tenía experiencia con el framework y ofrece una estructura clara
para módulos, inyección de dependencias, controladores y validación, asi que pense que se integraria muy bien en una clean architecture.

### Prisma

**Motivo**

Inicialmente valoré utilizar TypeORM, con el que ya había trabajado. Finalmente
elegí Prisma porque leyendo la documentacion por curiosidad me gusto ver que tiene muchas ayudas como cliente tipado y sistema de migraciones.

### PostgreSQL


**Motivo:** El dominio contiene relaciones entre usuarios, sensores, ingestas y
lecturas, por lo que una base de datos relacional encaja bien con el modelo.

### JWT + bcrypt


**Motivo**

El requisito mencionaba `Passwords: hashing jwt`, una frase que
interpreté como dos aspectos distintos: bcrypt para proteger las contraseñas y
JWT para gestionar la sesión. JWT no se utiliza para hashear contraseñas.

Inicialmente valoré crear una tabla de sesiones, pero finalmente opté por un
JWT en una cookie `httpOnly`, suficiente para el alcance de esta prueba.

### class-validator y ValidationPipe


**Motivo**

Se validan y transforman los cuerpos y parámetros en la entrada de
la API. `whitelist: true` elimina propiedades no declaradas en los DTOs y los
identificadores de sensores se validan como UUID v4.


### Vite

**Motivo**
 Estoy acostumbrado a trabajar con el, es bastante rápido  y lo uso en proyectos personales


### pnpm

**Motivo**
Me gusta mas que npm, simplemente por que es mas rapido y mas ligero.

### Paginación

**Motivo**

La prueba no pedía paginación explícitamente, pero con el seed generando
múltiples ingestas y lecturas, las listas crecían rápido. Implementarla
demostraba que la arquitectura permite añadir features sin reescribir nada:
solo hubo que añadir `skip`/`take` en los repositorios y propagar los
parámetros por los casos de uso.


### Configuración

La aplicación exige estas variables de entorno antes de arrancar:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:3000
PORT=3000
```

## 🔌 API

Todas las rutas usan el prefijo `/api`. Las rutas protegidas requieren la
cookie de sesión creada durante el login.

### Authentication

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Inicia sesión y crea la cookie `session` | ❌ |
| GET | `/api/auth/me` | Obtiene el usuario autenticado | ✅ |
| POST | `/api/auth/logout` | Elimina la cookie de sesión | ❌ |

### Sensors

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/sensors?page=1&limit=20` | Lista sensores (paginado) | ✅ |
| GET | `/api/sensors/:id` | Obtiene un sensor por UUID | ✅ |
| POST | `/api/sensors` | Crea un sensor | ✅ |
| PATCH | `/api/sensors/:id` | Actualiza un sensor | ✅ |
| DELETE | `/api/sensors/:id` | Elimina un sensor | ✅ |

### Temperature readings and ingestions

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/api/sensors/:id/ingest` | Ingiere lecturas de un sensor | ✅ |
| GET | `/api/sensors/:id/readings?limit=20&offset=0` | Consulta lecturas del sensor (paginado) | ✅ |
| GET | `/api/ingestions?page=1&limit=20` | Lista ejecuciones de ingesta (paginado) | ✅ |

La ingesta admite los formatos de los mocks incluidos en `/api/mock`, ignora
duplicados por `(sensorId, timestamp)` y registra el resultado de cada
ejecución.

### Mock data sources

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/mock/temp-format-a` | Devuelve lecturas en formato de lista | ❌ |
| GET | `/api/mock/temp-format-b` | Devuelve lecturas en formato agrupado | ❌ |

## 🚀 Desarrollo

```bash
pnpm install
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

La API queda disponible por defecto en `http://localhost:3000/api`.

### Otros comandos

```bash
pnpm build
pnpm start:prod
pnpm lint
pnpm db:deploy
```

## 🧪 Tests

```bash
pnpm test
pnpm test:e2e
```

Los tests cubren el flujo de autenticación, la ingesta transaccional y la
concurrencia al crear sensores.
