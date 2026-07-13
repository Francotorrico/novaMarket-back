# API Documentation

---

## Auth

### POST /api/auth/register

Registrar un nuevo usuario.

**Parámetros:** Ninguno

**Body esperado:**
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
  "success": true,
  "message": "Usuario creado correctamente"
}
```

**Errores posibles:**
- 400: Error al crear el usuario (email duplicado, datos inválidos)

---

### POST /api/auth/login

Iniciar sesión y obtener token JWT.

**Parámetros:** Ninguno

**Body esperado:**
```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "123",
      "name": "Juan Perez",
      "role": "customer"
    }
  }
}
```

**Errores posibles:**
- 401: Credenciales inválidas
- 400: Datos incompletos

---

### GET /api/auth/profile

Obtener perfil del usuario autenticado.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:** Ninguno

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Juan Perez",
    "email": "juan@email.com",
    "role": "customer"
  }
}
```

**Errores posibles:**
- 401: Token no válido o expirado

---

## Productos

### GET /api/products

Listar todos los productos con filtros opcionales.

**Pública** - No requiere autenticación

**Parámetros Query (opcionales):**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| category | string | Filtrar por categoría |
| minPrice | number | Precio mínimo |
| maxPrice | number | Precio máximo |
| search | string | Buscar por nombre |

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "Mouse Logitech",
      "description": "Mouse inalámbrico",
      "price": 25000,
      "stock": 10,
      "imageUrl": "https://...",
      "category": "mouse"
    }
  ]
}
```

**Errores posibles:**
- 500: Error interno del servidor

---

### GET /api/products/:id

Obtener producto por ID.

**Pública** - No requiere autenticación

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del producto |

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Mouse Logitech",
    "description": "Mouse inalámbrico",
    "price": 25000,
    "stock": 10,
    "imageUrl": "https://...",
    "category": "mouse"
  }
}
```

**Errores posibles:**
- 404: Producto no encontrado

---

### POST /api/products

Crear un nuevo producto.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:** Ninguno

**Body esperado:**
```json
{
  "name": "Teclado mecánico",
  "description": "RGB",
  "price": 50000,
  "category": "teclado",
  "stock": 20,
  "imageUrl": "https://..."
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Producto creado correctamente",
  "data": {
    "id": "123"
  }
}
```

**Errores posibles:**
- 400: Datos inválidos o incompletos
- 401: No autenticado
- 403: No tiene permisos de admin

---

### PUT /api/products/:id

Actualizar un producto existente.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del producto |

**Body esperado:**
```json
{
  "name": "Teclado mecánico",
  "description": "RGB",
  "price": 45000,
  "stock": 15,
  "imageUrl": "https://...",
  "category": "teclado"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Producto actualizado correctamente"
}
```

**Errores posibles:**
- 400: Datos inválidos
- 401: No autenticado
- 403: No tiene permisos de admin
- 404: Producto no encontrado

---

### DELETE /api/products/:id

Eliminar un producto.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del producto |

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No tiene permisos de admin
- 404: Producto no encontrado

---

## Pedidos

### POST /api/orders

Crear un nuevo pedido después del checkout.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:** Ninguno

**Body esperado:**
```json
{
  "items": [
    {
      "productId": "123",
      "quantity": 2,
    //   "price": 25000
    }
  ],
  "totalAmount": 50000
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "_id": "abc123",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "totalAmount": 50000
  }
}
```

**Errores posibles:**
- 400: Datos inválidos o productos no disponibles
- 401: No autenticado

---

### GET /api/orders

Listar todos los pedidos (solo admin).

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Permisos:** Usuario con rol admin

**Parámetros:** Ninguno

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Pedidos obtenidos correctamente",
  "data": [
    {
      "_id": "001",
      "user": {
        "_id": "123",
        "name": "Juan Perez",
        "email": "juan@email.com"
      },
      "items": [
        {
          "productId": "p001",
          "name": "Mouse Logitech",
          "quantity": 2,
          "price": 25000
        }
      ],
      "totalAmount": 50000,
      "paymentStatus": "approved",
      "orderStatus": "processing",
      "createdAt": "2026-07-13T10:30:00Z"
    }
  ]
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No tiene permisos de admin

---

### GET /api/orders/user/:userId

Obtener pedidos de un usuario específico.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| userId | string | ID del usuario |

**Body esperado:** Ninguno

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "001",
      "items": [
        {
          "productId": "123",
          "name": "Mouse Logitech",
          "quantity": 2,
          "price": 25000
        }
      ],
      "totalAmount": 50000,
      "paymentStatus": "pending",
      "orderStatus": "pending",
      "createdAt": "2026-07-13T10:30:00Z"
    }
  ]
}
```

**Errores posibles:**
- 401: No autenticado
- 403: No puedes ver pedidos de otro usuario
- 404: Usuario no encontrado

---

## Carrito (Opcional)

Para el MVP se puede manejar el carrito en frontend y enviar solamente la información al backend al confirmar compra.

### GET /api/cart

Obtener carrito del usuario.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

### POST /api/cart

Agregar producto al carrito.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

**Body esperado:**
```json
{
  "items": [
    {
      "productId": "123",
      "quantity": 2
    }
  ]
}
```

### PUT /api/cart/:productId

Actualizar cantidad de un producto en el carrito.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`

### DELETE /api/cart/:productId

Eliminar producto del carrito.

**Ruta protegida** - Requiere: `Authorization: Bearer <JWT_TOKEN>`