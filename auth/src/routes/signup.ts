import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@tourguide/common";
import { UserModel } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new BadRequestError("Email in use"));
    }

    const user = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!
    );

    //Store the JWT on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
