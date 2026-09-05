# Frontend — Especificaciones y Objetivos

## Objetivo

Construir una interfaz web que permita a un usuario autenticado gestionar sensores de temperatura, ejecutar ingestas y consultar las lecturas obtenidas, además de visualizar el histórico de ejecuciones de ingesta.

---

## Autenticación

### Pantallas

* `/login`

  * Email.
  * Contraseña.
  * Mensajes de error de autenticación.
  * Acceso a la aplicación tras autenticarse.

* `/logout`

  * Cierre de sesión.

### Protección

Las siguientes pantallas requieren una sesión:

* `/sensors`
* `/sensors/:id`
* `/ingestions`

Los usuarios no autenticados no deben poder acceder a estas pantallas.

---

## Gestión de sensores

### Pantalla `/sensors`

Debe permitir:

* Visualizar un listado de sensores.
* Crear sensores.
* Editar sensores.
* Activar sensores.
* Pausar sensores.
* Eliminar sensores.
* Acceder al detalle de un sensor.

### Información del sensor

Cada sensor debe mostrar como mínimo:

* Nombre.
* Código del sensor.
* Tipo.
* Estado.
* URL, cuando corresponda.

### Tipos

* `HTTP_POLL`
* `MANUAL_UPLOAD`

### Estados

* `active`
* `paused`

### Validaciones

* `name`: obligatorio, mínimo 3 caracteres.
* `sensorCode`: obligatorio, mínimo 3 caracteres y único.
* `type`: debe corresponder a uno de los tipos permitidos.
* `status`: debe corresponder a uno de los estados permitidos.
* `url`: debe ser una URL válida cuando el sensor sea de tipo `HTTP_POLL`.

---

## Detalle de sensor

### Pantalla `/sensors/:id`

Debe permitir consultar la información de un sensor y sus lecturas.

Debe mostrar:

* Información del sensor.
* Estado actual.
* Tipo.
* Código.
* Histórico de temperaturas.
* Timestamp de cada lectura.
* Valor de temperatura en °C.

Debe existir la posibilidad de consultar un número limitado de lecturas.

---

## Ingestas

### Pantalla `/ingestions`

Debe permitir:

* Visualizar el histórico de ejecuciones de ingesta.
* Consultar el estado de cada ejecución.
* Consultar cuándo comenzó y terminó.
* Consultar cuántos registros fueron procesados.
* Consultar errores cuando una ingesta falle.
* Ejecutar una acción **"Ingestar ahora"**.

### Estados

* `success`
* `error`

### Información mostrada

Cada ejecución debe representar:

* Sensor.
* Fecha/hora de inicio.
* Fecha/hora de finalización.
* Estado.
* Registros procesados.
* Mensaje de error, si existe.

---

## Lecturas de temperatura

Las lecturas deben mostrar:

* Sensor asociado.
* Fecha/hora.
* Temperatura.
* Unidad: °C.

El frontend debe ser capaz de representar las lecturas independientemente del formato de origen utilizado por el sensor.

---

## Resumen de funcionalidades

* Autenticación.
* Protección de páginas.
* Gestión de sensores.
* Activación y pausa de sensores.
* Visualización del detalle de sensores.
* Visualización de temperaturas.
* Histórico de ingestas.
* Ejecución manual de ingestas.
* Visualización de errores.
* Estados de sensores e ingestas.
