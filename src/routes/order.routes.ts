import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getUserOrders);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllOrders);
router.put("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateOrderStatus);

export default router;