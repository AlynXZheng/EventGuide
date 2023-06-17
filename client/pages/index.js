import axios from "axios";
import buildClient from "../api/build-client";
import BaseLayout from "../components/BaseLayout";
import TicketItem from "../components/TicketItem";

const LandingPage = ({ currentUser, tickets }) => {
  // const ticketList = tickets.map((ticket) => {
  //   return (
  //     <tr key={ticket.id}>
  //       <td>{ticket.title}</td>
  //       <td>{ticket.price}</td>
  //     </tr>
  //   );
  // });

  return (
    <BaseLayout title="Home Page" currentUser={currentUser}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {tickets.map((ticket) => (
          <TicketItem ticket={ticket} key={ticket.id}></TicketItem>
        ))}
      </div>
    </BaseLayout>
  );
};

// const LandingPage = ({ currentUser, tickets }) => {
//   const ticketList = tickets.map((ticket) => {
//     return (
//       <tr key={ticket.id}>
//         <td>{ticket.title}</td>
//         <td>{ticket.price}</td>
//       </tr>
//     );
//   });

//   return (
//     <BaseLayout title="Home Page" currentUser={currentUser}>
//       <div>
//         <h1>Tickets</h1>
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Title</th>
//               <th>Price</th>
//             </tr>
//           </thead>
//           <tbody>{ticketList}</tbody>
//         </table>
//       </div>
//     </BaseLayout>
//   );
// };

export const getServerSideProps = async ({ req }) => {
  //const { data } = await buildClient(context).get("/api/users/currentuser");

  const currentUser = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
    { headers: req.headers }
  );

  const tickets = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/tickets",
    { headers: req.headers }
  );

  return { props: { currentUser: currentUser.data, tickets: tickets.data } };
};

export default LandingPage;

// const LandingPage = ({ currentUser}) => {
//   return (
//     <BaseLayout currentUser={currentUser}>
//       {currentUser ? (
//         <h1>You are signed in</h1>
//       ) : (
//         <h1>You are not signed in</h1>
//       )}
//     </BaseLayout>
//   );
// };

// export const getServerSideProps = async ({ req }) => {
//   //const { data } = await buildClient(context).get("/api/users/currentuser");

//   const { data } = await axios.get(
//     "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//     { headers: req.headers }
//   );

//   return { props: data };
// };
