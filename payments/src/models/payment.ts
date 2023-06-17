import { Schema, model } from "mongoose";

interface Payment {
  orderId: string;
  stripeId: string;
}

const paymentSchema = new Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
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

const paymentModel = model<Payment>("Payment", paymentSchema);

export { paymentModel };
