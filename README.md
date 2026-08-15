# NovaMarket API

Backend del e-commerce **NovaMarket**. API REST construida con **Node.js + Express 5 + MongoDB (Mongoose) + TypeScript**, desplegada en **Render**.

- **Producción:** https://novamarket-back.onrender.com
- **Health check:** https://novamarket-back.onrender.com/api/health

## Stack

| Tecnología | Uso |
|------------|-----|
| **Node.js** (v20+) | Runtime |
| **Express 5** | Framework HTTP |
| **MongoDB Atlas** (Mongoose) | Base de datos NoSQL |
| **TypeScript** | Tipado, compilado con `tsc` |
| **JSON Web Token (JWT)** | Autenticación (Bearer token, 7 días) |
| **bcryptjs** | Hash de contraseñas |
| **Cloudinary** | Subida y almacenamiento de imágenes (opcional) |
| **Multer** | Multipart/form-data para subida de archivos |
| **pnpm** | Gestor de paquetes |

## Requisitos

- Node.js v20+
- pnpm (`npm i -g pnpm`)
- Cuenta de MongoDB Atlas (local o nube)
- Cuenta de Cloudinary (solo si vas a subir imágenes)

## Instalación

```bash
pnpm install
cp .env.example .env   # y completar las variables
```

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `NODE_ENV` | `development` \| `production` | No |
| `PORT` | Puerto del servidor (default `5000`) | No |
| `MONGODB_URI` | URI de conexión a MongoDB Atlas | **Sí** |
| `JWT_SECRET` | Secreto para firmar los tokens JWT | **Sí** |
| `FRONTEND_URL` | Orígenes permitidos por CORS, separados por coma (ej. `https://front.com,http://localhost:5173`) | **Sí** |
| `CLOUDINARY_CLOUD_NAME` | Cloud de Cloudinary | Solo con imágenes |
| `CLOUDINARY_API_KEY` | API key de Cloudinary | Solo con imágenes |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary | Solo con imágenes |

Mirá [`.env.example`](./.env.example).

## Correr el proyecto

```bash
pnpm dev       # desarrollo con recarga automática (tsx watch)
pnpm build     # compila TypeScript a dist/
pnpm start     # corre la build compilada (node dist/server.js)
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

**Registrar usuario** — `POST /api/auth/register`

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Franco",
  "email": "franco@test.com",
  "password": "123456"
}
```

Respuesta `201`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "66abcd1234ef567890123456",
    "name": "Franco",
    "email": "franco@test.com",
    "role": "client",
    "createdAt": "2026-08-15T18:00:00.000Z"
  }
}
```

Errores: `400` si el email ya existe (`{ "error": "El usuario ya existe" }`).

**Login** — `POST /api/auth/login`

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "franco@test.com",
  "password": "123456"
}
```

Respuesta `200`: mismo formato que register (`token` + `user`). Error `401`: `{ "error": "Credenciales inválidas" }`.

**Perfil** — `GET /api/auth/me` (requiere token)

Respuesta `200`:

```json
{
  "user": {
    "_id": "66abcd1234ef567890123456",
    "name": "Franco",
    "email": "franco@test.com",
    "password": "$2b$10$... (hashed)",
    "role": "client",
    "createdAt": "2026-08-15T18:00:00.000Z",
    "updatedAt": "2026-08-15T18:00:00.000Z"
  }
}
```

### Productos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/api/products` | pública | Lista productos activos. Query opcional: `?category=accesorios\|periféricos\|gadgets` |
| `GET` | `/api/products/:id` | pública | Detalle de un producto |
| `POST` | `/api/products` | admin | Crea producto. JSON o `multipart/form-data` con campo `image` |
| `PUT` | `/api/products/:id` | admin | Actualiza producto (parcial). Puede reemplazar imagen |
| `DELETE` | `/api/products/:id` | admin | Soft delete: marca `active: false` |

**Listar productos** — `GET /api/products`

```http
GET /api/products?category=periféricos
```

Respuesta `200`:

```json
[
  {
    "_id": "6a622637fe8584b5f89e9a71",
    "name": "Teclado mecánico",
    "description": "Switches rojos",
    "price": 4500,
    "category": "periféricos",
    "imageUrl": "https://res.cloudinary.com/...",
    "stock": 10,
    "active": true,
    "createdAt": "2026-08-10T12:00:00.000Z",
    "updatedAt": "2026-08-10T12:00:00.000Z",
    "__v": 0
  }
]
```

**Crear producto** — `POST /api/products` (requiere token de admin)

```http
POST /api/products
Authorization: Bearer <TOKEN_ADMIN>
Content-Type: application/json

{
  "name": "Teclado mecánico",
  "description": "Switches rojos",
  "price": 4500,
  "category": "periféricos",
  "stock": 10
}
```

Respuesta `201`: el producto creado (formato igual al listado). Campos obligatorios: `name`, `price`, `category`, `stock`. La categoría debe ser `accesorios`, `periféricos` o `gadgets`.

Para subir imagen, usar `multipart/form-data` con los campos del producto más `image` (archivo).

### Pedidos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/orders` | protegida | Crea pedido y descuenta stock. Body: `{ items: [{ productId, quantity }], shippingAddress }` |
| `GET` | `/api/orders/my` | protegida | Pedidos del usuario autenticado |
| `GET` | `/api/orders` | admin | Todos los pedidos |
| `PUT` | `/api/orders/:id/status` | admin | Cambia estado: `pending \| paid \| shipped \| delivered \| cancelled` |

**Crear pedido** — `POST /api/orders` (requiere token)

```http
POST /api/orders
Authorization: Bearer <TOKEN_CLIENT>
Content-Type: application/json

{
  "items": [
    { "productId": "6a622637fe8584b5f89e9a71", "quantity": 2 }
  ],
  "shippingAddress": "Av. Siempre Viva 123, CABA"
}
```

Respuesta `201`: el pedido creado, incluye `items` (con `product`, `quantity`, `price`), `total`, `status: "pending"`, `user` y `shippingAddress`.

Errores: `400` si no hay items o stock insuficiente, `404` si el producto no existe.

## Formato de respuestas

- **Éxito**: responde con el recurso directamente (ej. `{ token, user }`, array de productos, objeto de pedido).
- **Error**: siempre `{ "error": "mensaje" }` con el código HTTP correspondiente (400, 401, 403, 404, 500).

## Deploy en Render

1. Subí el repo a GitHub.
2. En **Render → New → Web Service**, conectá el repositorio.
3. Configuración del servicio:
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Environment:** agregar todas las variables de [`.env.example`](./.env.example) con los valores de producción (especialmente `MONGODB_URI`, `JWT_SECRET` y `FRONTEND_URL`).
4. Render compila el proyecto y lo sirve en `https://<nombre>.onrender.com`.

> **Importante:** `FRONTEND_URL` debe incluir la URL exacta del frontend de producción (los navegadores siempre envían el header `Origin`). Si el frontend puede abrirse desde varias URLs, listalas separadas por coma.

## Colección de requests

En [`request.http`](./request.http) hay ejemplos ejecutables de todos los endpoints para desarrollo local (REST Client de VS Code, base URL `http://localhost:5000`).

## Base de datos

El proyecto tiene un [seed](./seed.ts) para generar productos de prueba, actualmente **deshabilitado** (código comentado). Para habilitarlo, descomentá el archivo y ejecutalo con `pnpm tsx seed.ts`.