import express, { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@tourguide/common";
import { TicketModel } from "../models/ticket";
import { Types as MongooseTypes } from "mongoose";
import { param } from "express-validator";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId"),
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await TicketModel.findById(req.params.id);

    if (!ticket) {
      return next(new NotFoundError());
    }

    res.status(200).send(ticket);
  }
);

export { router as showTicketRouter };
