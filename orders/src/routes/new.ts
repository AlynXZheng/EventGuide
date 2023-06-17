import mongoose from "mongoose";
import express, { NextFunction, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
} from "@tourguide/common";
import { body } from "express-validator";
import { TicketModel } from "../models/ticket";
import { OrderModel } from "../models/order";
import { OrderStatus } from "@tourguide/common";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60; //15 minutes

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.body;

    //1. Find the ticket the user is trying to order in the database
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      return next(new NotFoundError());
    }

    //2. Make sure that this ticket is not already reserved
    // Run query to look at all orders.  Find an order where the ticket
    // is the ticket we just found *and* the orders status is *not* cancelled.
    // If we find an order from that means the ticket *is* reserved already
    // so an order cannot be created for that ticket
    const isReserved = await ticket.isReserved();

    if (isReserved) {
      return next(new BadRequestError("Ticket is already reserved"));
    }

    //3. Set a 15 minutes expiration for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    //4. create the order and save it to the database
    const order = await OrderModel.create({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });

    //5. Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
