# Project Architecture

## Architectural Style

This backend uses NestJS with CQRS, Clean Architecture, DDD, and separated microservice apps.

The initial apps are:

- `api-gateway`
- `auth-ms`
- `users-ms`
- `clients-ms`
- `packages-ms`
- `package-status-ms`
- `audit-ms`

Each app follows this base structure directly under `src`:

```txt
application/
domain/
infrastructure/
```

## Apps

Apps live under `apps/<app-name>/src`. Each app owns its module, domain model, use cases, infrastructure, and provider registration.

No app may import another app's use cases, infrastructure, application layer, controllers, or handlers. Shared cross-cutting code, transport clients, and communication contracts belong in `libs/shared`.

Configured TypeScript aliases:

```txt
app/shared     -> libs/shared/src
@shared        -> libs/shared/src
```

Use aliases to keep imports readable, but do not use them to bypass cross-context dependency rules.

## Shared Module

The `SharedModule` is a global module responsible for common project-level imports and providers.

`SharedModule` centralizes:

- `ConfigModule.forRoot`
- Joi validation schema
- `CqrsModule`
- `DatabaseModule`
- common shared providers

Each app module imports `SharedModule`. MongoDB is configured from the shared library because the project uses MongoDB/Mongoose.

## Environment Variables

The project uses `@nestjs/config` and `Joi` to validate environment variables at application startup.

The configuration lives in:

`libs/shared/src/application/config`

The `SharedModule` is responsible for loading and validating the global configuration.

Current validated variables:

- `NODE_ENV`
- `PORT`
- `APP_NAME`
- `API_PREFIX`
- `LOG_LEVEL`
- `DEFAULT_TIMEOUT_MS`
- `MONGO_URI`
- `REDIS_URL`
- `GRPC_AUTH_URL`
- `GRPC_USERS_URL`
- `GRPC_CLIENTS_URL`
- `GRPC_PACKAGES_URL`
- `GRPC_PACKAGE_STATUS_URL`

Runtime usage:

- `PORT` is used by `src/main.ts` to choose the HTTP listen port.
- `API_PREFIX` is used by `src/main.ts` as the global API prefix.
- `LOG_LEVEL` is used by `src/main.ts` to configure Nest logger levels.
- `APP_NAME` and `NODE_ENV` are used by `src/main.ts` in the startup log.
- `DEFAULT_TIMEOUT_MS` is used by the global timeout interceptor when a handler does not define a custom timeout.

Global shared infrastructure providers:

- `AppLogger` is registered from `SharedModule` and used by `src/main.ts` as the Nest application logger.
- `ExceptionFilter` is registered globally through `APP_FILTER`.
- `LoggerInterceptor` is registered globally through `APP_INTERCEPTOR`.
- `TimeoutInterceptor` is registered globally through `APP_INTERCEPTOR`.

The validated defaults are:

```txt
NODE_ENV=development
PORT=3000
APP_NAME=enviexpress-backend
API_PREFIX=api
LOG_LEVEL=log
DEFAULT_TIMEOUT_MS=30000
MONGO_URI=mongodb://localhost:27017/enviexpress
REDIS_URL=redis://localhost:6379
GRPC_AUTH_URL=0.0.0.0:50051
GRPC_USERS_URL=0.0.0.0:50052
GRPC_CLIENTS_URL=0.0.0.0:50053
GRPC_PACKAGES_URL=0.0.0.0:50054
GRPC_PACKAGE_STATUS_URL=0.0.0.0:50055
```

Environment validation must stay centralized in `shared`; feature apps must not import `ConfigModule` directly or duplicate environment schemas.

## Folder Structure

```txt
src/
  <app>.module.ts
  main.ts
  application/
  domain/
  infrastructure/
```

Each app uses:

```txt
src/
  application/
    <app>.module.ts
    providers/
    config/
  domain/
    models/
    use-cases/
  infrastructure/
    driven-adapters/
    ui/
    dtos/
```

## Layer Responsibilities

The `application` layer integrates and registers dependencies. The `domain` layer contains the business core. The `infrastructure` layer contains technical implementations, adapters, controllers, handlers, and DTOs.

## Application Layer

The application layer declares the contextual NestJS module and registers controllers, use cases, gateways, CQRS handlers, driven adapters, and context configuration.

It may depend on `domain`, `infrastructure`, NestJS, and shared modules. No other layer should depend on `application`.

## Domain Layer

The domain layer contains the business core. It must remain independent from infrastructure, application, controllers, handlers, and concrete adapters.

NestJS dependencies are generally not allowed in domain code, with one explicit exception: domain models and use cases may use NestJS HTTP error classes for error handling, such as `HttpException`, `BadRequestException`, `NotFoundException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`, and `InternalServerErrorException`.

CQRS is a project-level architectural decision. Domain CQRS contracts may use `type`-only imports from `@nestjs/cqrs`, such as `Command`, `Query`, `IEvent`, `CommandResult`, or `QueryResult`, when those types preserve compile-time inference for command/query results or define cross-context CQRS contracts. These imports must remain type-only and must not introduce runtime NestJS framework usage in domain code.

Do not use NestJS decorators, modules, providers, dependency injection, `ConfigService`, buses, controllers, handlers, interceptors, filters, pipes, or concrete adapters from the domain layer.

## Domain Models

`domain/models` contains the extended domain model:

- entities
- value objects
- cqrs
- gateways

Domain models should be as pure as possible.

Domain models may throw NestJS HTTP errors when validation fails or when a domain invariant cannot be satisfied. They must not use other NestJS framework features.

## Domain CQRS inside Models

CQRS messages live inside `domain/models/cqrs`:

```txt
commands/
queries/
events/
```

Command = requests an action to be executed.
Query = requests information to be read.
Event = reports that something already happened.

## Commands

Commands live in `domain/models/cqrs/commands`. They are simple objects, contain no business logic, and are named as imperative actions such as `CreateUserCommand`. They may extend or use CQRS base types when needed for typed result inference, but only as part of the CQRS contract.

## Queries

Queries live in `domain/models/cqrs/queries`. They are simple objects, contain no business logic, and are named as information requests such as `GetUserByIdQuery`. They may extend or use CQRS base types when needed for typed result inference, but only as part of the CQRS contract.

## Events

Events live in `domain/models/cqrs/events`. They represent facts that already happened, are immutable simple objects, contain only necessary data, and are named in the past such as `UserCreatedDomainEvent`.

## Domain Gateways inside Models

Gateway interfaces live in `domain/models/gateways`. Gateways are contracts only and must not contain concrete implementations.

Use constants or symbols for injection tokens instead of loose strings when tokens are needed.

## Domain Use Cases

Use cases live in `domain/use-cases`. They contain business logic and may depend on domain models, value objects, commands, queries, events, and gateway interfaces.

Use cases must not import controllers, handlers, concrete adapters, application, infrastructure, or use cases from another context.

Use cases may use NestJS HTTP errors for error handling only. They must not use other NestJS framework features.

## Error Handling

The project allows NestJS HTTP error classes for application and domain error handling.

Allowed examples:

```ts
throw new BadRequestException('Invalid email');
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
```

These exceptions are limited to error classes from `@nestjs/common` and type-only CQRS contract imports from `@nestjs/cqrs`. They do not allow using NestJS dependency injection, modules, controllers, handlers, interceptors, pipes, filters, `ConfigService`, CQRS buses, or infrastructure dependencies inside domain code.

Shared infrastructure may also use NestJS filters and interceptors to normalize and log errors globally.

## Infrastructure Layer

Infrastructure contains technical details:

- driven adapters
- UI controllers
- CQRS handlers
- DTOs

## Driven Adapters

Driven adapters live in `infrastructure/driven-adapters`. They implement gateway contracts from `domain/models/gateways` and may integrate with APIs, queues, technical services, or other contexts through CQRS.

They must not import controllers, handlers, application, or use cases from other contexts.

## UI Layer

The UI layer lives in `infrastructure/ui` and contains controllers plus CQRS handlers.

## Controllers

Controllers live in `infrastructure/ui/controllers`. Controllers only receive requests, validate or map DTOs, create commands or queries, execute them through `CommandBus` or `QueryBus`, and return responses.

Controllers must not call use cases, repositories, or adapters directly.

## Command Handlers

Command handlers live in `infrastructure/ui/cqrs-handlers/command-handlers`. They receive commands and call use cases. They must not contain business logic or access concrete repositories or adapters directly.

## Query Handlers

Query handlers live in `infrastructure/ui/cqrs-handlers/query-handlers`. They receive queries and call use cases. They must not contain business logic or access concrete repositories or adapters directly.

## Event Handlers

Event handlers live in `infrastructure/ui/cqrs-handlers/event-handlers`. They react to domain events. They may call use cases or gateways for simple reactions, but must not duplicate business logic or access concrete repositories directly.

## DTOs

DTOs live in `infrastructure/dtos`. They can be used by controllers, handlers, and driven adapters, but must not replace domain entities or contain business logic.

## Dependency Rules

Allowed direction:

```txt
application -> domain
application -> infrastructure
infrastructure -> domain
domain -> no outer layer
```

Exceptions: domain code may import NestJS HTTP error classes from `@nestjs/common` for error handling only, and may use type-only CQRS imports from `@nestjs/cqrs` for architectural command/query/event contracts and result inference.

The application layer is the only place responsible for integrating providers, handlers, controllers, and adapters.

## Cross-Context Communication

Cross-context communication must happen through CQRS.

A context may import only explicitly exported domain models, commands, queries, or events from another context when they represent communication contracts.

If a use case needs another context, define a gateway in `domain/models/gateways` and implement it with a driven adapter that uses `CommandBus`, `QueryBus`, or `EventBus`.

## Provider Registration

Each context registers providers through:

```txt
application/providers/
  use-case.providers.ts
  gateway.providers.ts
  handler.providers.ts
  index.ts
```

Register use cases in `UseCaseProviders`, gateway token mappings in `GatewayProviders`, and CQRS handlers in `CommandHandlers`, `QueryHandlers`, and `EventHandlers`.

## Testing Architecture

Tests live only in `tests`. The first level is the test/support type, and inside each type the structure mirrors `apps` and `libs`. Unit tests must mock external dependencies and must not connect to real databases or services. Integration tests may use controlled infrastructure such as in-memory MongoDB or test containers. E2E tests may bootstrap modules but must use testing configuration and no real credentials.

## Test Folder Structure

```txt
tests/
  units/
    apps/
      api-gateway/
        src/
          application/
          domain/
          infrastructure/
    libs/
      shared/
        src/
          application/
          domain/
          infrastructure/
      shared/
        src/
          infrastructure/
            contracts/
  integration/
    apps/
    libs/
  e2e/
    apps/
    libs/
  mothers-and-mocks/
    apps/
    libs/
```

`mothers-and-mocks` contains object mothers, builders, mocks, stubs, fakes, and fixtures. Test type is expressed by directory and filename suffix: `tests/units/**/*.unit-spec.ts`, `tests/integration/**/*.integration-spec.ts`, and `tests/e2e/**/*.e2e-spec.ts`.

## Test Describe Convention

Tests must use this structure:

```ts
describe('ClassName', () => {
  describe('methodName', () => {
    it('should ...', () => {});
  });
});
```

If a file contains multiple classes, add a top-level describe for the group, then describe each class and method.

## How to add a new use case

1. Create the command or query in `domain/models/cqrs/commands` or `domain/models/cqrs/queries`.
2. Create the event in `domain/models/cqrs/events` if the use case must publish a domain fact.
3. Create or update entities and value objects in `domain/models` if applicable.
4. Create a gateway interface in `domain/models/gateways` if the use case needs external integration.
5. Create the use case in `domain/use-cases`.
6. Create a driven adapter in `infrastructure/driven-adapters` if a technical implementation is needed.
7. Create a command handler, query handler, or event handler in `infrastructure/ui/cqrs-handlers`.
8. Register the use case in `application/providers/use-case.providers.ts`.
9. Register gateways in `application/providers/gateway.providers.ts`.
10. Register handlers in `application/providers/handler.providers.ts`.
11. Expose an endpoint in a controller if applicable.
12. Create unit tests in the equivalent route inside `tests/units/apps` or `tests/units/libs` using `*.unit-spec.ts`.
13. Create mothers, mocks, or builders in the equivalent route inside `tests/mothers-and-mocks/apps` or `tests/mothers-and-mocks/libs`.
14. Create integration tests in `tests/integration` with `*.integration-spec.ts` or e2e tests in `tests/e2e` if applicable.
15. Ensure dependency rules are not broken.

## Forbidden Patterns

```txt
Controller -> UseCase directly
Controller -> Repository directly
Controller -> Adapter directly
Handler -> Repository concreto directamente
Handler -> Adapter concreto directamente
UseCase -> NestJS framework features, except HTTP error classes
UseCase -> Controller
UseCase -> Handler
UseCase -> Adapter concreto
UseCase -> Application
UseCase -> Infrastructure
Context A -> UseCase de Context B
Context A -> Infrastructure de Context B
Context A -> Application de Context B
DTO usado como entidad de dominio
Gateway con implementación concreta dentro de domain/models/gateways
Cada contexto importando ConfigModule directamente sin pasar por SharedModule
Cada contexto importando CqrsModule directamente sin pasar por SharedModule
Configurar MongoDB en esta iteración
Configurar Mongoose en esta iteración
Crear schemas de Mongoose en esta iteración
Crear adapters de MongoDB en esta iteración
Crear repositories concretos de MongoDB en esta iteración
Agregar variables como MONGODB_URI todavía
Tests unitarios conectándose a bases de datos reales
Tests sin estructura describe por clase y método
Tests ubicados fuera de la estructura equivalente a src
```
