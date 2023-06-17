import { Publisher, Subjects, TicketCreatedEvent } from "@tourguide/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
