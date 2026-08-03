import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    category: "accesorios" | "periféricos" | "gadgets";
    imageUrl?: string;
    stock: number;
    active: boolean;
    createdAt: Date;
}

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
     },

    description: {
        type: String,
        required: false,
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String,
        enum: ["accesorios", "periféricos", "gadgets"],
        required: true
    },

    imageUrl: {
        type: String,
        required: false
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    active: {
        type: Boolean,
        required: true,
        default: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// esto es para que puedas buscar por category
productSchema.index({ category: 1 });

// Traducción: "Crea el modelo con este schema, y cuando TypeScript lo use, trátalo como IProduct"
export default mongoose.model<IProduct>("Product", productSchema);