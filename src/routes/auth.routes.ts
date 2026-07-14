import { Router } from "express";

const router = Router();


router.post("/register", (_req, res) => {
  res.json({
    message: "Registro funcionando"
  });
});


router.post("/login", (_req, res) => {
  res.json({
    message: "Login funcionando"
  });
});


export default router;