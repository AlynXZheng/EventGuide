import { useEffect, useState } from "react";
import BaseLayout from "../../components/BaseLayout";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    //Run findTimeLeft function immediately so the timer shows up immediately
    findTimeLeft();

    //Run the findTimeLeft function every 1s
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      //kill the timer when we navigate away from this page
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return (
      <BaseLayout currentUser={currentUser}>
        <div>Order Expired</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout currentUser={currentUser}>
      <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout
          token={({ id }) => doRequest({ token: id })}
          stripeKey="pk_test_51NF367IAXNGkHbcjPb2qKupbWR50Rh1OuC2YNU35LnYbU0IraHLAUFlq4HJ0heiuJ5hweHgoteLywo7FeMlmjZZ500HNui4aCF"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
        {errors}
      </div>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const { orderId } = context.query;

  const { data } = await axios.get(
    `http://www.eventguide.shop/api/orders/${orderId}`,
    { headers: context.req.headers }
  );

  const currentUser = await axios.get(
    "http://www.eventguide.shop/api/users/currentuser",
    { headers: context.req.headers }
  );

  return { props: { order: data, currentUser: currentUser.data } };
};

// export const getServerSideProps = async (context) => {
//   const { orderId } = context.query;

//   const { data } = await axios.get(
//     `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/orders/${orderId}`,
//     { headers: context.req.headers }
//   );

//   const currentUser = await axios.get(
//     "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//     { headers: context.req.headers }
//   );

//   return { props: { order: data, currentUser: currentUser.data } };
// };

export default OrderShow;
