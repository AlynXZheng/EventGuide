import Navbar from "./Navbar";
import Head from "next/head";

// webpages passes the currentUser to Baselayout which in turn passes to the NavBar
//Each webpage also passes themselves as a prop called "children" into BaseLayout
const BaseLayout = ({ title, children, currentUser }) => {
  return (
    <>
      <Head>
        <title>{title ? title + " - EventGuide" : "EventGuide"}</title>
        <meta name="description" content="Ecommerce Website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col justify-between ">
        <header>
          <Navbar currentUser={currentUser} />
        </header>

        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-10 justify-center items-center shadow-inner">
          <p>Copyright © 2022 EventGuide</p>
        </footer>
      </div>
    </>
  );
};

// export const getServerSideProps = async (context) => {
//   const currentUser = await axios.get(
//     "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//     { headers: context.req.headers }
//   );

//   console.log("INSIDE baselayout!");
//   return { props: { currentUser: currentUser.data } };
// };

export default BaseLayout;
