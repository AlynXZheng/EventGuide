import Link from "next/link";
import React from "react";
import Router from "next/router";

export default function TicketItem({ ticket }) {
  return (
    <div className="card">
      <Link href={``}>
        <img
          src="/images/expo.jpg"
          alt={ticket.name}
          className="rounded shadow object-cover h-64 w-full"
        />
      </Link>
      <div className="flex flex-col items-center justify-center p-5">
        <Link href={``}>
          <h2 className="text-lg">{ticket.title}</h2>
        </Link>
        <p className="p-2">${ticket.price}</p>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
          <button
            className="primary-button"
            type="button"
            // onClick={() => Router.push("/tickets/[ticketId]")}
          >
            Details
          </button>
        </Link>
      </div>
    </div>
  );
}
