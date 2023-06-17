import express, { NextFunction, Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@tourguide/common";
import { OrderStatus } from "@tourguide/common";
import { OrderModel } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await OrderModel.findById(orderId).populate("ticket");

    if (!order) {
      return next(new NotFoundError());
    }
    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled!
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
