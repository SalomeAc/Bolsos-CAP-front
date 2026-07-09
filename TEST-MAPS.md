# Mapa de pruebas — Bolsos-CAP

Relación entre historias de usuario (HU), sprints, implementación y pruebas — automáticas y manuales.

**Leyenda de tipos de prueba**


| Código | Tipo                                         |
| ------ | -------------------------------------------- |
| **AU** | Prueba automatizada unitaria                 |
| **AI** | Prueba automatizada de integración           |
| **AM** | Prueba automatizada E2E / manual documentada |
| **M**  | Prueba manual / QA exploratorio              |


**Leyenda de estado**

| Estado | Significado |
| ------ | ----------- |
| OK | Cubierta con prueba automatizada |
| Parcial | Parcialmente cubierta |
| Manual | Solo manual o pendiente de automatizar |
| En desarrollo | Sprint 3, aún en curso |
| n8n | Lógica fuera del repo (workflow n8n) |


---

## Arquitectura: qué vive en el backend vs n8n

Varias HU del Sprint 3 no están como lógica de negocio en el backend: parte del cálculo y la IA corren en workflows de **n8n**. El backend orquesta, persiste y expone APIs.

```text
Cliente (/cotizar)
    → POST createCustomQuotationFromForm (backend)
    → aiQuotationService dispara webhook n8n
    → n8n (Gemini, vector search, criterios de negocio)
        → escribe en Mongo: status=cotizada_ia, aiQuotation.{amount, breakdown, confianza, ...}
        → opcional: POST /api/quotations/webhook/ai-ready (callback JWT)
    → Admin ve propuesta en AdminAiQuotationPanel (frontend)
    → Admin acepta/modifica → setFinalQuotation (backend)
    → Cliente responde en chat → respondQuotation (backend)
    → Admin avanza estado (en_produccion, completada) → updateStatus (backend)
    → Cliente consulta estado en MisCotizacionesPage (frontend, polling)
```


| Capa         | Responsabilidad                                                                                                                 | Archivos clave                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **n8n**      | HU-19, HU-22, HU-23, HU-25: análisis producto, precio sugerido, justificación (`breakdown`), criterios de negocio, coeficientes | Workflow `cotizacion-personalizada` (instancia n8n)                                                                     |
| **Backend**  | Disparar webhook, callback `ai-ready`, persistir `aiQuotation`, `setFinalQuotation`, `updateStatus`, notificaciones             | `aiQuotationService.js`, `quotationController.js`, `notificationService.js`                                             |
| **Frontend** | HU-20, HU-26, HU-27: panel IA, detalles producto + precio; HU-30: cambio estado admin; HU-31: seguimiento cliente               | `AdminAiQuotationPanel`, `QuotationProductCard`, `CotizacionesPage`, `HistorialCotizacionesPage`, `MisCotizacionesPage` |


Nota (HU-30 / HU-31): no hay entidad `Order` separada. Los estados de pedido (`aceptada` → `en_produccion` → `completada`) están en `Quotation.status`.

---

## Sprint 1 — Catálogo, autenticación y cotización base


| HU        | Descripción resumida               | Módulo / ruta                          | Pruebas automatizadas                                                    | Casos clave                                                                  | Estado |
| --------- | ---------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------ |
| **HU-01** | Catálogo de productos              | `GET /api/products`, `CatalogPage`     | `productService.test.js`, `CatalogPage.test.jsx` (filtro, carga)         | Listar productos activos; mensaje si vacío; render nombre/imagen/descripción | Parcial · AU  |
| **HU-02** | Personalizar producto del catálogo | `ProductPage`, variantes               | `productVariantService.test.js` (back), `ProductPage.test.jsx` (cotizar) | Botón personalizar; opciones por producto; asociación a cotización           | Parcial · AU  |
| **HU-03** | Registro con Google                | `authController`, OAuth                | —                                                                        | Botón Google; creación automática de usuario                                 | Manual · M |
| **HU-04** | Login con Google                   | `authController`, `useAuthStore`       | `useAuthStore.test.js`, `authService.test.js`                            | Login existente; redirección post-login                                      | Parcial · AU  |
| **HU-05** | Cuenta administradora              | `requireAdmin`, `isAdmin`              | Cubierto en tests de cotización (admin) y `CatalogPage.test.jsx`         | Rol admin; acceso panel; permisos                                            | Parcial · AI  |
| **HU-06** | CRUD catálogo (admin)              | `productController`, modales admin     | `productService.test.js`, `dimensionsUtils.test.js`                      | Crear/editar/eliminar; validaciones; reflejo en catálogo                     | Parcial · AU  |
| **HU-07** | Eliminar cuenta                    | `userController.deactivate/delete`     | —                                                                        | Eliminación lógica; pedidos activos → cancelado                              | Manual · M |
| **HU-08** | Detalle de producto                | `ProductPage`, `GET /api/products/:id` | `ProductPage.test.jsx` (TTS, imagen Drive, código)                       | Nombre, descripción, materiales, imágenes, disponibilidad                    | OK · AU   |
| **HU-09** | Personalización con opciones       | `ProductPage`, selectores              | `productVariantService.test.js` (back), `ProductPage.test.jsx`           | Talla/color/material; resumen; validación obligatorios                       | Parcial · AU  |
| **HU-10** | Enviar solicitud de cotización     | `quotationController.createQuotation`  | `catalogAutoQuote.test.js`, `quotation.notification.integration.test.js` | Formulario completo; asociación producto; chat                               | OK · AI   |
| **HU-14** | Interfaz intuitiva                 | Navegación global, CSS                 | —                                                                        | Flujo catálogo → personalización → cotización; responsive                    | Manual · M |


---

## Sprint 2 — Cotizaciones, notificaciones, voz y administración


| HU        | Descripción resumida                    | Módulo / ruta                                  | Pruebas automatizadas                                                               | Casos clave                                          | Estado |
| --------- | --------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| **HU-11** | Módulo admin cotizaciones               | `CotizacionesPage`, `GET /api/quotations`      | `quotation.traceability.test.js` (back), `quotationService.test.js` (front)         | Listar solicitudes; estados; detalle                 | OK · AI   |
| **HU-12** | Cotización producto no catálogo         | `CotizarPage`, `createCustomQuotationFromForm` | `customQuotationForm.test.js` (back), `CotizarPage.test.jsx` (front)                | Formulario custom; imagen; validaciones              | OK · AU   |
| **HU-13** | Recibir cotización en plataforma        | `Chat`, `MisCotizacionesPage`                  | `clientResponseNotification.test.js` (back), `Chat.test.jsx` (front)                  | Visualización en chat; historial propio              | Parcial · AU  |
| **HU-15** | Consultar estado cotización             | `MisCotizacionesPage`                          | Cubierto en flujo cotización                                                        | Lista con estados; fecha y precio                    | Parcial · M   |
| **HU-16** | Notificar admin nueva solicitud         | `NotificationService.notifyAdminNewRequest`    | `adminNotification.test.js`                                                         | Evento al crear cotización; datos básicos            | OK · AU   |
| **HU-17** | Historial admin cotizaciones            | `HistorialCotizacionesPage`                    | `HistorialCotizacionesPage.test.jsx`                                                | Todas las cotizaciones; cliente/fecha/estado/precio  | OK · AU   |
| **HU-18** | Filtrar y buscar solicitudes            | Filtros manuales historial                     | `HistorialCotizacionesPage.test.jsx`                                                | Búsqueda por cliente, estado, fecha combinados       | OK · AU   |
| **HU-21** | Notificación info cotización al cliente | `sendQuotationConfirmation`                    | `notificationService.test.js` (back + front)                                        | Email/in-app con producto y datos                    | OK · AU   |
| **HU-24** | Trazabilidad cotización ↔ solicitud     | `quotationController`, `solicitud`             | `quotation.traceability.test.js`                                                    | Asociación bidireccional; `getTraceability`          | OK · AI   |
| **HU-28** | Enviar respuesta final al usuario       | `setFinalQuotation`, notificaciones            | `aiQuotationFlow.test.js`, `clientResponseNotification.test.js`                     | Notificación post-aprobación; enlace a gestionar     | Parcial · AI  |
| **HU-32** | Notificar estado de pedido              | `NotificationService` estados pedido           | `notificationService.test.js` (back + front)                                        | Cambio de estado → notificación cliente              | OK · AU   |
| **HU-34** | Cotización por voz (STT)                | `CotizarPage`, `useAzureDictation`             | `CotizarPage.test.jsx`, `useAzureDictation.test.js`, `customQuotationForm.test.js`  | Dictado observaciones; persistencia en `notes`       | OK · AU   |
| **HU-35** | Lectura cotizaciones (TTS)              | `Chat`, `SpeakButton`                          | `Chat.test.jsx`, `SpeakButton.test.jsx`, `speechService.test.js`                    | `{remitente}: {contenido}`; detener reproducción     | OK · AU   |
| **HU-36** | Lectura detalles producto (TTS)         | `ProductPage`, `SpeakButton`                   | `ProductPage.test.jsx`, `SpeakButton.test.jsx`                                      | Nombre, tipo, material, dimensiones, color, precio   | OK · AU   |
| **HU-37** | Búsqueda productos por voz              | `CatalogPage`, `VoiceButton`                   | `CatalogPage.test.jsx`, `VoiceButton.test.jsx`                                      | Normalización término; filtrado grilla               | OK · AU   |
| **HU-38** | Filtros por voz (admin)                 | `HistorialCotizacionesPage`                    | `HistorialCotizacionesPage.test.jsx`                                                | Estado + término; fonético; AND con filtros manuales | OK · AU   |


### Matriz detallada — Funcionalidades de voz (Sprint 2)


| ID caso | HU    | Escenario               | Entrada                                   | Resultado esperado                    | Automatizada             |
| ------- | ----- | ----------------------- | ----------------------------------------- | ------------------------------------- | ------------------------ |
| V-01    | HU-34 | Concatenar dictado      | observaciones=`"Hola"`, dictado=`"mundo"` | `"Hola mundo"`                        | Sí · `CotizarPage.test.jsx`        |
| V-02    | HU-34 | Dictado en campo vacío  | dictado=`"detalle extra"`                 | `"detalle extra"`                     | Sí · `CotizarPage.test.jsx`        |
| V-03    | HU-34 | Persistir observaciones | POST form con `observaciones`             | `quotation.notes` y `solicitud.notes` | Sí · `customQuotationForm` (back)  |
| V-04    | HU-35 | Texto TTS mensaje       | msg sistema                               | `"Sistema: {content}"`                | Sí · `Chat.test.jsx`               |
| V-05    | HU-35 | Texto TTS oferta        | msg con precio                            | Incluye contenido de oferta           | Parcial (mock en `Chat.test.jsx`)    |
| V-06    | HU-36 | Descripción producto    | producto + selección                      | Texto con todos los campos            | Sí · `ProductPage.test.jsx`        |
| V-07    | HU-36 | Cambio de variante      | cambia color y escucha                    | Audio refleja nuevo color             | Sí · `ProductPage.test.jsx`        |
| V-08    | HU-37 | Normalizar voz          | `"Luna."`                                 | `"Luna"` en búsqueda                  | Sí · `CatalogPage.test.jsx`        |
| V-09    | HU-38 | Comando voz estado      | `"pendiente Ana"`                         | status=`pendiente`, query=`ana`       | Sí · `HistorialCotizacionesPage`   |
| V-10    | HU-38 | Comando revisión        | `"revisión bolso"`                        | status=`en_revision`, query=`bolso`   | Parcial · M (lógica inline, sin test)   |
| V-11    | HU-38 | Fonético                | `"Maria"` vs `"María"`                    | Coincide en filtro                    | Parcial (cubierto vía filtro voz)     |
| V-12    | HU-38 | Filtros combinados      | manual + voz activos                      | Intersección AND                      | Sí · `HistorialCotizacionesPage`   |
| V-13    | HU-38 | Limpiar voz             | clear voice                               | Solo resetea filtros de voz           | Parcial · M                             |


### Matriz detallada — Cotizaciones y notificaciones (Sprint 2)


| ID caso | HU       | Escenario                              | Archivo de prueba                            |
| ------- | -------- | -------------------------------------- | -------------------------------------------- |
| C-01    | HU-10    | Crear cotización catálogo              | `quotation.notification.integration.test.js` |
| C-02    | HU-12    | Crear cotización custom multipart      | `customQuotationForm.test.js`                |
| C-03    | HU-16    | Notificar admins al crear              | `adminNotification.test.js`                  |
| C-04    | HU-21    | Email confirmación catálogo            | `notificationService.test.js`                |
| C-05    | HU-21    | Email confirmación custom              | `notificationService.test.js`                |
| C-06    | HU-24    | Vincular solicitud ↔ cotización        | `quotation.traceability.test.js`             |
| C-07    | HU-24    | Consultar trazabilidad                 | `quotation.traceability.test.js`             |
| C-08    | HU-28    | Aceptar sugerencia IA → finalQuotation | `aiQuotationFlow.test.js`                    |
| C-09    | HU-28    | Notificar cliente cotización enviada   | `clientResponseNotification.test.js`         |
| C-10    | HU-17/18 | Filtrar historial admin                | `HistorialCotizacionesPage.test.jsx`         |
| C-11    | HU-30    | Confirmar cambio de estado admin       | `HistorialCotizacionesPage.test.jsx`         |


### Matriz detallada — Azure Speech (backend)


| ID caso | HU          | Escenario                        | Archivo de prueba            |
| ------- | ----------- | -------------------------------- | ---------------------------- |
| S-01    | HU-34/37/38 | Token speech requiere config     | `azureSpeechService.test.js` |
| S-02    | HU-34/37/38 | Token emitido correctamente      | `azureSpeechService.test.js` |
| S-03    | HU-35/36    | TTS sin texto → 400              | `speechController.test.js`   |
| S-04    | HU-35/36    | Error Azure no configurado → 500 | `speechController.test.js`   |


### Matriz detallada — Azure Speech (frontend cliente)


| ID caso | HU          | Escenario                              | Archivo de prueba            |
| ------- | ----------- | -------------------------------------- | ---------------------------- |
| F-01    | HU-34/37/38 | `recognizeSpeech` resuelve texto       | `speechService.test.js`      |
| F-02    | HU-35/36    | `synthesizeSpeech` rechaza texto vacío   | `speechService.test.js`      |
| F-03    | HU-35/36    | Fallback Web Speech API sin Azure env  | `speechService.test.js`      |
| F-04    | HU-34       | `createDictationSession` inicio/parada | `speechService.test.js`      |
| F-05    | HU-34       | `useAzureDictation` toggle y errores   | `useAzureDictation.test.js`  |
| F-06    | HU-34/37    | `fetchAzureSpeechToken` vía backend    | `speechService.test.js`      |
| F-07    | HU-37       | `VoiceButton` entrega resultado STT    | `VoiceButton.test.jsx`       |
| F-08    | HU-35/36    | `SpeakButton` reproduce y detiene      | `SpeakButton.test.jsx`       |


---

## Sprint 3 — IA, respuesta cliente y seguimiento de pedido


| HU        | Descripción resumida                 | Dónde está implementado                                                                                           | Pruebas automatizadas                            | Casos clave                                                               | Estado impl.  | Estado pruebas |
| --------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- | ------------- | -------------- |
| **HU-19** | LLM sugiere precios                  | **n8n** (Gemini) → Mongo `aiQuotation.amount`; trigger en `aiQuotationService.js`                                 | `aiQuotationFlow.test.js` (`onAiQuotationReady`) | Webhook recibe solicitud; precio no vacío en Mongo                        | OK · n8n      | Parcial · AI + M n8n  |
| **HU-20** | Admin responde con ayuda de IA       | `AdminAiQuotationPanel` + `setFinalQuotation`                                                                     | `aiQuotationFlow.test.js`                        | Ver propuesta; aceptar; modificar monto; enviar al cliente                | OK             | Parcial · AI          |
| **HU-22** | Analizar material/tamaño para precio | **n8n** (mismo workflow; lee `customProduct` de Mongo)                                                            | Mismo que HU-19                                  | Material, dimensiones, descripción → precio sugerido                      | OK · n8n      | Parcial · M n8n       |
| **HU-23** | Explicar cómo se generó el precio    | **n8n** genera `aiQuotation.breakdown`; admin lo ve en `AdminAiQuotationPanel` ("Justificación")                  | Manual                                               | Breakdown visible con parámetros usados                                   | OK · n8n + FE | Manual · M           |
| **HU-25** | Criterios de negocio para el LLM     | **n8n** (reglas del workflow); admin puede editar `breakdown`/criterios al modificar en panel                     | Manual                                               | Criterios aplicados en cotización generada                                | OK · n8n      | Manual · M n8n       |
| **HU-26** | Ver precio IA + detalles producto    | `AdminAiQuotationPanel` (precio, confianza, breakdown) + `QuotationProductCard` + sidebar `CotizacionesPage`      | Manual                                               | Monto IA + datos producto/custom en misma vista                           | OK FE          | Manual · M           |
| **HU-27** | Aceptar/rechazar sugerencia IA       | `AdminAiQuotationPanel` → `setFinalQuotation`                                                                     | `aiQuotationFlow.test.js`                        | Aceptar copia monto a `finalQuotation`; modificar guarda breakdown        | OK             | OK · AU           |
| **HU-29** | Cliente acepta/rechaza cotización    | `ChatQuotationOfferActions`, `respondQuotation`                                                                   | `clientResponseNotification.test.js` (parcial)   | Aceptar/rechazar/proponer; notificar admin                                | OK             | Parcial · AI          |
| **HU-30** | Admin actualiza estado del pedido    | `CotizacionesPage` + `HistorialCotizacionesPage` → `PATCH updateStatus`; notifica con `notifyClientStatusChanged` | `notificationService.test.js` (back + front), `HistorialCotizacionesPage.test.jsx` | `en_produccion`, `completada`, `cancelada`; notificación auto             | OK             | Parcial · AU          |
| **HU-31** | Cliente ve estado de su pedido       | `MisCotizacionesPage` (badge de estado, polling 5 s, chat)                                                        | Manual                                               | Lista cotizaciones; estado actual visible; actualización al cambiar admin | OK FE          | Manual · M           |


### Matriz detallada — IA y n8n (Sprint 3)


| ID caso | HU       | Escenario                               | Dónde probar                                             | Automatizada        |
| ------- | -------- | --------------------------------------- | -------------------------------------------------------- | ------------------- |
| N-01    | HU-19    | Crear cotización custom dispara webhook | Backend logs `[AI_QUOTATION]`; ejecución n8n             | Parcial · backend  |
| N-02    | HU-19/22 | n8n escribe precio en Mongo             | Cotización pasa a `cotizada_ia` con `aiQuotation.amount` | Manual · M (n8n + Mongo)  |
| N-03    | HU-23    | Justificación visible para admin        | Panel IA muestra `aiQuotation.breakdown`                 | Manual · M                |
| N-04    | HU-25    | Criterios de negocio en workflow        | Revisar nodos de prompt/reglas en n8n                    | Manual · M (n8n)          |
| N-05    | HU-25    | Admin edita criterios al modificar      | Modal "Modificar cotización" → textarea criterios        | Manual · M                |
| N-06    | HU-26    | Precio + detalles en vista admin        | Panel IA + `QuotationProductCard` en chat                | Manual · M                |
| N-07    | HU-27    | Aceptar propuesta IA                    | `setFinalQuotation` sin modificar monto                  | Sí · `aiQuotationFlow` |
| N-08    | HU-27    | Modificar y guardar breakdown           | `setFinalQuotation` con `breakdown` en `aiQuotation`     | Sí · `aiQuotationFlow` |
| N-09    | HU-28    | Callback `webhook/ai-ready`             | n8n → backend notifica admin                             | Parcial          |
| N-10    | HU-29    | Cliente acepta en chat                  | Estado → `aceptada`; notifica admin                      | Parcial          |


### Matriz detallada — Estados de pedido (Sprint 3)

Los estados de pedido (`aceptada` → `en_produccion` → `completada`) son estados de `Quotation`, no hay entidad `Order` aparte.


| ID caso | HU    | Escenario                          | Módulo                                 | Automatizada            |
| ------- | ----- | ---------------------------------- | -------------------------------------- | ----------------------- |
| P-01    | HU-30 | Admin cambia a `en_produccion`     | `CotizacionesPage` selector estado     | Manual · M                    |
| P-02    | HU-30 | Admin cambia a `completada`        | `HistorialCotizacionesPage`            | Parcial `HistorialCotizacionesPage.test.jsx` (confirmación modal) |
| P-03    | HU-30 | Notificación automática al cliente | `notifyClientStatusChanged`            | Sí · `notificationService` |
| P-04    | HU-30 | Solicitud sincronizada             | `SolicitudDAO.update` con mismo status | Manual · M                    |
| P-05    | HU-31 | Cliente ve badge de estado         | `MisCotizacionesPage` sidebar          | Manual · M                    |
| P-06    | HU-31 | Estado se actualiza sin recargar   | Polling 5 s en `MisCotizacionesPage`   | Manual · M                    |
| P-07    | HU-31 | Cliente sin cotizaciones           | Mensaje "No tienes cotizaciones"       | Manual · M                    |


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

**Ejecutar tests backend:** `cd Bolsos-CAP-back && npm test`

### Frontend (`Bolsos-CAP-front`)

Stack: **Vitest 2** + **React Testing Library** + **jsdom**. Configuración en `vitest.config.js` (separado de Vite 8 por compatibilidad con Node 18).

Enfoque en tests de voz (HU-34 a HU-38): la lógica va inline en los componentes. Los tests usan RTL con mocks de `VoiceButton`, `SpeakButton`, stores y servicios; no hay módulos `src/utils/*` extraídos.

```text
src/
├── components/
│   ├── Chat/Chat.test.jsx                          → HU-35 (TTS, envío, borrado)
│   ├── SpeakButton/SpeakButton.test.jsx            → HU-35, HU-36
│   ├── VoiceButton/VoiceButton.test.jsx            → HU-37
│   └── ProductAdmin/dimensionsUtils.test.js        → HU-06 (utilidad dimensiones)
├── hooks/
│   └── useAzureDictation.test.js                   → HU-34
├── pages/
│   ├── CatalogPage/CatalogPage.test.jsx            → HU-01, HU-37
│   ├── CotizarPage/CotizarPage.test.jsx            → HU-12, HU-34
│   ├── HistorialCotizacionesPage/
│   │   └── HistorialCotizacionesPage.test.jsx      → HU-17, HU-18, HU-30, HU-38
│   └── ProductPage/ProductPage.test.jsx            → HU-02, HU-08, HU-09, HU-36
├── services/
│   ├── authService.test.js                         → HU-04
│   ├── messageService.test.js                      → HU-13
│   ├── notificationService.test.js                 → HU-21, HU-32
│   ├── productService.test.js                      → HU-01, HU-06
│   ├── productVariantService.test.js               → HU-02, HU-09
│   ├── quotationService.test.js                    → HU-11, HU-12, HU-24
│   └── speechService.test.js                       → HU-34–38 (STT/TTS cliente)
├── store/
│   ├── useAuthStore.test.js                        → HU-04, HU-05
│   └── useProductsStore.test.js                    → HU-01
└── test/
    ├── setup.js                                    → cleanup RTL, mocks globales
    └── mockFetch.js                                → helper respuestas fetch
```

**Ejecutar tests frontend:**

```bash
cd Bolsos-CAP-front && npm test
cd Bolsos-CAP-front && npm run test:coverage
```

**Cobertura (ámbito configurado, ~88% líneas):** servicios, stores, hooks, componentes de voz y páginas HU-34 a HU-38. Umbrales mínimos: líneas/statements **85%**, funciones **80%**, branches **70%**. No incluye modales admin pesados, router ni páginas sin tests (p. ej. `MisCotizacionesPage`, `AdminAiQuotationPanel`).

---

## Pruebas manuales recomendadas (no automatizables sin E2E / n8n)


| Área             | HU                         | Checklist                                                                  |
| ---------------- | -------------------------- | -------------------------------------------------------------------------- |
| OAuth Google     | HU-03, HU-04               | Login/registro real con cuenta Google                                      |
| Micrófono STT    | HU-34, HU-37, HU-38        | Permisos navegador; dictado en Chrome/Edge                                 |
| TTS audio        | HU-35, HU-36               | Reproducción Azure; fallback Web Speech API                                |
| UI/UX            | HU-14                      | Navegación móvil; consistencia visual                                      |
| CRUD admin       | HU-06                      | Subir fotos Cloudinary; eliminar producto                                  |
| **Workflow n8n** | HU-19, HU-22, HU-23, HU-25 | Ejecución completa; Gemini responde; Mongo actualizado; breakdown presente |
| Panel IA admin   | HU-20, HU-26, HU-27        | Propuesta visible; justificación; aceptar/modificar/enviar                 |
| Estados pedido   | HU-30, HU-31               | Admin cambia estado; cliente ve badge actualizado; notificación recibida   |


### Checklist QA — flujo n8n (HU-19 a HU-25)

Pasos para validar a mano el workflow de cotización con IA:

1. Enviar cotización custom desde `/cotizar` con material, dimensiones y foto.
2. Verificar en n8n que el workflow `cotizacion-personalizada` se ejecutó sin error.
3. En Mongo, confirmar `status: cotizada_ia` y `aiQuotation.amount` > 0.
4. Confirmar `aiQuotation.breakdown` con texto explicativo (HU-23).
5. En panel admin, ver precio + justificación + confianza (HU-26).
6. Aceptar o modificar y enviar al cliente (HU-20, HU-27).

---

## Cobertura resumida por sprint


| Sprint    | Total HU | Implementadas | Con prueba AU/AI | Manual / n8n  |
| --------- | -------- | ------------- | ---------------- | ------------- |
| Sprint 1  | 11       | 11            | 6                | 5             |
| Sprint 2  | 17       | 17            | 14               | 3             |
| Sprint 3  | 10       | **10**        | 4                | 6 (incl. n8n) |
| **Total** | **38**   | **38**        | **24**           | **14**        |

Frontend: 18 archivos de test, ~105 casos (Vitest). Backend: ~251 tests (Jest), ~90% cobertura en capa API.


### Sprint 3 — desglose de implementación


| HU    | ¿En repo?                         | ¿En n8n?         |
| ----- | --------------------------------- | ---------------- |
| HU-19 | Trigger + callback backend        | Sí · cálculo precio |
| HU-20 | Sí · `AdminAiQuotationPanel`    | —                |
| HU-22 | Lectura `customProduct` en Mongo  | Sí · análisis       |
| HU-23 | Sí · muestra `breakdown` en FE  | Sí · genera texto   |
| HU-25 | Admin edita criterios en modal  | Sí · reglas LLM     |
| HU-26 | Sí · panel + `QuotationProductCard` | —            |
| HU-27 | Sí · `setFinalQuotation`        | —                |
| HU-29 | Sí · chat + `respondQuotation`  | —                |
| HU-30 | Sí · `updateStatus` + notificaciones | —           |
| HU-31 | Sí · `MisCotizacionesPage`      | —                |


