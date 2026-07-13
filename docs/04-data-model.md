# Data Model (MongoDB)

## Colecciones

### users

```json
{
  "_id": ObjectId,
  "name": "Juan Perez",
  "email": "juan@email.com",
  "password": "$2b$10$...", // hash bcrypt
  "role": "customer", // enum: customer, admin
  "createdAt": "2026-07-13T10:30:00Z"
}
```

### products

```json
{
  "_id": ObjectId,
  "name": "Mouse Logitech",
  "description": "Mouse inalámbrico",
  "price": 25000,
  "category": "mouse",
  "stock": 10,
  "imageUrl": "https://...",
  "createdAt": "2026-07-13T10:30:00Z"
}
```

### orders

```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "items": [
    {
      "productId": ObjectId,
      "name": "Mouse Logitech",
      "quantity": 2,
      "price": 25000
    }
  ],
  "totalAmount": 50000,
  "paymentStatus": "pending", // enum: pending, approved, rejected
  "orderStatus": "pending", // enum: pending, processing, completed, cancelled
  "createdAt":"2026-07-13T10:30:00Z"
}
```

---

## Esquemas Mongoose

### User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| _id | ObjectId | ID único del usuario |
| name | String | Nombre completo |
| email | String | Email único |
| password | String | Contraseña encriptada (bcrypt) |
| role | String | Rol: `customer`, `admin` |
| createdAt | Date | Fecha de creación |

### Product

| Campo | Tipo | Descripción |
|-------|------|-------------|
| _id | ObjectId | ID único del producto |
| name | String | Nombre del producto |
| description | String | Descripción |
| price | Number | Precio unitario |
| category | String | Categoría |
| stock | Number | Cantidad en stock |
| imageUrl | String | URL de imagen |
| createdAt | Date | Fecha de creación |

### Order

| Campo | Tipo | Descripción |
|-------|------|-------------|
| _id | ObjectId | ID único del pedido |
| userId | ObjectId | Referencia a User |
| items | Array | Array de OrderItem embebidos |
| totalAmount | Number | Monto total |
| paymentStatus | String | Estado del pago |
| orderStatus | String | Estado del pedido |
| createdAt | Date | Fecha de creación |

### OrderItem (embebido en Order)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| productId | ObjectId | Referencia a Product |
| name | String | Nombre al momento de compra |
| quantity | Number | Cantidad |
| price | Number | Precio unitario |

---

## Relaciones

```
User (1) ──────< (N) Order
Product (1) ──────< (N) OrderItem (embebido)
Order (1) ──────< (N) OrderItem (embebido)
```

---

## Notas

- **MongoDB** → usa `_id` (ObjectId) en lugar de `id` string
- **Embebido** → order_items se guarda dentro del documento Order (no colección separada)
- **Denormalizado** → el nombre del producto se guarda en el momento de la compra

