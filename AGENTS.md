# Guía para agentes

## Contexto del proyecto

- Es una API NestJS escrita en TypeScript con arquitectura modular.
- `src/app.module.ts` configura `ConfigModule`, TypeORM y los módulos de funcionalidad.
- Cada funcionalidad debe vivir en su propio módulo dentro de `src/` y mantener juntas sus entidades, DTOs, controladores, servicios y pruebas.
- Usa `README.md` y `package.json` como referencias para la descripción general y los comandos disponibles.
- Gestiona la configuración de entorno exclusivamente mediante Nest `ConfigModule` y `ConfigService`; no uses `dotenv` ni leas `process.env` directamente.

## Reglas de implementación

- Respeta los límites de los módulos: registra proveedores, controladores, repositorios y exportaciones en el módulo propietario; evita dependencias circulares y lógica de negocio en `AppModule`.
- Mantén los controladores delgados: reciben parámetros y DTOs, delegan al servicio y no acceden directamente al repositorio.
- Coloca la lógica de negocio y el acceso a TypeORM en servicios de dominio.
- Usa DTOs para las entradas y salidas de la API. No uses entidades como contrato de entrada si un DTO expresa mejor la operación.
- Evita `any`, casts innecesarios y tipos implícitos en APIs públicas. Declara tipos de retorno explícitos en métodos nuevos o modificados y usa tipos que reflejen el comportamiento real.
- Mantén el código simple y legible: nombres descriptivos, funciones pequeñas y cambios localizados. No introduzcas abstracciones sin una necesidad concreta.
- Usa las excepciones HTTP de NestJS apropiadas (`NotFoundException`, `ConflictException`, etc.) y conserva mensajes consistentes.
- Añade logs con `Logger` de NestJS para operaciones relevantes, éxitos y errores de negocio. Registra advertencias antes de lanzar excepciones esperadas, pero nunca secretos, credenciales ni datos sensibles.
- Al trabajar con PostgreSQL y TypeORM, verifica los tipos reales devueltos por el driver; los identificadores `bigint` se manejan como `string` y los campos `numeric` requieren especial cuidado.
- No habilites `synchronize: true` para producción. Trata la configuración de entorno como potencialmente ausente y valida conversiones de tipos.
- Si agregas validación o transformación de DTOs, configura explícitamente el `ValidationPipe` y los decoradores necesarios; no asumas que los tipos de TypeScript validan datos en tiempo de ejecución.

## Pruebas y validación

- Añade o actualiza pruebas junto con los cambios de comportamiento.
- En pruebas unitarias de NestJS, registra todos los tokens inyectados por el sujeto bajo prueba, incluido `getRepositoryToken(Entity)` y los servicios usados por los controladores.
- No ejecutes comandos que no hayan sido solicitados explícitamente o que no sean necesarios para resolver el problema principal.
- Los problemas de lint no son urgentes: prioriza la corrección del código relacionado directamente con el problema principal y atiende el lint solo si se solicita o si bloquea esa corrección.
- Ejecuta pruebas o comandos de validación únicamente cuando se soliciten o cuando sean necesarios para confirmar la solución del problema principal.
- No ocultes fallos de TypeScript o ESLint con `any`, `@ts-ignore` o cambios globales de configuración.

## Comandos principales

- Instalar dependencias: `npm install`
- Desarrollo: `npm run start:dev`
- Compilar: `npm run build`
- Lint: `npm run lint`
- Pruebas unitarias: `npm test`
- Pruebas e2e: `npm run test:e2e`
- Cobertura: `npm run test:cov`

## Archivos de referencia

- Módulo raíz: [src/app.module.ts](src/app.module.ts)
- Módulo de funcionalidad: [src/product/product.module.ts](src/product/product.module.ts)
- Patrón de servicio, repositorio y logging: [src/product/product.service.ts](src/product/product.service.ts)
- Patrón de controlador y DTOs: [src/product/product.controller.ts](src/product/product.controller.ts)
- Configuración de base de datos: [src/config/database.config.ts](src/config/database.config.ts)
- Pruebas: `src/**/*.spec.ts` y `test/**/*.ts`
