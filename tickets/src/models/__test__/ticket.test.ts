import { TicketModel } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket and Save the ticket to the database
  const ticket = await TicketModel.create({
    title: "concert",
    price: 5,
    userId: "123",
  });

  // fetch the same ticket twice
  const firstInstance = await TicketModel.findById(ticket.id);
  const secondInstance = await TicketModel.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  await expect(secondInstance!.save()).rejects.toThrow();
});

it("increments the version number on multiple saves", async () => {
  const ticket = await TicketModel.create({
    title: "concert",
    price: 20,
    userId: "123",
  });

  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
