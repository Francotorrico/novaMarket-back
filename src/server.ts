import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import orderRoutes from "./routes/order.routes.ts";
import connectDB from "./config/database.ts";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error stack:", err.stack);
  console.error("Error:", err);
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || String(err),
    status: err.status || err.statusCode
  });
});

// Iniciar servidor
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to the database", err);
    process.exit(1);
  });
