import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@tourguide/common";
import { orderModel } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = "payments-service";

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const { id, ticket, status, userId, version } = data;

    const order = await orderModel.create({
      _id: id,
      price: ticket.price,
      status,
      userId,
      version,
    });

    msg.ack();
  }
}
