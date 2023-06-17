import request from "supertest";
import { app } from "../../app";
import jwt from "jsonwebtoken";

jest.mock("../../nats-wrapper");

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

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", signin()).send({
    title: "asldkf",
    price: 20,
  });
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
