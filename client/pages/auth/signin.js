import { useState } from "react";
import Router from "next/router";
import axios from "axios";
import useRequest from "../../hooks/use-request";
import BaseLayout from "../../components/BaseLayout";

const Signin = ({ currentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <BaseLayout title="Sign In" currentUser={currentUser}>
      <form className="mx-auto max-w-screen-md" onSubmit={onSubmit}>
        <h1 className="mb-4 text-xl">Sign In</h1>
        <div className="mb-4 form-group">
          <label>Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-4 form-group">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
        </div>
        {errors}
        <div className="mb-4 ">
          <button className="btn primary-button">Sign In</button>
        </div>
      </form>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const currentUser = await axios.get(
    "http://www.eventguide.shop/api/users/currentuser",
    { headers: context.req.headers }
  );

  return { props: { currentUser: currentUser.data } };
};

// export const getServerSideProps = async (context) => {
//   const currentUser = await axios.get(
//     "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//     { headers: context.req.headers }
//   );

//   return { props: { currentUser: currentUser.data } };
// };

export default Signin;
