# Cancha — estado del MVP

**Actualizado:** 15 de octubre de 2026  
**Estado:** catálogo y detalle de competiciones conectados en código; sin clave API configurada; servidor detenido.

## Hecho

- Proyecto Next.js 15.5.28, App Router, React 19, TypeScript estricto, Tailwind, ESLint y Zod.
- Inicio y resultados por fecha consumen fixtures reales mediante el adaptador de API-Football. Sin clave, la interfaz indica la configuración pendiente.
- `GET /api/fixtures?date=YYYY-MM-DD` valida fecha en el servidor.
- `/ligas` consulta el catálogo de competiciones actuales, permite buscar por competición, país o tipo y conserva resultados vacíos diferenciados de errores.
- `/ligas/[id]` presenta metadatos, selector de temporadas declaradas por API-Football, standings cuando el proveedor indica cobertura, fixtures recientes/próximos y equipos participantes.
- Las solicitudes usan caché de servidor: fixtures por fecha 60 s, catálogo 6 h, detalle y equipos 24 h, standings y partidos de temporada 1 h.
- `.env.example` contiene un valor marcador; la clave real debe estar únicamente en `.env.local` y no usar `NEXT_PUBLIC_`.
- Bóveda Obsidian de este proyecto: carpeta `CANCHA/`.

## Verificación

- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- `npm run build`: no verificado; Next falló con `EPERM` al crear carpetas de `.next`, también con SWC WebAssembly.
- `npm run dev`: el intento terminó antes de atender rutas con `Cannot read properties of undefined (reading 'endsWith')`; no hay proceso de desarrollo activo.
- No se verificó con datos reales porque no hay `API_FOOTBALL_KEY` configurada.
- No se completó `npm audit` en este turno.

## Pendiente / siguiente

1. Añadir una clave API-Football válida a `.env.local` en la máquina local y consultar `/ligas`.
2. Abrir una competición que la API devuelva y revisar cobertura, temporada, clasificación, partidos y equipos.
3. Ejecutar `npm run dev` y `npm run build` fuera del aislamiento restringido; documentar cualquier error reproducible.
4. Implementar catálogos/detalles de equipos y jugadores.
5. Configurar Sanity y contenido editorial real; crear pruebas automatizadas; después preparar despliegue.

## Archivos del proyecto

- Código: `outputs/cancha/`
- Guía: `README.md`
- Variables: `.env.example` (plantilla sin clave válida)

No hay clave deportiva válida en esta entrega, ni se publicaron datos inventados.
