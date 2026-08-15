# API Documentation

API REST de NovaMarket. Formato de respuestas, autenticación y endpoints reales.

---

## Autenticación

Las rutas marcadas como **protegidas** requieren el header:

```
Authorization: Bearer <JWT_TOKEN>
```

Comportamiento del middleware `auth`:

| Situación | Código | Respuesta |
|-----------|--------|-----------|
| Sin header `Authorization` | 401 | `{ "error": "No se proporcionó token de autenticación" }` |
| Formato distinto de `Bearer <token>` | 401 | `{ "error": "Formato de token inválido" }` |
| Token inválido o expirado | 403 | `{ "error": "Token inválido o expirado" }` |

Las rutas de **admin** agregan el middleware `role`. Si el usuario no es admin responden **403** `{ "error": "No tienes permisos para esta acción" }`.

El token JWT vence a los **7 días** y contiene `id` y `role` del usuario.

Roles: `client` (por defecto al registrarse) y `admin`.

---

## Auth

### POST /api/auth/register

Registrar un nuevo usuario. **Pública**.

**Body:**
```json
{
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "123456"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "jwt_token",
  "user": {
    "_id": "64abc123def456789",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "client",
    "createdAt": "2026-07-13T10:30:00.000Z"
  }
}
```

**Errores posibles:**
- 400: `{ "error": "El usuario ya existe" }`
- 500: `{ "error": "Error de servidor" }`

---

### POST /api/auth/login

Iniciar sesión y obtener el token JWT. **Pública**.

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

**Respuesta exitosa (200):** mismo shape que `register` (`{ token, user }`).

**Errores posibles:**
- 401: `{ "error": "Credenciales inválidas" }`
- 500: `{ "error": "Error de servidor" }`

---

### GET /api/auth/me

Perfil del usuario autenticado. **Protegida**.

**Respuesta exitosa (200):**
```json
{
  "user": {
    "_id": "64abc123def456789",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "client",
    "createdAt": "2026-07-13T10:30:00.000Z",
    "updatedAt": "2026-07-13T10:30:00.000Z",
    "__v": 0
  }
}
```

**Errores posibles:** 401/403 (tabla de autenticación), 404 `Usuario no encontrado`.

---

## Productos

### GET /api/products

Listar productos activos. **Pública**.

**Query opcional:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `category` | string | Filtrar por categoría (`accesorios`, `periféricos`, `gadgets`) |

**Respuesta exitosa (200):** array de productos activos
```json
[
  {
    "_id": "64abc123def456789",
    "name": "Teclado mecánico",
    "description": "Switches rojos",
    "price": 4500,
    "category": "periféricos",
    "imageUrl": "https://...",
    "stock": 10,
    "active": true,
    "createdAt": "2026-07-13T10:30:00.000Z",
    "updatedAt": "2026-07-13T10:30:00.000Z",
    "__v": 0
  }
]
```

**Errores posibles:**
- 500: `{ "error": "Error al obtener productos: <detalle>" }`

---

### GET /api/products/:id

Obtener producto por ID. **Pública**.

**Errores posibles:**
- 400: `{ "error": "ID de producto inválido" }` (ID con formato inválido)
- 404: `{ "error": "Producto no encontrado" }` (ID válido inexistente)
- 500: `{ "error": "Error al obtener el producto" }`

---

### POST /api/products

Crear un producto. **Admin**.

Acepta JSON o `multipart/form-data` (con imagen en el campo `image`, subida a Cloudinary). La URL de imagen también puede pasarse como `imageUrl`.

**Body (JSON):**
```json
{
  "name": "Teclado mecánico",
  "description": "Switches rojos",
  "price": 4500,
  "category": "periféricos",
  "stock": 10
}
```

**Validaciones (400):**
- `name`: obligatorio, string no vacío.
- `price`: obligatorio, número mayor a 0.
- `category`: obligatorio, uno de `accesorios | periféricos | gadgets`.
- `stock`: obligatorio, entero mayor o igual a 0.

**Respuesta exitosa (201):** producto creado (mismo shape que GET `:id`).

---

### PUT /api/products/:id

Actualizar un producto (parcial: solo se validan los campos enviados). **Admin**.

Si se envía una imagen nueva, la anterior se elimina de Cloudinary.

**Errores posibles:**
- 400: `{ "error": "ID de producto inválido" }` o mensaje de validación de campo
- 404: `{ "error": "Producto no encontrado" }`
- 500: `{ "error": "Error al actualizar el producto" }`

---

### DELETE /api/products/:id

Eliminación lógica: marca `active: false`. **Admin**.

**Respuesta exitosa (200):**
```json
{
  "message": "Producto eliminado",
  "product": { "...producto con active: false" }
}
```

**Errores posibles:** 400 (ID inválido), 404 (no encontrado), 500.

---

## Pedidos

### POST /api/orders

Crear un pedido tras el checkout. **Protegida**.

**Body:**
```json
{
  "items": [
    { "productId": "64abc123def456789", "quantity": 2 }
  ],
  "shippingAddress": "Av. Siempre Viva 123, CABA"
}
```

Comportamiento:
- Valida que `items` no esté vacío y que `shippingAddress` exista.
- Por cada item: valida `quantity` (entero > 0), que el producto exista y que haya stock. Descuenta el stock y guarda el producto.
- El precio se toma del producto en el momento de la compra (no del frontend). El `total` se calcula en el backend.

**Respuesta exitosa (201):**
```json
{
  "_id": "64abc123def456789",
  "user": "64abc123def456789",
  "items": [
    {
      "product": "64abc123def456789",
      "quantity": 2,
      "price": 4500,
      "_id": "64abc123def456789"
    }
  ],
  "total": 9000,
  "shippingAddress": "Av. Siempre Viva 123, CABA",
  "status": "pending",
  "createdAt": "2026-07-13T10:30:00.000Z",
  "updatedAt": "2026-07-13T10:30:00.000Z",
  "__v": 0
}
```

**Errores posibles:**
- 400: `{ "error": "El pedido debe incluir items" }` | `{ "error": "La dirección de envío es obligatoria" }` | `{ "error": "La cantidad para el producto debe ser un número entero mayor a 0" }` | `{ "error": "Stock insuficiente para <producto>" }`
- 404: `{ "error": "Producto no encontrado" }`
- 500: `{ "error": "<mensaje>" }`

---

### GET /api/orders/my

Pedidos del usuario autenticado. **Protegida**.

**Respuesta exitosa (200):** array de pedidos del usuario, con `items.product` populado (`name`, `price`).

---

### GET /api/orders

Todos los pedidos. **Admin**.

**Respuesta exitosa (200):** array de pedidos, con `user` populado (`name`, `email`) y `items.product` populado (`name`).

---

### PUT /api/orders/:id/status

Actualizar el estado de un pedido. **Admin**.

**Body:**
```json
{
  "status": "shipped"
}
```

**Estados válidos:** `pending | paid | shipped | delivered | cancelled`

**Errores posibles:**
- 400: `{ "error": "ID de pedido inválido" }` o `{ "error": "Estado inválido: <status>. Valores válidos: ..." }`
- 404: `{ "error": "Pedido no encontrado" }`

---

## Formato general de errores

Todos los errores usan la clave unificada:

```json
{ "error": "mensaje" }
```

con el código HTTP correspondiente (400, 401, 403, 404, 500).

## Rutas inexistentes

Cualquier ruta no definida responde `404` con JSON:
`{ "error": "Ruta no encontrada: GET /api/noexiste" }`

## Carrito

No hay endpoints de carrito en el backend. El carrito se maneja en el frontend y con el checkout se envía `POST /api/orders`.