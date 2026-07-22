import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


// Agregar req.user al request esto es cuando pasa el middleware
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Extraer el token del header Authorization: Bearer <token>
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No se proporcionó token de autenticación" });
        }

        // Verificar formato "Bearer <token>"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ error: "Formato de token inválido" });
        }

        const token = parts[1];

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
        };

        // Agregar req.user al request
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        // Token inválido o expirado
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
};
