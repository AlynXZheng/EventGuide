import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { TicketModel } from "../../models/ticket";
import { OrderModel } from "../../models/order";
import { OrderStatus } from "@tourguide/common";
import jwt from "jsonwebtoken";
import { natsWrapper } from "../../nats-wrapper";

const signin = () => {
  // Build a JWT payload.  { id, email }
  const payload = { id: "randomfakeid", email: "test@test.com" };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("marks an order as cancelled", async () => {
  // create a ticket with Ticket Model
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const user = signin();
  // make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expectation to make sure the order is cancelled
  const updatedOrder = await OrderModel.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const user = signin();
  // make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
