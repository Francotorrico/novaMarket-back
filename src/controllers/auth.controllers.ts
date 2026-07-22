import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export const generateToken = (id: string, role: string) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
    return token;
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Validar que el email no exista
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        // Crear el usuario
        const user = await User.create({ name, email, password });

        // Generar token JWT
        const token = generateToken(user._id.toString(), user.role);

        // Responder con token y user (sin password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };

        res.status(201).json({ token, user: userResponse });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Generar token JWT
        const token = generateToken(user._id.toString(), user.role);

        // Responder con token y user (sin password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };

        res.status(200).json({ token, user: userResponse });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        // req.user fue seteado por el middleware de auth
        const user = await User.findById(req.user?.id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
};