import { Router } from "express";

const router = Router();


router.post("/", (_req, res) => {
  res.json({
    message: "Crear pedido"
  });
});


router.get("/", (_req, res) => {
  res.json({
    message: "Lista de pedidos"
  });
});


export default router;