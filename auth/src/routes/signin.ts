import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/user";
import { validateRequest, BadRequestError } from "@tourguide/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    //Check if user exists && password is correct
    const user = await UserModel.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(user.password, password))) {
      return next(new BadRequestError("Incorrect email or password"));
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
