import { Publisher, Subjects, TicketUpdatedEvent } from "@tourguide/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
