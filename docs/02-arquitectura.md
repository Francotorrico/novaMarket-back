# Arquitectura de la API

## Stack Tecnológico

- **Node.js** — Servidor
- **cloudinary** — Almacenamiento de imágenes
- **Express** — Framework para crear la API
- **TypeScript** — Lenguaje con tipos
- **MongoDB Atlas** — Base de datos en la nube
- **Mongoose** — ODM para MongoDB
- **JWT** — Autenticación con tokens
- **bcrypt** — Encriptación de contraseñas

---

## Arquitectura del Sistema

``` diagramar 
Cliente (React)
       ↓
  API REST (Express)
       ↓
  Controllers
       ↓
   Services
       ↓
   Models (Mongoose)
       ↓
  MongoDB Atlas
```

### Flujo de Capas

- **Controllers** — Recepciones de requests
- **Services** — Lógica del negocio
- **Models** — Estructura de datos
- **DB** — Persistencia

---

## Colecciones (Modelos)

### Users

- `id` — Identificador único
- `name` — Nombre del usuario
- `email` — Correo electrónico
- `password` — Contraseña encriptada
- `role` — Rol (cliente/admin)
- `createdAt` — Fecha de creación

### Products

- `id` — Identificador único
- `name` — Nombre del producto
- `description` — Descripción
- `price` — Precio
- `stock` — Cantidad disponible
- `category` — Categoría del producto   
- `image` — URL de imagen

### Orders / pedidos

- `id` — Identificador único
- `user` — Referencia al usuario
- `items[]` — Lista de productos comprados:
  - productId
  - name
  - price
  - quantity
- `total` — Total del pedido
- `status` — Estado del pedido  
  - pending
  - confirmed
  - cancelled
- `createdAt` — Fecha de creación
- `shippingAddress` — Dirección de envío

### OrderItems

productId — Referencia al producto
nameSnapshot — Nombre del producto en el momento de la compra
priceSnapshot — Precio del producto en el momento de la compra
quantity — Cantidad comprada
subtotal — priceSnapshot × quantity
---

## Sistema de Autenticación (JWT)

```
Usuario se registra / inicia sesión
       ↓
Backend valida credenciales
       ↓
Se genera JWT
       ↓
Frontend guarda token
       ↓
Se envía en cada request
       ↓
Backend valida token
       ↓
Acceso permitido o denegado

```

### Seguridad

- Passwords encriptadas con bcrypt
- JWT con expiración
- Middleware para proteger rutas

### base de datos

User (1) ────> Order (N)
Order (1) ────> OrderItem (N)
Product (1) ──> OrderItem (N)