import axios from "axios";
import BaseLayout from "../../components/BaseLayout";

// const OrderIndex = ({ orders, currentUser }) => {
//   return (
//     <BaseLayout currentUser={currentUser}>
//       <h1 className="mb-4 text-xl">Order History</h1>
//       <ul>
//         {orders.map((order) => {
//           return (
//             <li key={order.id}>
//               {order.ticket.title} - {order.status}
//             </li>
//           );
//         })}
//       </ul>
//     </BaseLayout>
//   );
// };

const OrderIndex = ({ orders, currentUser }) => {
  return (
    <BaseLayout currentUser={currentUser}>
      <h1 className="mb-4 text-xl">Order History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b">
            <tr>
              <th className="px-3 text-left">TITLE</th>
              <th className="p-3 text-left">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className=" p-3 ">{order.ticket.title}</td>
                <td className=" p-3 ">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const { data } = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/orders",
    { headers: context.req.headers }
  );

  const currentUser = await axios.get(
    "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
    { headers: context.req.headers }
  );

  return { props: { orders: data, currentUser: currentUser.data } };
};

export default OrderIndex;
