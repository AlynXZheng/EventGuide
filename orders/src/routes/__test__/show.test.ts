import request from "supertest";
import mongoose from "mongoose";
import { TicketModel } from "../../models/ticket";
import { app } from "../../app";
import jwt from "jsonwebtoken";

const signinUserOne = () => {
  const payload = { id: "randomfakeid1", email: "test1@test.com" };
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};

const signinUserTwo = () => {
  const payload = { id: "randomfakeid2", email: "test2@test.com" };
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};

it("can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("fetches the order", async () => {
  // Create a ticket
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const user = signinUserOne();

  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  // Create a ticket
  const ticket = await TicketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  const user = signinUserOne();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", signinUserTwo())
    .send()
    .expect(401);
});
