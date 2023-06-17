import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@tourguide/common";
import { TicketModel } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = "orders-service";

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await TicketModel.findByEvent(data);

    if (!ticket) {
      throw new Error("Ticket not found, Events are out of order!");
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
