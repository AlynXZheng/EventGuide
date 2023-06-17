import { Schema, model } from "mongoose";
import { OrderStatus } from "@tourguide/common";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface Order {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
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

const OrderModel = model<Order>("Order", orderSchema);

export { OrderModel };
