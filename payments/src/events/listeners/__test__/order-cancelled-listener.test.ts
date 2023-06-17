import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderStatus, OrderCancelledEvent } from "@tourguide/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { orderModel } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = await orderModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "asldkfj",
    version: 0,
  });

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "asldkfj",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("updates the status of the order", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await orderModel.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
