# Manual de usuario — Bolsos Cap

**Plataforma web para cotización y gestión de bolsos artesanales en crochet**

Versión del documento: julio 2026  
Audiencia: clientes y administradoras

---

## Tabla de contenidos

1. [Introducción](#1-introducción)
2. [Requisitos y acceso](#2-requisitos-y-acceso)
3. [Página de inicio (Landing)](#3-página-de-inicio-landing)
4. [Inicio de sesión](#4-inicio-de-sesión)
5. [Navegación según rol](#5-navegación-según-rol)
6. [Manual del cliente](#6-manual-del-cliente)
7. [Manual de la administradora](#7-manual-de-la-administradora)
8. [Cotizaciones automáticas de catálogo](#8-cotizaciones-automáticas-de-catálogo)
9. [Cotizaciones con inteligencia artificial (IA)](#9-cotizaciones-con-inteligencia-artificial-ia)
10. [Chat y seguimiento de cotizaciones](#10-chat-y-seguimiento-de-cotizaciones)
11. [Notificaciones](#11-notificaciones)
12. [Funcionalidades de voz (texto a voz y dictado)](#12-funcionalidades-de-voz-texto-a-voz-y-dictado)
13. [Gestión de productos y contexto para la IA](#13-gestión-de-productos-y-contexto-para-la-ia)
14. [Historial de cotizaciones](#14-historial-de-cotizaciones)
15. [Estados de una cotización](#15-estados-de-una-cotización)
16. [Preguntas frecuentes](#16-preguntas-frecuentes)

---

## 1. Introducción

**Bolsos Cap** es una aplicación web que permite:

- Explorar un **catálogo** de bolsos artesanales.
- Solicitar **cotizaciones** de productos del catálogo o de **bolsos personalizados**.
- Recibir **precios automáticos** cuando el producto ya tiene variantes configuradas.
- Generar **propuestas de precio con IA** para bolsos personalizados.
- Mantener una **conversación en chat** entre cliente y administradora durante todo el proceso.
- Gestionar el ciclo completo: solicitud → cotización → aceptación/rechazo → producción.

La aplicación distingue dos roles:

| Rol | Descripción |
|-----|-------------|
| **Cliente** | Explora, cotiza, chatea y responde a ofertas de precio. |
| **Administradora** | Gestiona productos, precios, cotizaciones, propuestas de IA y conversaciones. |

---

## 2. Requisitos y acceso

### Navegador recomendado

- Google Chrome, Microsoft Edge o Firefox actualizado.
- Conexión a internet estable.
- Para funciones de **voz**: permiso de micrófono en el navegador.

### URL de la aplicación

La aplicación usa rutas con hash (`#`). Ejemplos:

- Inicio: `https://bolsos-cap-front.vercel.app/#/`
- Catálogo: `https://bolsos-cap-front.vercel.app/#/catalog`
- Login: `https://bolsos-cap-front.vercel.app/#/login`

### Funciones que requieren sesión

Para cotizar, ver mis cotizaciones o chatear debe **iniciar sesión**. El catálogo y la página de inicio son públicos.

---

## 3. Página de inicio (Landing)

**Ruta:** `/#/`

La landing presenta la marca y orienta al usuario hacia el catálogo.

### Secciones principales

1. **Hero (cabecera)**
   - Imagen destacada del taller.
   - Título: *“Bolsos en crochet hechos para destacar cada salida”*.
   - Texto de valor: piezas hechas a mano, texturas cálidas y diseños únicos.

2. **Acciones según si está logueado**
   - **Sin sesión:** *Explorar catálogo* e *Iniciar sesión*.
   - **Con sesión:** *Ver catálogo* y *Mi perfil*.

3. **Productos destacados**
   - Muestra hasta **3 productos** del catálogo.
   - Cada tarjeta lleva al detalle del producto.

4. **Enlace al catálogo completo**
   - Botón al final de la sección de destacados.

---

## 4. Inicio de sesión

**Ruta:** `/#/login`

### Método disponible

La plataforma utiliza **inicio de sesión con Google** (OAuth).

### Pasos

1. Ir a **Iniciar sesión** en el menú superior o desde la landing.
2. Pulsar el botón **Continuar con Google**.
3. Elegir la cuenta de Google y autorizar el acceso.
4. La aplicación redirige automáticamente:
   - A la página que intentaba visitar antes del login, o
   - A la página de inicio si no había destino previo.

### Primera vez

Si es la primera vez que entra con esa cuenta de Google, el sistema **crea el usuario automáticamente**. No hay formulario de registro manual.

### Cerrar sesión

En la esquina superior derecha: botón **Cerrar sesión**. La sesión se invalida y vuelve al modo visitante.

### Perfil

**Ruta:** `/#/profile`

Muestra datos básicos del usuario (nombre, correo). En la versión actual la edición del perfil desde la interfaz es **limitada** (vista principalmente informativa).

### Nota sobre otros métodos de acceso

No hay formulario de registro ni login con correo y contraseña en la interfaz actual. El acceso es exclusivamente con Google.

---

## 5. Navegación según rol

### Menú del cliente

| Enlace | Ruta | Función |
|--------|------|---------|
| Inicio | `/` | Landing |
| Catálogo | `/catalog` | Ver todos los productos |
| Cotizar | `/cotizar` | Bolso personalizado |
| Mis Cotizaciones | `/mis-cotizaciones` | Solicitudes y chat |
| Cotiza tu Bolso | `/catalog` | Acceso rápido al catálogo |
| Campana | — | Notificaciones |

### Menú de la administradora

| Enlace | Ruta | Función |
|--------|------|---------|
| Inicio | `/` | Landing |
| Catálogo | `/catalog` | Ver y crear productos |
| Cotizaciones | `/cotizaciones` | Panel operativo principal |
| Historial | `/admin/historial-cotizaciones` | Tabla histórica con filtros |
| Campana | — | Notificaciones |

La administradora **no** ve “Cotizar” ni “Mis Cotizaciones” en el menú principal.

---

## 6. Manual del cliente

### 6.1 Explorar el catálogo

**Ruta:** `/#/catalog`

- Lista de productos con imagen, nombre y descripción breve.
- **Buscador por texto** en la parte superior.
- **Búsqueda por voz** (micrófono): dicta el nombre o características del bolso y el catálogo filtra resultados.
- Clic en una tarjeta → detalle del producto.

### 6.2 Detalle de producto

**Ruta:** `/#/product/:code`

En cada producto puede:

1. Ver fotos y descripción.
2. Escuchar la descripción con **texto a voz** (botón de altavoz).
3. Elegir **material**, **dimensiones** y **color** (según opciones del producto).
4. Pulsar **Realizar cotización** (requiere sesión).

Si no ha iniciado sesión, se le pedirá login antes de continuar.

### 6.3 Cotizar un producto del catálogo

**Flujo completo:**

```
Catálogo → Producto → elegir opciones → Realizar cotización
    → Resumen de cotización → Confirmar envío → Mis cotizaciones
```

**Ruta de resumen:** `/#/quotation-summary`

En el resumen verifica:

- Producto seleccionado.
- Color, material y dimensiones.
- Cantidad (por defecto 1).

Al confirmar:

- Se crea la solicitud y la cotización en el sistema.
- Se redirige a **Mis cotizaciones**.
- Si el producto tiene **precio configurado** para esa combinación, puede recibir la oferta de precio **de inmediato** en el chat (ver sección 8).
- Si no hay precio automático, verá un mensaje de que la solicitud fue recibida y está **pendiente** de cotización manual.

### 6.4 Cotización personalizada (bolso a medida)

**Ruta:** `/#/cotizar`

Para bolsos que **no están en el catálogo** o con especificaciones totalmente personalizadas.

#### Campos obligatorios

| Campo | Descripción |
|-------|-------------|
| Dimensiones | Ej.: `25 x 20 x 8` (ancho × alto × fondo) |
| Color | Selector de color |
| Material | Texto libre (ej.: algodón, yute) |

#### Campos opcionales

| Campo | Descripción |
|-------|-------------|
| Observaciones | Detalles adicionales del diseño |
| Foto de referencia | JPG, PNG, WEBP o GIF, máximo 5 MB |

#### Dictado por voz

En el campo **Observaciones** puede usar el **micrófono** para dictar el texto en lugar de escribirlo.

#### Después de enviar

1. La solicitud queda en estado **pendiente**.
2. El sistema dispara el **flujo de IA** (si está configurado en el servidor).
3. La administradora revisa la propuesta y, cuando la envía, usted recibe la oferta en **Mis cotizaciones** → chat.
4. Mientras tanto verá mensajes de confirmación de que la solicitud fue recibida.

### 6.5 Mis cotizaciones

**Ruta:** `/#/mis-cotizaciones`

Vista principal del cliente para seguir todas sus solicitudes.

#### Panel izquierdo — Lista

- Todas sus cotizaciones ordenadas por fecha.
- Buscador por texto.
- Badge de **estado** (Pendiente, Cotizada, Aceptada, etc.).
- La lista se actualiza automáticamente cada pocos segundos.

#### Panel derecho — Detalle y chat

Al seleccionar una cotización:

- Información del producto o bolso personalizado.
- **Conversación** con la administradora (chat en tiempo casi real).
- Tarjeta resumen del producto dentro del chat.

#### Responder a una cotización (Aceptar / Rechazar)

Cuando la administradora envía el precio final, aparece en el chat un mensaje como:

> *“La cotización de [producto] es $XXX. ¿La aceptas?”*

Debajo del mensaje verá dos botones:

- **Aceptar** — confirma el pedido al precio indicado.
- **Rechazar** — indica que no acepta la oferta.

Estos botones solo aparecen cuando hay una **oferta activa** y el estado de la cotización lo permite.

#### Escuchar mensajes

Cada mensaje del chat incluye un botón de **altavoz** para reproducir el texto en voz (accesibilidad).

### 6.6 Notificaciones del cliente

Icono de **campana** en el encabezado:

- Nueva confirmación de solicitud recibida.
- Cotización lista con precio.
- Cambios de estado del pedido (en producción, completada, etc.).

También puede recibir **correos electrónicos** en los eventos principales (confirmación de solicitud, cotización enviada).

---

## 7. Manual de la administradora

### 7.1 Panel de cotizaciones (operación diaria)

**Ruta:** `/#/cotizaciones`

Es la pantalla principal de trabajo.

#### Lista lateral

- Todas las cotizaciones de todos los clientes.
- Búsqueda por nombre de cliente, correo o producto.
- Indicador de estado y monto (si existe propuesta IA o precio final).
- Actualización automática cada ~10 segundos.

#### Al seleccionar una cotización

| Bloque | Función |
|--------|---------|
| **Cabecera** | Cliente, producto, código de solicitud |
| **Estado** | Selector para cambiar el estado manualmente |
| **Trazabilidad** | Línea de tiempo solicitud ↔ cotización |
| **Panel IA** | Propuesta automática para bolsos personalizados |
| **Chat** | Conversación con el cliente |

#### Cambiar estado manualmente

Estados disponibles en el selector:

- Pendiente
- Cotizada (IA)
- En revisión
- Cotizada
- Aceptada / Rechazada
- En producción
- Completada / Cancelada

Use **En producción** y **Completada** cuando el pedido avanza en taller.

#### Panel de propuesta IA

Ver sección [9. Cotizaciones con IA](#9-cotizaciones-con-inteligencia-artificial-ia).

#### Trazabilidad

Botón **Trazabilidad** abre un panel con la línea de tiempo:

- Creación de solicitud.
- Generación de propuesta IA.
- Envío de cotización al cliente.
- Respuesta del cliente.
- Cambios de estado posteriores.

### 7.2 Gestión de productos

#### Crear producto

**Ruta:** `/#/catalog` → botón **Crear nuevo producto** (solo visible para admin).

Datos del formulario:

- Nombre y descripción.
- Código interno.
- Colores disponibles (lista).
- Dimensiones disponibles (lista).
- Materiales disponibles (lista).
- Tipo de bolso.
- Foto principal.

Al guardar, el sistema puede **generar automáticamente** las combinaciones de variantes (color × material × dimensiones).

#### Editar o eliminar producto

**Ruta:** `/#/product/:code` (logueada como admin)

- Botones **Editar** y **Eliminar** en la ficha del producto.
- Modal de edición con dos pestañas:
  1. **Detalles** — datos generales y foto.
  2. **Variantes y precios** — tabla de precios por combinación.

Ver sección [13](#13-gestión-de-productos-y-contexto-para-la-ia) para el detalle de variantes.

### 7.3 Chat como administradora

El chat en `/cotizaciones` funciona igual que para el cliente, con estas diferencias:

- Ve **mensajes internos** que el cliente no ve (propuesta de IA, avisos de auto-cotización fallida, confirmación de envío al cliente).
- Puede **eliminar** sus propios mensajes (icono ✕).
- Puede escuchar cualquier mensaje con **texto a voz**.

**Mensajes que solo ve la admin:**

- *“Propuesta de cotización generada por IA”* (monto sugerido + justificación).
- *“No se envió cotización automática al cliente”* (falta de precio o variante).
- *“[Cliente] ha recibido la cotización de [producto] por $X”* (después de enviar precio).

**Mensajes que ve el cliente:**

- Confirmación de solicitud recibida.
- Oferta de precio: *“La cotización de … es $X. ¿La aceptas?”*
- Agradecimiento o registro de aceptación/rechazo.

### 7.4 Notificaciones de la administradora

La campana muestra alertas como:

| Tipo | Cuándo aparece |
|------|----------------|
| Nueva solicitud | Un cliente envía una cotización |
| Cotización IA lista | La IA terminó de calcular un precio (bolso personalizado) |
| Cotización automática pendiente | Catálogo sin precio suficiente; debe cotizar manualmente |
| Respuesta del cliente | El cliente aceptó o rechazó una oferta |

También recibe **correos** en eventos importantes (nueva solicitud, propuesta IA lista).

### 7.5 Vista alternativa de mensajes

**Ruta:** `/#/admin/messages`

Vista centrada en conversaciones. Existe en la aplicación pero **no aparece en el menú principal**; se accede escribiendo la URL directamente. El flujo recomendado es usar **Cotizaciones**.

---

## 8. Cotizaciones automáticas de catálogo

### ¿Qué es?

Cuando un cliente cotiza un producto del **catálogo** y la administradora ya configuró el **precio total** para la combinación exacta de color + material + dimensiones, el sistema:

1. Calcula el precio (`precio total × cantidad`).
2. Marca la cotización como **Cotizada**.
3. Envía al cliente en el chat la oferta con botones **Aceptar / Rechazar**.
4. Notifica a la admin que hay una nueva solicitud (ya cotizada automáticamente).

**No interviene la IA de n8n** en este flujo; es una regla de negocio basada en la tabla de variantes.

### Requisitos para que funcione

| Requisito | Detalle |
|-----------|---------|
| Variante existente | Debe existir la fila color + material + dimensiones en **Variantes y precios** |
| Precio mayor a cero | Campo **Precio total** (`totalPrice`) > 0 |
| Datos completos en la solicitud | El cliente debe elegir color, material y dimensiones al cotizar |

### Si no hay auto-cotización

El cliente recibe el mensaje habitual de *“solicitud recibida, pendiente de cotización”*.

La administradora recibe:

- Notificación en campana: **“Cotización automática no enviada al cliente”**.
- Mensaje en el chat (solo admin) con el motivo:
  - Faltan datos en la solicitud.
  - No existe variante para esa combinación.
  - La variante existe pero el precio está en **$0**.

En ese caso debe **cotizar manualmente** desde el panel o enviar precio por el flujo habitual.

### Ejemplo práctico

1. Admin configura el bolso “Luna” con variante: Negro + Algodón + 26×22×8 → **$120.000**.
2. Cliente cotiza exactamente esa combinación.
3. En segundos recibe en chat: *“La cotización del bolso Luna es $120.000. ¿La aceptas?”*

---

## 9. Cotizaciones con inteligencia artificial (IA)

### ¿Cuándo aplica?

Solo para cotizaciones **personalizadas** (`/cotizar`), no para el catálogo con precios ya definidos.

### Flujo completo

```
Cliente envía formulario personalizado
        ↓
Estado: Pendiente
        ↓
Servidor dispara workflow n8n (IA + búsqueda vectorial)
        ↓
IA calcula precio sugerido → Estado: Cotizada (IA)
        ↓
Admin ve propuesta en panel "Propuesta IA · $X"
        ↓
Admin pulsa Aceptar o Modificar
        ↓
Precio se envía al cliente → Estado: Cotizada
        ↓
Cliente Acepta o Rechaza en el chat
```

### Panel “Propuesta IA” (admin)

Cuando la IA termina, aparece una franja verde con:

- **Monto sugerido** y nivel de confianza (si está disponible).
- **Justificación** de la IA (criterios usados).
- Botones:
  - **Aceptar** — envía el monto sugerido al cliente tal cual.
  - **Modificar** — abre un modal para ajustar monto y criterios.

### Modal “Modificar cotización”

| Campo | Uso |
|-------|-----|
| Monto (COP) | Precio que recibirá el cliente |
| Criterios de IA para generar cotización | Referencia interna (justificación); **no se envía al cliente** |

Al confirmar, el cliente recibe solo el mensaje de precio en el chat, sin detalles técnicos de la IA.

### Si la IA tarda o falla

- Primeros ~90 segundos: mensaje *“Generando cotización con IA”*.
- Después de 90 s sin respuesta: aviso *“IA no completó la cotización”* con sugerencia de revisar el workflow en n8n.
- La admin puede cotizar **manualmente** ingresando un monto si la IA no responde.

### Contexto que usa la IA

La IA se apoya en:

- Datos del formulario del cliente (dimensiones, color, material, observaciones, foto).
- **Variantes del catálogo** con descripciones y embeddings (búsqueda de productos similares).
- Precios y horas configurados en variantes (como referencia de costos en el backend).

Ver sección [13](#13-gestión-de-productos-y-contexto-para-la-ia).

---

## 10. Chat y seguimiento de cotizaciones

### Propósito

El chat es el canal principal de comunicación **dentro de la plataforma** para cada cotización. No sustituye el correo, pero concentra el historial por pedido.

### Características

- Mensajes en tiempo casi real (actualización automática cada 3–5 segundos).
- Mensajes del **sistema** (confirmaciones, ofertas de precio).
- **Audiencias separadas:** algunos mensajes solo los ve la admin (propuesta IA, avisos internos).
- **Adjuntos:** en cotizaciones personalizadas, la foto de referencia puede aparecer en el hilo.
- **Tarjeta de producto** embebida con resumen visual.
- **Texto a voz** en cada mensaje.

### Ofertas de precio en el chat

Las ofertas se identifican por:

- Tipo de mensaje `quotation_offer`, o
- Texto que coincide con *“La cotización de … es …”*.

Solo la **última oferta activa** muestra botones Aceptar/Rechazar al cliente.

### Buenas prácticas

**Cliente:** use el chat para preguntas sobre plazos, materiales o cambios antes de aceptar.

**Admin:** envíe el precio formal a través del panel IA o cotización manual para que se registre el mensaje de oferta con botones; los mensajes libres de texto no activan la aceptación estructurada.

---

## 11. Notificaciones

### Canales implementados

| Canal | Descripción |
|-------|-------------|
| **In-app (campana)** | Lista en el encabezado; marcar como leída al abrir |
| **Correo electrónico** | Confirmaciones y alertas importantes |
| **Chat (mensajes sistema)** | Eventos vinculados a cada cotización |

### Eventos notificados

**Cliente:**

- Solicitud de cotización recibida.
- Cotización lista con precio.
- Cambio de estado del pedido.

**Administradora:**

- Nueva solicitud de cotización.
- Propuesta de IA lista para revisar.
- Auto-cotización de catálogo no enviada (falta precio).
- Cliente aceptó o rechazó una oferta.


## 12. Funcionalidades de voz (texto a voz y dictado)

La aplicación incluye accesibilidad y búsqueda manos libres mediante **Azure Cognitive Services** (con respaldo del navegador si Azure no está disponible).

### Texto a voz (TTS) — “Escuchar”

**Dónde está:**

| Pantalla | Qué lee |
|----------|---------|
| Detalle de producto | Descripción del bolso |
| Chat (cliente y admin) | Contenido de cada mensaje |

**Cómo usarlo:**

1. Busque el icono de **altavoz** junto al texto.
2. Clic para **reproducir**.
3. Clic de nuevo para **detener**.

Voz predeterminada: español (voz neural Azure).

### Dictado por voz (STT) — Micrófono

**Dónde está:**

| Pantalla | Uso |
|----------|-----|
| Catálogo | Buscar productos hablando |
| Cotizar (personalizado) | Dictar observaciones |
| Historial (admin) | Filtrar por voz (estado o texto) |

**Cómo usarlo:**

1. Conceda permiso de **micrófono** cuando el navegador lo solicite.
2. Pulse el botón del **micrófono**.
3. Hable con claridad en español.
4. El texto reconocido se inserta en el campo o filtro activo.

### Requisitos técnicos (administrador de sistemas)

Variables de entorno en el frontend:

- `VITE_AZURE_KEY`
- `VITE_AZURE_REGION`

Sin estas claves, algunas funciones de voz pueden usar el motor del navegador o mostrar error.

---

## 13. Gestión de productos y contexto para la IA

### Concepto de variante

Cada producto del catálogo puede tener muchas **variantes**: una por cada combinación única de:

- **Color**
- **Material**
- **Dimensiones**

Ejemplo: Bolso Luna → Negro + Algodón + 26×22×8 es una variante distinta de Negro + Yute + 30×25×10.

### Pestaña “Variantes y precios”

**Acceso:** Catálogo → producto → Editar → pestaña **Variantes y precios**.

#### Acciones principales

| Botón | Función |
|-------|---------|
| **Sincronizar combinaciones** | Crea filas para todas las combinaciones posibles según colores, materiales y dimensiones del producto |
| **Guardar precios** | Persiste los valores editados en la tabla |
| **Descripción de imagen** | Texto visual para ayudar a la IA a encontrar productos similares |
| **Eliminar variante** | Quita una combinación específica |

#### Campos de cada variante

| Campo | Uso en la aplicación |
|-------|----------------------|
| **Precio total** (`totalPrice`) | **Obligatorio para auto-cotización de catálogo.** Es el precio que recibe el cliente automáticamente. |
| **Precio material** (`materialPrice`) | Costo de materiales; referencia de costos para la administradora y contexto de negocio. |
| **Horas de trabajo** (`workHours`) | Tiempo estimado de confección (valor por defecto: 6 h). Referencia para costeo y para que la IA tenga nociones de complejidad. |
| **Descripción de imagen** | Describe colores, texturas y forma de la pieza; alimenta el **embedding** para búsqueda vectorial cuando un cliente pide un bolso personalizado similar. |

### Cómo dar contexto a la IA con precios y horas

1. **Mantenga el catálogo actualizado** con variantes reales del taller.
2. **Sincronice** después de agregar colores, materiales o dimensiones nuevos.
3. Complete **precio total** en todas las combinaciones que quiera vender con auto-cotización.
4. Ajuste **precio material** y **horas de trabajo** para reflejar costos reales (la IA y los reportes internos usan este contexto indirectamente vía variantes y embeddings).
5. Redacte **descripciones de imagen** ricas (“Bolso tipo tote en crochet negro, asas reforzadas, textura compacta”) para mejorar coincidencias en cotizaciones personalizadas.

### Relación con cotizaciones

| Tipo de cotización | Usa variantes cómo |
|--------------------|-------------------|
| Catálogo | Lookup directo → `totalPrice` → precio al cliente |
| Personalizada (IA) | Búsqueda por similitud (embeddings + descripciones) + datos del formulario |

---

## 14. Historial de cotizaciones

**Ruta (admin):** `/#/admin/historial-cotizaciones`

Vista tabular para consulta y auditoría.

### Columnas típicas

- Cliente (nombre y correo).
- Producto o tipo de bolso.
- Código de solicitud.
- Fecha de creación.
- Estado actual.
- Precio (IA, final o propuesto por cliente).

### Filtros

- Texto libre (cliente, producto, código).
- Producto.
- Estado.
- Rango de fechas.
- **Búsqueda por voz** (dictar estado o término de búsqueda).

### Acción desde el historial

Clic en una fila → abre la cotización en **Cotizaciones** con el chat listo para continuar la gestión.

---

## 15. Estados de una cotización

| Estado | Significado | Quién lo ve |
|--------|-------------|-------------|
| **Pendiente** | Solicitud recibida; sin precio final | Todos |
| **Cotizada (IA)** | La IA generó una propuesta; admin debe revisar | Admin (cliente ve “Pendiente” hasta que se envíe precio) |
| **En revisión** | Cliente propuso otro precio o hay ajuste en curso | Todos |
| **Cotizada** | Precio enviado al cliente; esperando respuesta | Todos |
| **Aceptada** | Cliente confirmó el pedido | Todos |
| **Rechazada** | Cliente no aceptó la oferta | Todos |
| **En producción** | Pedido en taller | Todos |
| **Completada** | Pedido entregado/finalizado | Todos |
| **Cancelada** | Proceso cancelado | Todos |

### Diagrama simplificado

```
                    ┌─────────────┐
                    │  Pendiente  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   (catálogo auto)   Cotizada (IA)    cotización manual
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │  Cotizada   │◄── En revisión
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │  Aceptada   │           │ Rechazada   │
       └──────┬──────┘           └─────────────┘
              ▼
       ┌─────────────┐
       │En producción│
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │ Completada  │
       └─────────────┘
```

---

## 16. Preguntas frecuentes

### ¿Por qué no recibí precio automático al cotizar del catálogo?

Probablemente la combinación elegida no tiene **precio total** configurado o está en $0. La administradora debe completar la tabla de variantes.

### ¿Cuánto tarda la cotización con IA?

Normalmente entre 15 y 60 segundos. Si pasa más de 90 segundos, puede haber un problema en el servidor de automatización (n8n).

### ¿Puedo cotizar sin cuenta de Google?

No en la versión actual. Se requiere **inicio de sesión con Google**.

### ¿Recibiré mensajes por WhatsApp?

**No.** Las notificaciones son por la **web** (campana y chat) y **correo electrónico**.

### ¿La administradora ve los mismos mensajes que yo?

No siempre. Los mensajes de propuesta IA y avisos internos son **solo para la administradora**. Usted solo ve confirmaciones y ofertas de precio.

### ¿Puedo escuchar la descripción de un producto?

Sí, use el botón de **altavoz** en la ficha del producto y en cada mensaje del chat.

### ¿Qué pasa si rechazo una cotización?

El estado pasa a **Rechazada**. Puede escribir en el chat para solicitar una nueva propuesta.

### ¿Cómo sabe la IA qué precio sugerir?

Analiza las medidas y materiales del formulario, busca productos similares en el catálogo (embeddings) y aplica reglas del workflow configurado en el servidor. Los **precios y horas** que usted configure en variantes mejoran la calidad de esas comparaciones.

---

## Apéndice — Rutas rápidas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/` | Todos | Inicio |
| `/catalog` | Todos | Catálogo |
| `/product/:code` | Todos | Detalle producto |
| `/login` | Todos | Login Google |
| `/profile` | Usuario | Perfil |
| `/cotizar` | Cliente | Bolso personalizado |
| `/quotation-summary` | Cliente | Confirmar cotización catálogo |
| `/mis-cotizaciones` | Cliente | Mis solicitudes y chat |
| `/cotizaciones` | Admin | Panel de cotizaciones |
| `/admin/historial-cotizaciones` | Admin | Historial tabular |
| `/admin/messages` | Admin | Mensajes (acceso directo URL) |
| `/quotation/:id` | Usuario | Detalle ampliado de cotización |

---

*Documento generado para el proyecto Bolsos Cap. Para soporte técnico o ampliación de funcionalidades (p. ej. WhatsApp), contacte al equipo de desarrollo.*
