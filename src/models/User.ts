import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "client" | "admin";
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true    
    },
    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["client", "admin"],
        default: "client"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

// se ejecuta antes de guardar el documento
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// lo llamas manualmente, ejemplo: login
userSchema.methods.comparePassword = async function(password: string) {
    return bcrypt.compare(password, this.password);
};

// Traducción: "Crea el modelo con este schema, y cuando TypeScript lo use, trátalo como IUser"
export default mongoose.model<IUser>("User", userSchema);
/*
---
En resumen:

┌──────────────┬─────────────────────────────────────────────┐
│    Parte     │                  Qué hace                   │
├──────────────┼─────────────────────────────────────────────┤
│ Schema       │ Crea la estructura en MongoDB (campos,      │
│              │ métodos reales)                             │
├──────────────┼─────────────────────────────────────────────┤
│ Interface    │ Le dice a TypeScript qué campos/métodos     │
│              │ existen (para autocompletado y errores)     │
├──────────────┼─────────────────────────────────────────────┤
│ model<IUser> │ Une ambos: usa el schema real, pero con el  │
│              │ tipo de TypeScript                          │
└──────────────┴─────────────────────────────────────────────┘

Es como el esquema de una receta:
- Schema = Los ingredientes y pasos reales para hacer la comida
- Interface = La foto del plato terminado (solo para ver cómo debería verse)
- model<IUser> = "Usa esta receta, y cuando hables de ella, referencia esta foto"

✻ Brewed for 11s

──────────────────────────────────────────────────────────────────
❯
──────────────────────────────────────────────────────────────────
  ⏸ manual mode on · ? for sho
*/