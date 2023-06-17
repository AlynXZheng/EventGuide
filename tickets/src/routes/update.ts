import express, { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from "@tourguide/common";
import { TicketModel } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId"),
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await TicketModel.findById(req.params.id);

    if (!ticket) {
      return next(new NotFoundError());
    }

    //If a ticket is reserved, no updating is allowed.
    if (ticket.orderId) {
      return next(new BadRequestError("Cannot edit a reserved ticket"));
    }

    if (ticket.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
