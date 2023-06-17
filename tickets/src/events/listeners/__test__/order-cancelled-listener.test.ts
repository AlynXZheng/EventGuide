import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledEvent } from "@tourguide/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { TicketModel } from "../../../models/ticket";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = await TicketModel.create({
    title: "concert",
    price: 20,
    userId: "asdf",
    orderId: orderId,
  });

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("unreserve the ticket, publishes an ticket updated event, and acks the message", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await TicketModel.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
