import { Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@tourguide/common";

interface Order {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const orderModel = model<Order>("Order", orderSchema);

export { orderModel };
