import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting up.....");
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is undefined");
  }

  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connection successful"));
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
