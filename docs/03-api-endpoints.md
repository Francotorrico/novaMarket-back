# API Endpoints

## Autenticación

- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión
- `GET /api/auth/profile` — Obtener perfil del usuario

---

## Productos

- `GET /api/products` — Listar todos los productos
- `GET /api/products/:id` — Obtener producto por ID
- `POST /api/products` — Crear producto
- `PUT /api/products/:id` — Actualizar producto
- `DELETE /api/products/:id` — Eliminar producto

---

## Carrito

- `GET /api/cart` — Obtener carrito del usuario
- `POST /api/cart` — Agregar producto al carrito
- `PUT /api/cart/:productId` — Actualizar cantidad
- `DELETE /api/cart/:productId` — Eliminar producto del carrito

---

## Pedidos

- `POST /api/orders` — Crear pedido
- `GET /api/orders` — Listar pedidos del usuario
- `GET /api/orders/:id` — Obtener pedido por ID