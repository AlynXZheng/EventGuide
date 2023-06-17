import { Subjects, Publisher, OrderCancelledEvent } from "@tourguide/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
