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
      return res.status(400).json({ message: "El pedido debe incluir items" });
    } 

    if (!shippingAddress) {
      return res.status(400).json({ message: "La dirección de envío es obligatoria" });
    }

    let total = 0;
    const orderItems: {
      product: mongoose.Types.ObjectId;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}`,
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
    res.status(500).json({ message: getErrorMessage(error) });
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
    res.status(500).json({ message: getErrorMessage(error) });
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
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};