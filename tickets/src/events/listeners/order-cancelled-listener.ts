import { Listener, OrderCancelledEvent, Subjects } from "@tourguide/common";
import { Message } from "node-nats-streaming";
import { TicketModel } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = "tickets-service";

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await TicketModel.findById(data.ticket.id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    //unreserve the ticket
    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });

    msg.ack();
  }
}
