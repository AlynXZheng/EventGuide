import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.mock("../nats-wrapper");

process.env.STRIPE_SECRET =
  "sk_test_51NF367IAXNGkHbcjmlkodlEFVodfd0EwGQ6PEOgkA5xGsNwiv21A8rgDmGp06XmGRTqPySv3jk9FAxgsaqGpgfSu00imJgDyil";

let mongo: any;
beforeAll(async () => {
  process.env.JWT_SECRET = "observer-is-listening";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
