import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️  MONGODB_URI no definida en .env - MongoDB desconectado");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (err) {
    console.warn("⚠️  MongoDB no conectado:", err);
  }
};


export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
    console.log("Desconectado de la base de datos");
    } catch (err) {
        console.error("Error al desconectar de la base de datos", err);
    }
};

export default connectDB;

