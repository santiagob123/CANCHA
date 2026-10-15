# Cancha

MVP inicial para consultar fútbol con Next.js App Router, TypeScript estricto y Tailwind CSS. La aplicación no incluye datos deportivos ficticios: sin una clave de API-Football informa que falta la configuración.

## Requisitos

- Node.js 20.9 o posterior.
- Una cuenta de API-Football (opcional para ejecutar la interfaz; necesaria para obtener partidos).

## Inicio local

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Si el compilador nativo de Next.js falla en un entorno Windows restringido, activa el respaldo WebAssembly antes de iniciar: `$env:CANCHA_USE_WASM='1'` en PowerShell (o `set CANCHA_USE_WASM=1` en `cmd.exe`). En un entorno normal no hace falta esa variable.

Para detener el servidor de desarrollo, usa `Ctrl+C` en la misma terminal donde ejecutaste `npm run dev`.

## Estado del MVP

Implementado:

- Identidad visual inicial, navegación responsive, metadatos base y pie de página.
- Inicio conectado al servicio de fixtures del día. Sin clave, muestra claramente la configuración pendiente.
- Resultados por fecha con navegación al día anterior y siguiente, grupos por competición y estados de error y vacío.
- Endpoint interno `GET /api/fixtures?date=YYYY-MM-DD`, con fecha validada en servidor.
- Adaptador API-Football en servidor, tipos normalizados, caché de 60 segundos y normalización de estados del partido.
- Catálogo `/ligas` consultando competiciones actuales de API-Football, con búsqueda local sobre la respuesta cacheada y estados separados para clave ausente, cuota y error.
- Detalle `/ligas/[id]` con temporadas declaradas por el proveedor, clasificación solo cuando `coverage.standings` está habilitada, partidos recientes/próximos y participantes.
- Caché en servidor por recurso: catálogo 6 h, metadatos y equipos 24 h, clasificación y partidos de liga 1 h. La clave permanece en el servidor.
- Rutas de transición para `/equipos`, `/jugadores`, `/noticias` y `/buscar`; explican qué falta sin mostrar contenido inventado.
- `.env.example`, exclusión de secretos y guía de instalación y despliegue.

Pendiente: catálogos y páginas de detalle de equipos y jugadores; CMS Sanity; páginas de artículos y partidos; pruebas automatizadas; y despliegue en Vercel. No hay actualización automática de marcadores en vivo.

Comprobaciones realizadas el 15 de octubre de 2026: `npm run typecheck` y `npm run lint` pasan. No se pudo completar `npm run build`: el entorno aislado devolvió `EPERM` al crear directorios internos de `.next`, incluso con SWC WebAssembly. Un intento de `npm run dev` terminó en error interno de Next (`Cannot read properties of undefined (reading 'endsWith')`) antes de atender rutas; no quedó ningún servidor activo. No hay clave API configurada, por lo que las respuestas del proveedor no se pudieron validar contra datos en vivo. La auditoría npm no se completó en este turno.

Abre http://localhost:3000. Para activar datos, crea una cuenta en [API-Football](https://www.api-football.com/) y copia la clave del panel en `API_FOOTBALL_KEY` dentro de `.env.local`. Nunca uses el prefijo `NEXT_PUBLIC_` para esta clave. `APP_TIME_ZONE` define la fecha de consulta predeterminada; por defecto es `America/Bogota`.

## Datos deportivos y cuota

El adaptador de servidor en `src/lib/football/api-football.ts` consulta fixtures, ligas, standings y equipos con la cabecera `x-apisports-key`. `provider.ts` separa la API del modelo normalizado y `service.ts` trata errores sin convertirlos en listas vacías. Las temporadas y la cobertura de standings proceden de los metadatos devueltos por API-Football; la aplicación no supone que el año calendario actual sea una temporada válida.

Fixtures por fecha se revalidan cada 60 segundos; el endpoint interno `GET /api/fixtures?date=YYYY-MM-DD` también permite stale-while-revalidate durante cinco minutos. Catálogo de ligas: 6 horas; detalle de liga/equipos: 24 horas; standings y fixtures de temporada: 1 hora. El proveedor informa que el plan gratuito incluye 100 solicitudes al día y 10 por minuto; revisa [precios y límites vigentes](https://www.api-football.com/pricing/) y el consumo en su panel antes de habilitar sondeos frecuentes. La caché reduce duplicados, pero el plan gratuito no promete capacidad para cualquier volumen de usuarios. No hay actualización automática en vivo en esta fase.

El endpoint valida la fecha en el servidor. No registra la clave ni devuelve errores internos del proveedor. Para investigar cuota, revisa el panel de API-Football y los errores sanitizados del servidor.

## CMS

La interfaz editorial está preparada como estado vacío, sin publicar contenido de muestra. Sanity no está configurado todavía. La siguiente fase puede crear un proyecto, definir el esquema de artículo y configurar un token de lectura en variables privadas; no se necesita para ejecutar el MVP actual.

## Comandos

```bash
npm run dev       # desarrollo
npm run typecheck # TypeScript
npm run build     # compilación de producción
npm run start     # servidor de producción
```

## Despliegue en Vercel

Importa el repositorio en Vercel, conserva los comandos de Next.js por defecto y define `API_FOOTBALL_KEY` y opcionalmente `APP_TIME_ZONE` en las variables de entorno del proyecto. Despliega y valida `/`, `/resultados` y `/api/fixtures?date=YYYY-MM-DD`. No se ha realizado un despliegue desde este entorno.

## Estructura actual

- `src/app`: inicio, resultados y Route Handler de fixtures.
- `src/components`: cabecera y tarjeta de partido.
- `src/lib/football`: interfaz de proveedor, adaptador, tipos y servicio.
- `public`: reservado para recursos propios.

## Siguientes pasos

1. Configurar una clave válida en `.env.local` y confirmar cuota disponible; volver a validar `/ligas` y un detalle real.
2. Ejecutar `npm run build` en un entorno Windows sin restricciones y revisar las rutas generadas.
3. Añadir catálogos y detalles de equipos/jugadores, con pruebas de normalización y validación.
4. Configurar Sanity y contenido editorial real.
5. Evaluar persistencia compartida y sincronización solo cuando el tráfico lo requiera.
