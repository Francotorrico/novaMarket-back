import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Error de servidor";

// POST /api/orders
// Crear pedido
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El pedido debe incluir items" });
    } 

    if (!shippingAddress) {
      return res.status(400).json({ error: "La dirección de envío es obligatoria" });
    }

    let total = 0;
    const orderItems: {
      product: mongoose.Types.ObjectId;
      quantity: number;
      price: number;
    }[] = [];

    // Procesa cada item del pedido: valida el producto y la cantidad, calcula el
    // precio unitario al momento de la compra y descuenta el stock de forma
    // atomica (guardando el producto por cada item).
    for (const item of items) {
      // La cantidad debe ser un entero positivo para evitar pedidos con total 0 o negativo.
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          error: `La cantidad para el producto debe ser un número entero mayor a 0`,
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${product.name}`,
        });
      }

      total += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      total,
      shippingAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/orders/my
// Pedidos del usuario
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user!.id }).populate(
      "items.product",
      "name price"
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// GET /api/orders
// Todos los pedidos admin
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};

// PUT /api/orders/:id/status
const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de pedido inválido" });
    }

    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Estado inválido: ${status}. Valores válidos: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
};