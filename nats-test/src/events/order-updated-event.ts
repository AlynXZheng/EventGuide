import { Subjects } from "./subjects";

export interface OrderUpdatedEvent {
  subject: Subjects.OrderUpdated;
  data: {
    id: string;
    userId: string;
    ticketId: string;
  };
}
