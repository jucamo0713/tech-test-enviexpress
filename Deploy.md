# Deploy y pruebas rapidas

Guia corta para levantar Enviexpress localmente y validar las funcionalidades principales.

## Requisitos

- Docker y Docker Compose
- Puertos libres: `3001`, `4200`, `27017`, `6379`

## Levantar el proyecto

Desde la raiz del repositorio:

```bash
docker compose up --build
```

URLs principales:

- Frontend: `http://localhost:4200`
- API Gateway: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/docs`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

Para detener todo:

```bash
docker compose down
```

Para reiniciar con base de datos limpia:

```bash
docker compose down -v
docker compose up --build
```

## Usuarios demo

Se crean automaticamente al iniciar los microservicios:

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@enviexpress.test` | `Admin123!` |
| Operador | `operador@enviexpress.test` | `Operator123!` |
| Cliente | `cliente@enviexpress.test` | `Client123!` |

Paquetes demo:

- `ENV-DEMO-001`
- `ENV-DEMO-002`
- `ENV-REG-001`

## Probar desde Swagger

1. Abrir `http://localhost:3001/docs`.
2. Ejecutar `POST /api/auth/login` con el usuario admin.
3. Copiar el `accessToken`.
4. Usar el boton `Authorize` y pegar el token como Bearer.
5. Probar:
   - `GET /api/clients`
   - `GET /api/packages`
   - `POST /api/packages`
   - `PATCH /api/packages/{id}/status`
   - `GET /api/packages/track?trackingCode=ENV-DEMO-001&email=cliente@enviexpress.test`

## Probar con curl

Login:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@enviexpress.test","password":"Admin123!"}' \
  | jq -r '.accessToken')
```

Listar clientes:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/clients?page=1&limit=10"
```

Listar paquetes:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/packages?page=1&limit=10"
```

Crear paquete:

```bash
curl -X POST http://localhost:3001/api/packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "11111111-1111-4111-8111-111111111111",
    "clientEmail": "cliente@enviexpress.test",
    "description": "Sobre de prueba",
    "destinationAddress": "Calle 123 # 45-67, Bogota"
  }'
```

Cambiar estado de un paquete:

```bash
curl -X PATCH http://localhost:3001/api/packages/33333333-3333-4333-8333-333333333333/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"received","comment":"Recibido en bodega"}'
```

Consulta publica por tracking:

```bash
curl "http://localhost:3001/api/packages/track?trackingCode=ENV-DEMO-001&email=cliente@enviexpress.test"
```

Registro de cliente por paquete:

```bash
curl -X POST http://localhost:3001/api/auth/register-client \
  -H "Content-Type: application/json" \
  -d '{
    "trackingCode": "ENV-REG-001",
    "email": "registro@enviexpress.test",
    "password": "Client123!"
  }'
```

## Que validar

- El login devuelve JWT y respeta roles.
- Admin/operador pueden gestionar clientes y paquetes.
- Cliente solo ve sus paquetes.
- Los estados de paquete siguen la maquina de estados.
- La consulta publica no requiere login y oculta el actor del historial.
- Redis Pub/Sub actualiza trazabilidad y auditoria sin bloquear la operacion principal.
- `audit-ms` no expone gRPC; consume eventos de auditoria desde Redis.

