# Mapa de pruebas — Bolsos-CAP

Documento de trazabilidad entre **Historias de Usuario (HU)**, **sprints**, **implementación** y **pruebas** (automáticas y manuales).

**Leyenda de tipos de prueba**

| Código | Tipo |
|--------|------|
| **AU** | Prueba automatizada unitaria |
| **AI** | Prueba automatizada de integración |
| **AM** | Prueba automatizada E2E / manual documentada |
| **M** | Prueba manual / QA exploratorio |

**Leyenda de estado**

| Estado | Significado |
|--------|-------------|
| ✅ | Cubierta con prueba automatizada |
| ⚠️ | Parcialmente cubierta |
| 🔲 | Solo manual / pendiente automatizar |
| 🚧 | Sprint 3 — en desarrollo |

---

## Sprint 1 — Catálogo, autenticación y cotización base

| HU | Descripción resumida | Módulo / ruta | Pruebas automatizadas | Casos clave | Estado |
|----|----------------------|---------------|----------------------|-------------|--------|
| **HU-01** | Catálogo de productos | `GET /api/products`, `CatalogPage` | 🔲 Sin test dedicado de productos | Listar productos activos; mensaje si vacío; render nombre/imagen/descripción | ⚠️ M |
| **HU-02** | Personalizar producto del catálogo | `ProductPage`, variantes | `productVariantService.test.js` (variantes) | Botón personalizar; opciones por producto; asociación a cotización | ⚠️ AU |
| **HU-03** | Registro con Google | `authController`, OAuth | 🔲 | Botón Google; creación automática de usuario | 🔲 M |
| **HU-04** | Login con Google | `authController`, `useAuthStore` | 🔲 | Login existente; redirección post-login | 🔲 M |
| **HU-05** | Cuenta administradora | `requireAdmin`, `isAdmin` | Cubierto indirectamente en tests de cotización (admin) | Rol admin; acceso panel; permisos | ⚠️ AI |
| **HU-06** | CRUD catálogo (admin) | `productController`, modales admin | 🔲 | Crear/editar/eliminar; validaciones; reflejo en catálogo | 🔲 M |
| **HU-07** | Eliminar cuenta | `userController.deactivate/delete` | 🔲 | Eliminación lógica; pedidos activos → cancelado | 🔲 M |
| **HU-08** | Detalle de producto | `ProductPage`, `GET /api/products/:id` | `productSpeechUtils.test.js` (descripción TTS) | Nombre, descripción, materiales, imágenes, disponibilidad | ⚠️ AU |
| **HU-09** | Personalización con opciones | `ProductPage`, selectores | `productVariantService.test.js` | Talla/color/material; resumen; validación obligatorios | ⚠️ AU |
| **HU-10** | Enviar solicitud de cotización | `quotationController.createQuotation` | `catalogAutoQuote.test.js`, `quotation.notification.integration.test.js` | Formulario completo; asociación producto; chat | ✅ AI |
| **HU-14** | Interfaz intuitiva | Navegación global, CSS | 🔲 | Flujo catálogo → personalización → cotización; responsive | 🔲 M |

---

## Sprint 2 — Cotizaciones, notificaciones, voz y administración

| HU | Descripción resumida | Módulo / ruta | Pruebas automatizadas | Casos clave | Estado |
|----|----------------------|---------------|----------------------|-------------|--------|
| **HU-11** | Módulo admin cotizaciones | `CotizacionesPage`, `GET /api/quotations` | `quotation.traceability.test.js` | Listar solicitudes; estados; detalle | ✅ AI |
| **HU-12** | Cotización producto no catálogo | `CotizarPage`, `createCustomQuotationFromForm` | `customQuotationForm.test.js` | Formulario custom; imagen; validaciones | ✅ AU |
| **HU-13** | Recibir cotización en plataforma | `Chat`, `MisCotizacionesPage` | `clientResponseNotification.test.js` | Visualización en chat; historial propio | ✅ AU |
| **HU-15** | Consultar estado cotización | `MisCotizacionesPage` | Cubierto en flujo cotización | Lista con estados; fecha y precio | ⚠️ M |
| **HU-16** | Notificar admin nueva solicitud | `NotificationService.notifyAdminNewRequest` | `adminNotification.test.js` | Evento al crear cotización; datos básicos | ✅ AU |
| **HU-17** | Historial admin cotizaciones | `HistorialCotizacionesPage` | `quotationFilterUtils.test.js` | Todas las cotizaciones; cliente/fecha/estado/precio | ✅ AU |
| **HU-18** | Filtrar y buscar solicitudes | Filtros manuales historial | `quotationFilterUtils.test.js` | Búsqueda por cliente, estado, fecha combinados | ✅ AU |
| **HU-21** | Notificación info cotización al cliente | `sendQuotationConfirmation` | `notificationService.test.js` | Email/in-app con producto y datos | ✅ AU |
| **HU-24** | Trazabilidad cotización ↔ solicitud | `quotationController`, `solicitud` | `quotation.traceability.test.js` | Asociación bidireccional; `getTraceability` | ✅ AI |
| **HU-28** | Enviar respuesta final al usuario | `setFinalQuotation`, notificaciones | `aiQuotationFlow.test.js`, `clientResponseNotification.test.js` | Notificación post-aprobación; enlace a gestionar | ⚠️ AI |
| **HU-32** | Notificar estado de pedido | `NotificationService` estados pedido | `notificationService.test.js` (estados) | Cambio de estado → notificación cliente | ✅ AU |
| **HU-34** | Cotización por voz (STT) | `CotizarPage`, `useAzureDictation` | `cotizarSpeechUtils.test.js`, `customQuotationForm.test.js` | Dictado observaciones; persistencia en `notes` | ✅ AU |
| **HU-35** | Lectura cotizaciones (TTS) | `Chat`, `SpeakButton` | `chatSpeechUtils.test.js` | `{remitente}: {contenido}`; detener reproducción | ✅ AU |
| **HU-36** | Lectura detalles producto (TTS) | `ProductPage`, `SpeakButton` | `productSpeechUtils.test.js` | Nombre, tipo, material, dimensiones, color, precio | ✅ AU |
| **HU-37** | Búsqueda productos por voz | `CatalogPage`, `VoiceButton` | `catalogVoiceUtils.test.js` | Normalización término; filtrado grilla | ✅ AU |
| **HU-38** | Filtros por voz (admin) | `HistorialCotizacionesPage` | `phoneticUtils.test.js`, `voiceFilterUtils.test.js`, `quotationFilterUtils.test.js` | Estado + término; fonético; AND con filtros manuales | ✅ AU |

### Matriz detallada — Funcionalidades de voz (Sprint 2)

| ID caso | HU | Escenario | Entrada | Resultado esperado | Automatizada |
|---------|-----|-----------|---------|-------------------|--------------|
| V-01 | HU-34 | Concatenar dictado | observaciones=`"Hola"`, dictado=`"mundo"` | `"Hola mundo"` | ✅ `cotizarSpeechUtils` |
| V-02 | HU-34 | Dictado en campo vacío | dictado=`"detalle extra"` | `"detalle extra"` | ✅ |
| V-03 | HU-34 | Persistir observaciones | POST form con `observaciones` | `quotation.notes` y `solicitud.notes` | ✅ `customQuotationForm` |
| V-04 | HU-35 | Texto TTS mensaje | msg sistema | `"Sistema: {content}"` | ✅ `chatSpeechUtils` |
| V-05 | HU-35 | Texto TTS oferta | msg con precio | Incluye contenido de oferta | ✅ |
| V-06 | HU-36 | Descripción producto | producto + selección | Texto con todos los campos | ✅ `productSpeechUtils` |
| V-07 | HU-36 | Cambio de variante | cambia color y escucha | Audio refleja nuevo color | ✅ |
| V-08 | HU-37 | Normalizar voz | `"lana."` | `"lana"` en búsqueda | ✅ `catalogVoiceUtils` |
| V-09 | HU-38 | Comando voz estado | `"pendiente María"` | status=`pendiente`, query=`María` | ✅ `voiceFilterUtils` |
| V-10 | HU-38 | Comando revisión | `"revisión bolso"` | status=`en_revision`, query=`bolso` | ✅ |
| V-11 | HU-38 | Fonético | `"Maria"` vs `"María"` | Coincide en filtro | ✅ `phoneticUtils` |
| V-12 | HU-38 | Filtros combinados | manual + voz activos | Intersección AND | ✅ `quotationFilterUtils` |
| V-13 | HU-38 | Limpiar voz | clear voice | Solo resetea filtros de voz | ⚠️ M |

### Matriz detallada — Cotizaciones y notificaciones (Sprint 2)

| ID caso | HU | Escenario | Archivo de prueba |
|---------|-----|-----------|-------------------|
| C-01 | HU-10 | Crear cotización catálogo | `quotation.notification.integration.test.js` |
| C-02 | HU-12 | Crear cotización custom multipart | `customQuotationForm.test.js` |
| C-03 | HU-16 | Notificar admins al crear | `adminNotification.test.js` |
| C-04 | HU-21 | Email confirmación catálogo | `notificationService.test.js` |
| C-05 | HU-21 | Email confirmación custom | `notificationService.test.js` |
| C-06 | HU-24 | Vincular solicitud ↔ cotización | `quotation.traceability.test.js` |
| C-07 | HU-24 | Consultar trazabilidad | `quotation.traceability.test.js` |
| C-08 | HU-28 | Aceptar sugerencia IA → finalQuotation | `aiQuotationFlow.test.js` |
| C-09 | HU-28 | Notificar cliente cotización enviada | `clientResponseNotification.test.js` |
| C-10 | HU-17/18 | Filtrar historial admin | `quotationFilterUtils.test.js` |

### Matriz detallada — Azure Speech (backend)

| ID caso | HU | Escenario | Archivo de prueba |
|---------|-----|-----------|-------------------|
| S-01 | HU-34/37/38 | Token speech requiere config | `azureSpeechService.test.js` |
| S-02 | HU-34/37/38 | Token emitido correctamente | `azureSpeechService.test.js` |
| S-03 | HU-35/36 | TTS sin texto → 400 | `speechController.test.js` |
| S-04 | HU-35/36 | Error Azure no configurado → 500 | `speechController.test.js` |

---

## Sprint 3 — IA, respuesta cliente y pedidos

| HU | Descripción resumida | Módulo / ruta | Pruebas automatizadas | Casos clave | Estado |
|----|----------------------|---------------|----------------------|-------------|--------|
| **HU-19** | LLM sugiere precios | Integración n8n/Gemini | `aiQuotationFlow.test.js` (parcial) | Recibe parámetros; sugiere precio no vacío | ⚠️ AI |
| **HU-20** | Admin responde con IA | `AdminAiQuotationPanel` | `aiQuotationFlow.test.js` | Ver sugerencia; aceptar/modificar/rechazar | ⚠️ AI |
| **HU-22** | Analizar características producto | Workflow IA | `aiQuotationFlow.test.js` | Material, tamaño → precio sugerido | ⚠️ AI |
| **HU-23** | Explicar precio sugerido | Panel IA | 🔲 | Explicación con parámetros usados | 🚧 |
| **HU-25** | Criterios negocio para LLM | Config admin IA | 🔲 | Criterios aplicados en cotización | 🚧 |
| **HU-26** | Ver precio IA + detalles | `AdminAiQuotationPanel` | 🔲 | Vista combinada producto + precio | 🚧 M |
| **HU-27** | Aceptar/rechazar sugerencia IA | `setFinalQuotation` | `aiQuotationFlow.test.js` | Persistencia decisión admin | ✅ AU |
| **HU-29** | Cliente acepta/rechaza cotización | `respondQuotation`, `ChatQuotationOfferActions` | `clientResponseNotification.test.js` (parcial) | Aceptar/rechazar; motivo; notificar admin | ⚠️ AI |
| **HU-30** | Admin actualiza estado pedido | Módulo pedidos | 🔲 | Transiciones válidas; notificación auto | 🚧 |
| **HU-31** | Cliente ve estado pedido | Vista seguimiento | 🔲 | Lista pedidos; progreso visual | 🚧 |

---

## Inventario de archivos de prueba

### Backend (`Bolsos-CAP-back`)

```text
tests/
├── controllers/
│   ├── aiQuotationFlow.test.js          → HU-19, HU-20, HU-27, HU-28
│   ├── catalogAutoQuote.test.js         → HU-10, HU-02
│   ├── customQuotationForm.test.js        → HU-12, HU-34
│   └── speechController.test.js         → HU-34–38 (infra speech)
├── integration/
│   ├── quotation.notification.integration.test.js → HU-10, HU-12, HU-21
│   └── quotation.traceability.test.js   → HU-11, HU-24
└── services/
    ├── adminNotification.test.js        → HU-16
    ├── azureSpeechService.test.js       → HU-34–38 (token)
    ├── clientResponseNotification.test.js → HU-13, HU-28, HU-29
    ├── notificationService.test.js      → HU-21, HU-32
    └── productVariantService.test.js    → HU-02, HU-09
```

**Ejecutar:** `cd Bolsos-CAP-back && npm test`

### Frontend (`Bolsos-CAP-front`)

```text
src/utils/
├── catalogVoiceUtils.js       → HU-37
├── chatSpeechUtils.js         → HU-35
├── cotizarSpeechUtils.js      → HU-34
├── phoneticUtils.js           → HU-38
├── productSpeechUtils.js      → HU-36
├── quotationFilterUtils.js    → HU-17, HU-18, HU-38
└── voiceFilterUtils.js        → HU-38

src/utils/__tests__/
├── catalogVoiceUtils.test.js
├── chatSpeechUtils.test.js
├── cotizarSpeechUtils.test.js
├── phoneticUtils.test.js
├── productSpeechUtils.test.js
├── quotationFilterUtils.test.js
└── voiceFilterUtils.test.js
```

**Ejecutar:** `cd Bolsos-CAP-front && npm test`

---

## Pruebas manuales recomendadas (no automatizables sin E2E)

| Área | HU | Checklist |
|------|-----|-----------|
| OAuth Google | HU-03, HU-04 | Login/registro real con cuenta Google |
| Micrófono STT | HU-34, HU-37, HU-38 | Permisos navegador; dictado en Chrome/Edge |
| TTS audio | HU-35, HU-36 | Reproducción Azure; fallback Web Speech API |
| UI/UX | HU-14 | Navegación móvil; consistencia visual |
| CRUD admin | HU-06 | Subir fotos Cloudinary; eliminar producto |
| Pedidos | HU-30, HU-31 | Flujo completo post-aceptación |

---

## Cobertura resumida por sprint

| Sprint | Total HU | Con prueba AU/AI | Solo manual / pendiente |
|--------|----------|------------------|-------------------------|
| Sprint 1 | 11 | 3 | 8 |
| Sprint 2 | 17 | 14 | 3 |
| Sprint 3 | 10 | 3 | 7 |
| **Total** | **38** | **20** | **18** |

*Última actualización: julio 2026*
