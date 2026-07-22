import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {Request, Response} from "express";


const router = Router();

// Ruta pública
router.get("/",authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: "Lista de productos"
  });
});



export default router;