import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import { upload } from "../config/cloudinary.config";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";

const router = Router();

// Ruta pública
router.get("/", getProducts);
router.get("/:id", getProductById);

// Rutas protegidas (solo admin)
router.post("/", authMiddleware, roleMiddleware(["admin"]), upload.single("image"), createProduct);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteProduct);



export default router;