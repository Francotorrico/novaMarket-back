import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);