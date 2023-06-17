import { Publisher, OrderCreatedEvent, Subjects } from "@tourguide/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
