
# Documento Word: "Cómo se creó Verdex" (para jurado universitario)

Voy a generar un archivo `.docx` completo y profesional en `/mnt/documents/Verdex_Documentacion_Proyecto.docx` que puedas entregar y leer frente al jurado.

## Contenido del documento (estructura por capítulos)

**1. Portada e índice**
- Título, subtítulo "Proyecto universitario", fecha, autor.

**2. Resumen ejecutivo**
- Qué es Verdex, problema que resuelve, público objetivo.

**3. Concepto e idea original**
- De dónde partió la app (identificador simple de plantas).
- Evolución hacia un sistema completo de gestión de jardín.

**4. Decisiones de diseño (UX/UI)**
- Por qué estilo "Naturaleza oscura".
- Paleta OKLCH (emerald / neon mint), glassmorphism, gradientes (`--gradient-moss`, `--gradient-canopy`).
- Tipografía, jerarquía visual, navegación por 5 tabs flotantes.
- Qué se descartó y por qué (temas claros, navegación lateral, etc.).

**5. Arquitectura técnica**
- Stack: React 19 + TanStack Start + Vite 7 + Tailwind v4.
- Por qué TanStack Start (SSR + server functions tipadas) en vez de Next.js o CRA.
- Estructura de carpetas (`routes/_authenticated/`, `lib/*.functions.ts`, `integrations/supabase/`).
- Diagrama ASCII del flujo cliente ↔ server function ↔ Supabase ↔ Lovable AI.

**6. Backend y base de datos (Lovable Cloud / Supabase)**
- Tablas: `profiles`, `plants` (con esquema completo de columnas y tipos).
- Trigger de auto-creación de perfil al registrarse.
- Row Level Security: políticas exactas aplicadas.
- Storage bucket `plants` para imágenes.
- Por qué RLS y no validación solo en frontend.

**7. Autenticación**
- Email/contraseña + Google OAuth.
- Layout gate `_authenticated.tsx` y redirección a `/login`.
- Middleware `requireSupabaseAuth` y `attachSupabaseAuth`.

**8. Funcionalidades — cómo se implementó cada una**
- **Identificación de plantas** (`plant.functions.ts`): foto → base64 → Gemini 2.5 Flash con tool calling → JSON estructurado (nombre, familia, cuidados).
- **Diagnóstico de salud** (`diagnose.functions.ts`): prompt de fitopatólogo, estados (saludable/alerta/enferma), severidad y tratamiento.
- **Mi Jardín / CRUD** (`garden.functions.ts`): listar, guardar, regar, eliminar.
- **Recordatorios de riego**: cálculo `next_water_at = now + water_every_days`.
- **Geolocalización**: `navigator.geolocation` + visualización en OpenStreetMap.
- **Mini enciclopedia**: 12 especies hardcodeadas con búsqueda.
- **Onboarding + Auth + Tabs**: flujo del usuario nuevo.

**9. Inteligencia Artificial**
- Por qué Lovable AI Gateway (sin manejar API keys del usuario).
- Modelo elegido: `google/gemini-2.5-flash` (balance costo/calidad multimodal).
- Patrón de **tool calling** para forzar JSON válido en español.
- Manejo de errores 429 (rate limit) y 402 (sin créditos).

**10. Seguridad**
- RLS por usuario (`auth.uid() = user_id`).
- Validación con Zod en cada server function.
- Secretos solo en servidor (`process.env.LOVABLE_API_KEY`).
- Por qué NUNCA llamar a la IA desde el cliente.

**11. Proceso de desarrollo en Lovable**
- Iteraciones: prototipo simple → rediseño "Naturaleza oscura" → features universitarias.
- Uso del agente IA de Lovable para generar código, migraciones SQL y assets.
- Hero generado con IA (`hero-jungle.jpg`).

**12. Lo que se consideró y descartó**
- Mapas con Mapbox (descartado por necesitar API key → se eligió OpenStreetMap embebido).
- Notificaciones push reales (descartadas por complejidad PWA → se muestran in-app).
- Almacenamiento local sin auth (descartado por necesidad de multi-dispositivo).

**13. Despliegue**
- PWA-ready, URL pública vía Lovable.
- Cómo otros pueden acceder desde el celular.

**14. Conclusiones y trabajo futuro**
- Logros, limitaciones, próximas features (notificaciones push, comunidad, IA offline).

**15. Anexos**
- Glosario técnico (RLS, OAuth, SSR, tool calling, OKLCH, etc.) explicado para no-técnicos.
- Lista completa de archivos del proyecto.

## Detalles técnicos de generación

- Usaré el script `docx-js` (Node) con tipografía Calibri, títulos en color emerald `#2C5F2D`, párrafos justificados, listas con viñetas nativas y tablas para esquemas de BD.
- Página US Letter, márgenes de 1", encabezado "Verdex — Documentación de Proyecto" y numeración de página en el pie.
- QA visual: renderizaré cada página a JPG y la revisaré antes de entregar.
- Entrega final con `<presentation-artifact>` para que puedas descargarlo.

Al aprobar, paso a build y genero el archivo. ¿Quieres que incluya tu nombre y el de tu universidad/curso en la portada? Si no me lo dices, lo dejo con un placeholder editable.
