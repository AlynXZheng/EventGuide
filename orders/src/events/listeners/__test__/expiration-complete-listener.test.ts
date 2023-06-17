import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderStatus, ExpirationCompleteEvent } from "@tourguide/common";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderModel } from "../../../models/order";
import { TicketModel } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener with a fake natsWrapper client
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const order = await OrderModel.create({
    status: OrderStatus.Created,
    userId: "alskdfj",
    expiresAt: new Date(),
    ticket,
  });

  // create a fake data event mimicking a published event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await OrderModel.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
