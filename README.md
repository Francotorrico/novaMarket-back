# NovaMarket API

Backend del e-commerce NovaMarket. API REST construida con **Node.js + Express 5 + MongoDB (Mongoose) + TypeScript**.

## Stack

- **Node.js** (v20+)
- **Express 5**
- **MongoDB Atlas** / Mongoose
- **TypeScript** (ejecutado con `tsx`)
- **JWT** para autenticación
- **Cloudinary** para subida de imágenes (opcional)

## Requisitos

- Node.js v20+
- pnpm (`npm i -g pnpm`)

## Instalación

```bash
pnpm install
cp .env.example .env   # y completar las variables
```

## Variables de entorno

Mirá [`.env.example`](./.env.example). Las principales:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default `5000`) |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |
| `FRONTEND_URL` | Origen permitido por CORS (URL del frontend) |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Credenciales de Cloudinary (imágenes) |

## Correr el proyecto

```bash
pnpm dev     # desarrollo con recarga automática (tsx watch)
pnpm build   # compila TypeScript a dist/
pnpm start   # corre la build compilada
```

El servidor queda en `http://localhost:5000`. Health check: `GET /api/health`.

## Autenticación

Todas las rutas marcadas como **protegidas** requieren el header:

```
Authorization: Bearer <JWT_TOKEN>
```

Roles: `client` (por defecto al registrarse) y `admin`.

## Endpoints

### Auth

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/auth/register` | pública | Registra usuario. Body: `{ name, email, password }` |
| `POST` | `/api/auth/login` | pública | Login. Body: `{ email, password }` → `{ token, user }` |
| `GET` | `/api/auth/me` | protegida | Perfil del usuario autenticado |

### Productos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/api/products` | pública | Lista productos activos. Query opcional: `?category=accesorios\|periféricos\|gadgets` |
| `GET` | `/api/products/:id` | pública | Detalle de un producto |
| `POST` | `/api/products` | admin | Crea producto. JSON o `multipart/form-data` con campo `image` |
| `PUT` | `/api/products/:id` | admin | Actualiza producto (parcial). Puede reemplazar imagen |
| `DELETE` | `/api/products/:id` | admin | Soft delete: marca `active: false` |

### Pedidos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/orders` | protegida | Crea pedido. Body: `{ items: [{ productId, quantity }], shippingAddress }`. Valida cantidad y stock, descuenta stock y calcula el total |
| `GET` | `/api/orders/my` | protegida | Pedidos del usuario autenticado |
| `GET` | `/api/orders` | admin | Todos los pedidos |
| `PUT` | `/api/orders/:id/status` | admin | Cambia estado. `status`: `pending \| paid \| shipped \| delivered \| cancelled` |

## Formato de respuestas

- **Éxito**: responde con el recurso directamente (ej. `{ token, user }`, array de productos, objeto de pedido).
- **Error**: siempre `{ "error": "mensaje" }` con el código HTTP correspondiente (400, 401, 403, 404, 500).

## Colección de requests

En [`request.http`](./request.http) hay ejemplos ejecutables de todos los endpoints (REST Client de VS Code).