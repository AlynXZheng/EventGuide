import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import jwt from "jsonwebtoken";
import { OrderModel } from "../../models/order";
import { TicketModel } from "../../models/ticket";
import { OrderStatus } from "@tourguide/common";
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

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const order = await OrderModel.create({
    ticket,
    userId: "laskdflkajsdf",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
