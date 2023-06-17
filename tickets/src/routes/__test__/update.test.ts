import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { natsWrapper } from "../../nats-wrapper";
import { TicketModel } from "../../models/ticket";

const signin = () => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

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

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "aslkdfj",
      price: 20,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "aslkdfj",
      price: 20,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "asldkfj",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin())
    .send({
      title: "alskdjflskjdf",
      price: 1000,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asldkfj",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "alskdfjj",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asldkfj",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("new title");
  expect(ticketResponse.body.price).toEqual(100);
});

it("publishes an event", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asldkfj",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asldkfj",
      price: 20,
    });

  const ticket = await TicketModel.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(400);
});
