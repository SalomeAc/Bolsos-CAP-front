# Bolsos-CAP-front

Frontend de **Bolsos CAP**. Aplicación web tipo *e-commerce* para **bolsos tejidos a crochet**: como cada pieza es hecha a mano, **no hay precios fijos**; todo se vende por **cotización**.

> El backend del proyecto vive en `[Bolsos-CAP-back](../Bolsos-CAP-back)`. La administradora (admin) gestiona el catálogo, refina cotizaciones y administra pedidos desde este frontend.

## Tabla de contenidos

- [Visión del producto](#visión-del-producto)
- [Estado del proyecto](#estado-del-proyecto)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración (](#configuración-env)`.env`[)](#configuración-env)
- [Ejecución](#ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Funcionalidades principales](#funcionalidades-principales)
- [Autenticación y sesión](#autenticación-y-sesión)
- [Integración con el backend](#integración-con-el-backend)
- [Pruebas](#pruebas)
- [Documentación adicional](#documentación-adicional)

---



## Visión del producto

- Cualquier visitante puede explorar el **catálogo** (color, material, tamaño, descripción) **sin loguearse**.
- El cliente puede pedir **dos tipos de cotización** (requiere login):
  1. **Sobre un producto del catálogo**, personalizándolo por tipo, color y tamaño.
  2. **Producto personalizado** que no está en el catálogo (foto de referencia, descripción, color, dimensiones y materiales).
- La solicitud llega a la **administradora** vía chat. Una **IA (Gemini vía n8n)** genera una cotización preliminar; la administradora la **refina** y responde.
- El cliente **acepta o rechaza**. Al aceptar se avanza el estado del pedido y recibe **notificaciones** en la app.



## Estado del proyecto

**Implementado:**

- Catálogo público y detalle de producto.
- Login con Google OAuth y gestión de sesión (JWT).
- Cotización de catálogo y cotización personalizada (`/cotizar`).
- Panel de administración: CRUD de productos, variantes, cotizaciones e historial.
- Chat por cotización con acciones de oferta y respuesta del cliente.
- Panel de propuesta IA para la administradora.
- Notificaciones en tiempo casi real (polling).
- Dictado por voz (Azure Speech) y lectura en voz alta (TTS) en formularios y detalle de producto.
- Suite de pruebas unitarias con Vitest y cobertura mínima configurada.

**Próximas fases** (ver `[features.md](../Bolsos-CAP-back/features.md)` en el backend):

- Chat en tiempo real con Socket.io.
- Entidad `Order` separada y notificaciones por correo.
- Ampliación de pruebas E2E y flujos manuales de QA.



## Tecnologías

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [React Router 7](https://reactrouter.com/) (`HashRouter`)
- [Zustand 5](https://zustand.docs.pmnd.rs/) — estado global (`useAuthStore`, `useProductsStore`) con persistencia en `localStorage`
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) — login con Google
- [Microsoft Cognitive Services Speech SDK](https://www.npmjs.com/package/microsoft-cognitiveservices-speech-sdk) — dictado y síntesis de voz (Azure)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — pruebas unitarias y de componentes



## Requisitos previos

- **Node.js** 18 o superior (recomendado 20+).
- **npm** (incluido con Node).
- Backend `[Bolsos-CAP-back](../Bolsos-CAP-back)` en ejecución (por defecto `http://localhost:3000`).
- Credenciales de **Google OAuth** (mismo `GOOGLE_CLIENT_ID` que el backend).
- Credenciales de **Azure Speech** (opcional; sin ellas el dictado por voz queda deshabilitado).



## Instalación

```bash
git clone <url-del-repo>
cd Bolsos-CAP-front
npm install
```



## Configuración (`.env`)

Crea un archivo `.env` en la raíz del frontend con las siguientes variables:

```env
# URL base del backend (sin barra final)
VITE_API_URL=http://localhost:3000

# OAuth — debe coincidir con GOOGLE_CLIENT_ID del backend
VITE_GOOGLE_CLIENT_ID=tu_google_client_id

# Azure Speech (opcional — dictado y TTS)
VITE_AZURE_KEY=tu_azure_speech_key
VITE_AZURE_REGION=eastus
```


| Variable                | Requerida | Descripción                                                          |
| ----------------------- | --------- | -------------------------------------------------------------------- |
| `VITE_API_URL`          | Sí        | Base URL del API REST (`/api/...`). Default: `http://localhost:3000` |
| `VITE_GOOGLE_CLIENT_ID` | Sí        | Client ID de Google OAuth. Sin ella la app muestra error al arrancar |
| `VITE_AZURE_KEY`        | No        | Clave del recurso Azure Speech                                       |
| `VITE_AZURE_REGION`     | No        | Región del recurso Azure (p. ej. `eastus`)                           |


> Solo las variables con prefijo `VITE_` están expuestas al código del cliente. `.env` está en `.gitignore` y **no debe versionarse**.



## Ejecución

Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

```bash
# Desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint
```

Por defecto Vite sirve la app en `http://localhost:5173`.

La app usa **HashRouter**, por lo que las rutas tienen la forma `http://localhost:5173/#/catalog`.

---



## Estructura del proyecto

```
src/
├── components/          UI reutilizable
│   ├── AdminAiQuotationPanel/   Panel de propuesta IA (admin)
│   ├── Chat/                    Chat por cotización
│   ├── ClientQuotationResponse/ Respuesta aceptar/rechazar (cliente)
│   ├── Navigation/              Barra de navegación
│   ├── Notifications/           Campana de notificaciones
│   ├── ProductAdmin/            Modales CRUD de productos y variantes
│   ├── ProductCard/             Tarjeta de producto
│   ├── SpeakButton/             Botón TTS (text-to-speech)
│   ├── Traceability/            Panel de trazabilidad
│   └── VoiceButton/             Botón de dictado por voz
├── hooks/
│   └── useAzureDictation.js     Hook de dictado con Azure Speech
├── pages/               Vistas por ruta
│   ├── CatalogPage/             Catálogo público
│   ├── CotizarPage/             Cotización personalizada
│   ├── CotizacionesPage/        Gestión de cotizaciones (admin)
│   ├── HistorialCotizacionesPage/
│   ├── HomePage/
│   ├── LoginPage/
│   ├── MisCotizacionesPage/     Seguimiento del cliente
│   ├── ProductPage/             Detalle y personalización
│   ├── ProfilePage/
│   ├── QuotationDetailPage/     Detalle + chat
│   └── QuotationSummaryPage/
├── router/
│   └── Router.jsx               Definición de rutas y guards
├── services/            Capa de acceso al API
│   ├── authService.js
│   ├── messageService.js
│   ├── notificationService.js
│   ├── productService.js
│   ├── productVariantService.js
│   ├── quotationService.js
│   └── speechService.js
├── store/               Estado global (Zustand)
│   ├── useAuthStore.js
│   └── useProductsStore.js
├── test/                Utilidades de prueba (setup, mockFetch)
├── App.jsx              Shell de la app (Google OAuth, carga de catálogo)
└── main.jsx             Punto de entrada

vitest.config.js         Configuración de pruebas y umbrales de cobertura
vite.config.js           Configuración de Vite
```

---



## Rutas de la aplicación


| Ruta                            | Auth | Rol         | Descripción                            |
| ------------------------------- | ---- | ----------- | -------------------------------------- |
| `/`                             | —    | Todos       | Página de inicio                       |
| `/catalog`                      | —    | Todos       | Catálogo de productos                  |
| `/product/:code`                | —    | Todos       | Detalle y personalización de producto  |
| `/login`                        | —    | Todos       | Login con Google                       |
| `/profile`                      | 🔒   | Usuario     | Perfil del usuario                     |
| `/cotizar`                      | 🔒   | Cliente     | Formulario de cotización personalizada |
| `/mis-cotizaciones`             | 🔒   | Cliente     | Seguimiento de cotizaciones propias    |
| `/quotation/:quotationId`       | 🔒   | Dueño/admin | Detalle de cotización y chat           |
| `/quotation-summary`            | 🔒   | Usuario     | Resumen post-cotización                |
| `/cotizaciones`                 | 🔒   | Admin       | Panel de cotizaciones pendientes       |
| `/admin/historial-cotizaciones` | 🔒   | Admin       | Historial de cotizaciones              |
| `/admin/messages`               | 🔒   | Admin       | Mensajes (admin)                       |


🔒 = requiere sesión válida (JWT no expirado). Si el usuario no está autenticado, se redirige a `/login` guardando la ruta de retorno.

La navegación muestra enlaces distintos según el rol: los **clientes** ven *Cotizar* y *Mis Cotizaciones*; la **admin** ve *Cotizaciones* e *Historial*.

---



## Funcionalidades principales



### Catálogo y productos

- Carga inicial del catálogo desde `GET /api/products` al arrancar la app.
- Filtros y búsqueda en `CatalogPage`.
- Detalle con variantes (color, tamaño, material) y flujo de cotización de catálogo.
- Administración de productos: crear, editar, eliminar y gestionar variantes con subida de fotos (Cloudinary vía backend).



### Cotizaciones

- **Catálogo:** personalización sobre un producto existente → `POST /api/quotations` con `kind: "catalog"`.
- **Personalizada:** formulario en `/cotizar` con foto, dimensiones, color y materiales → `kind: "custom"`.
- Máquina de estados reflejada en la UI: `pendiente` → `cotizada_ia` → `en_revision` → `cotizada` → `aceptada` → `en_produccion` → `completada`.
- Chat asociado a cada cotización con tarjeta de producto, ofertas y acciones de respuesta.



### Voz (accesibilidad)

- **Dictado:** botón de micrófono en formularios (`VoiceButton`, `useAzureDictation`).
- **Lectura en voz alta:** descripción de productos (`SpeakButton`, `speechService`).
- Puede usar token de Azure desde el backend o variables `VITE_AZURE_*` directamente.



### Notificaciones

- Campana en el header con polling al backend (`notificationService`).
- Avisos de nuevas cotizaciones, respuestas y cambios de estado.

---



## Autenticación y sesión

1. El usuario inicia sesión con el botón de Google en `/login`.
2. El frontend envía el `idToken` a `POST /api/users/login` y recibe un **JWT** del backend.
3. El token y el perfil se persisten en `useAuthStore` (Zustand + `localStorage`).
4. Las peticiones autenticadas envían `Authorization: Bearer <jwt>`.
5. El token expira en **1 hora**; `ProtectedRoute` y `isTokenExpired` redirigen a login si caduca.
6. Tras login exitoso, el usuario vuelve a la ruta que intentaba visitar (`returnPath`).

El flag `isAdmin` se obtiene del perfil en backend, no del payload del JWT.

---



## Integración con el backend


| Servicio frontend       | Endpoints principales                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| `authService`           | `/api/users/login`, `/api/users/user-profile`, `/api/users/update-profile` |
| `productService`        | `/api/products` (CRUD)                                                     |
| `productVariantService` | `/api/products/:id/variants`                                               |
| `quotationService`      | `/api/quotations` (crear, listar, cotizar, responder, estado)              |
| `messageService`        | `/api/quotations/:id/messages`                                             |
| `notificationService`   | `/api/notifications`                                                       |
| `speechService`         | Token Azure vía backend (si está configurado)                              |


Convenciones del API (base URL, códigos HTTP, formato de errores): ver `[Bolsos-CAP-back/README.md](../Bolsos-CAP-back/README.md)`.

---



## Pruebas

```bash
# Ejecutar todas las pruebas una vez
npm test

# Modo watch (desarrollo)
npm run test:watch

# Cobertura (reporte en consola y HTML en coverage/)
npm run test:coverage
```

**Stack:** Vitest + jsdom + Testing Library.

**Umbrales mínimos** (`vitest.config.js`):


| Métrica    | Umbral |
| ---------- | ------ |
| Líneas     | 85 %   |
| Statements | 85 %   |
| Ramas      | 70 %   |
| Funciones  | 80 %   |


**Ámbito de cobertura:** servicios, stores, hooks, utilidades de admin, componentes de voz, chat y páginas principales del catálogo y cotizaciones.

**Utilidades de test:** `src/test/setup.js` (matchers de jest-dom) y `src/test/mockFetch.js` (mock de `fetch`).

Mapa de trazabilidad HU → pruebas: `[docs/mapa-de-pruebas.md](../docs/mapa-de-pruebas.md)`.

---



## Documentación adicional

- `[Bolsos-CAP-back/README.md](../Bolsos-CAP-back/README.md)` — API REST, modelos de datos y colección Postman.
- `[Bolsos-CAP-back/features.md](../Bolsos-CAP-back/features.md)` — visión del producto, roadmap y decisiones de arquitectura.
- `[docs/mapa-de-pruebas.md](../docs/mapa-de-pruebas.md)` — historias de usuario, sprints y cobertura de pruebas.

