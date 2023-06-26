import Router from "next/router";
import Link from "next/link";
import BaseLayout from "../../components/BaseLayout";
import useRequest from "../../hooks/use-request";
import axios from "axios";

const TicketShow = ({ ticket, currentUser }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderId]", `/orders/${order.id}`),
  });

  return (
    <BaseLayout title={ticket.title} currentUser={currentUser}>
      <div className="py-2">
        <Link href="/">back to tickets</Link>
      </div>

      <div className="grid md:grid-cols-4 md:gap-3">
        <div className="md:col-span-2">
          <img
            src="/images/expo.jpg"
            alt={ticket.title}
            width={640}
            height={640}
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
          ></img>
        </div>
        <div>
          <ul>
            <li>
              <h1 className="text-lg">{ticket.title}</h1>
            </li>
            <li>Description:</li>
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div>Price</div>
              <div>${ticket.price}</div>
            </div>
            {errors}
            <button
              className="primary-button w-full"
              onClick={() => doRequest()}
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const { ticketId } = context.query;

  const currentUser = await axios.get(
    "http://www.eventguide.shop/api/users/currentuser",
    { headers: context.req.headers }
  );

  const { data } = await axios.get(
    `http://www.eventguide.shop/api/tickets/${ticketId}`,
    { headers: context.req.headers }
  );

  return { props: { ticket: data, currentUser: currentUser.data } };
};

// export const getServerSideProps = async (context) => {
//   const { ticketId } = context.query;

//   const currentUser = await axios.get(
//     "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//     { headers: context.req.headers }
//   );

//   const { data } = await axios.get(
//     `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/tickets/${ticketId}`,
//     { headers: context.req.headers }
//   );

//   return { props: { ticket: data, currentUser: currentUser.data } };
// };

export default TicketShow;
