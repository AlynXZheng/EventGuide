import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@tourguide/common";
import { Message } from "node-nats-streaming";
import { OrderModel } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = "orders-service";

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await OrderModel.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
