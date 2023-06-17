import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.css";

// const AppComponent = ({ Component, pageProps }) => {
//   return (
//     <>
//       <Navbar />
//       <Component {...pageProps} />
//     </>
//   );
// };

const AppComponent = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default AppComponent;
