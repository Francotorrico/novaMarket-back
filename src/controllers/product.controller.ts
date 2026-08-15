import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth.middleware";
import { MulterRequest } from "../config/cloudinary.config";
import { deleteImageFromCloudinary } from "../services/cloudinary.service";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

const VALID_CATEGORIES = ["accesorios", "periféricos", "gadgets"];

const REQUIRED_CREATE_FIELDS = ["name", "price", "category", "stock"] as const;

const validateProductFields = (fields: {
  name?: unknown;
  price?: unknown;
  category?: unknown;
  stock?: unknown;
}) => {
  if (fields.name !== undefined && (typeof fields.name !== "string" || !fields.name.trim())) {
    return "El nombre es obligatorio";
  }
  if (fields.price !== undefined && (typeof fields.price !== "number" || fields.price <= 0)) {
    return "El precio debe ser un número mayor a 0";
  }
  if (fields.category !== undefined && !VALID_CATEGORIES.includes(fields.category as string)) {
    return `La categoría debe ser una de: ${VALID_CATEGORIES.join(", ")}`;
  }
  if (
    fields.stock !== undefined &&
    (typeof fields.stock !== "number" || !Number.isInteger(fields.stock) || fields.stock < 0)
  ) {
    return "El stock debe ser un número entero mayor o igual a 0";
  }
  return null;
};

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
    res.status(500).json({ error: `Error al obtener productos: ${errorMessage}` });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "ID de producto inválido" });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

export const createProduct = async (req: MulterRequest, res: Response) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const missingField = REQUIRED_CREATE_FIELDS.find(
      (field) => req.body[field] === undefined
    );
    if (missingField) {
      res.status(400).json({ error: `El campo ${missingField} es obligatorio` });
      return;
    }

    const validationError = validateProductFields({ name, price, category, stock });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

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
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

export const updateProduct = async (req: MulterRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "ID de producto inválido" });
      return;
    }

    const validationError = validateProductFields({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
    });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      res.status(404).json({ error: "Producto no encontrado" });
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
      id,
      updateData,
      { returnDocument: "after" }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      res.status(400).json({ error: "ID de producto inválido" });
      return;
    }

    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: "after" }
    );

    if (!deletedProduct) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }

    res.json({ message: "Producto eliminado", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
