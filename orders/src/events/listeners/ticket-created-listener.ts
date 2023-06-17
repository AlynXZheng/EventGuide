import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@tourguide/common";
import { TicketModel } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "orders-service";

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const ticket = await TicketModel.create({
      _id: id,
      title,
      price,
    });

    msg.ack();
  }
}
