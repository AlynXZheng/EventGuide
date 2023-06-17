import { useState } from "react";
import Router from "next/router";
import axios from "axios";
import useRequest from "../../hooks/use-request";
import BaseLayout from "../../components/BaseLayout";

const NewTicket = ({ currentUser }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = (event) => {
    event.preventDefault();

    doRequest();
  };

  //When a Blur event is triggered, round the price input to cents
  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <BaseLayout currentUser={currentUser}>
      <div>
        <h1 className="mx-auto max-w-screen-md text-3xl py-4">
          Create a Ticket
        </h1>
        <form className="mx-auto max-w-screen-md" onSubmit={onSubmit}>
          <div className="mb-4 form-group">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-4 form-group">
            <label>Price</label>
            <input
              value={price}
              onBlur={onBlur}
              onChange={(e) => setPrice(e.target.value)}
              className="form-control"
            />
          </div>
          {errors}
          <button className="btn primary-button">Submit</button>
        </form>
      </div>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const currentUser = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
    { headers: context.req.headers }
  );

  return { props: { currentUser: currentUser.data } };
};

export default NewTicket;
