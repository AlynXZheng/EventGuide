import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from "@tourguide/common";
import { stripe } from "../stripe";
import { orderModel } from "../models/order";
import { paymentModel } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, orderId } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return next(new NotFoundError());
    }

    //If a user is trying to pay for an order not belonging to him, reports error
    if (order.userId !== req.currentUser!.id) {
      return next(new NotAuthorizedError());
    }

    if (order.status === OrderStatus.Cancelled) {
      console.log("Im HERREEEEEEEEEEEEEEEEEEEEEEE!");
      return next(new BadRequestError("Cannot pay for an cancelled order"));
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100, //cents
      source: token,
    });

    const payment = await paymentModel.create({
      orderId,
      stripeId: charge.id,
    });

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
