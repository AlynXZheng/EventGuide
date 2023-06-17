import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { TicketCreatedEvent } from "@tourguide/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketModel } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener with a fake natsWrapper client
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event mimicking a published event.
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates a ticket from event data and saves it", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the fake data object + fake message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  const ticket = await TicketModel.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();

  // call the onMessage function with the fake data object + fake message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
