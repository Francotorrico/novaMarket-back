import { Request, Response } from "express";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth.middleware";
import { MulterRequest } from "../config/cloudinary.config";
import { deleteImageFromCloudinary } from "../services/cloudinary.service";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const filter: any = { active: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error: any) {
    console.error("Error getProducts:", error);
    const errorMessage = error?.message || JSON.stringify(error) || "Error desconocido";
    res.status(500).json({ message: "Error al obtener productos", error: errorMessage });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto" });
  }
};

export const createProduct = async (req: MulterRequest, res: Response) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const imageUrl = req.file ? req.file.path : req.body.imageUrl || "";

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      active: true,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear el producto", error: error });
  }
};

export const updateProduct = async (req: MulterRequest, res: Response) => {
  try {
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    const updateData = { ...req.body };

    if (req.file) {
      if (existingProduct.imageUrl) {
        await deleteImageFromCloudinary(existingProduct.imageUrl);
      }
      updateData.imageUrl = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { returnDocument: "after" }
    );

    if (!deletedProduct) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json({ message: "Producto eliminado", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
};
