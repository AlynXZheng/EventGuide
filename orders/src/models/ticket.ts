import mongoose, { Model, Schema, model } from "mongoose";
import { OrderModel } from "./order";
import { OrderStatus } from "@tourguide/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  version: number;
}

// Put all instance methods in this interface:
interface ITicketMethods {
  isReserved(): Promise<boolean>;
}

// Put all static methods in this interface:
interface ITicketModel extends Model<TicketDoc, {}, ITicketMethods> {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return TicketModel.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on
  const existingOrder = await OrderModel.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const TicketModel = model<TicketDoc, ITicketModel>("Ticket", ticketSchema);

export { TicketModel };
