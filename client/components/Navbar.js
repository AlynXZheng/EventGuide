import Link from "next/link";
import NavItem from "./NavItem";
const Navbar = ({ currentUser }) => {
  //currentUser is an object, so !currentUser == false. Object.values(currentUser) is an array, so !Object.values(currentUser) == false.
  const links = [
    !Object.values(currentUser)[0] && {
      label: "Sign Up",
      href: "/auth/signup",
    },
    !Object.values(currentUser)[0] && {
      label: "Sign In",
      href: "/auth/signin",
    },
    Object.values(currentUser)[0] && {
      label: "Sell Tickets",
      href: "/tickets/new",
    },
    Object.values(currentUser)[0] && { label: "My Orders", href: "/orders" },
    Object.values(currentUser)[0] && {
      label: "Sign Out",
      href: "/auth/signout",
    },
  ]
    .filter(Boolean)
    .map(({ label, href }) => {
      return (
        <li key={href} className="nav-item inline-block px-3 font-bold text-xl">
          <Link href={href} className="nav-link">
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className="flex h-20 items-center px-10 justify-between shadow-md">
      <Link href={"/"}>
        <h1 className="text-4xl font-bold logo">EventGuide</h1>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

export default Navbar;

// import Link from "next/link";
// import React, { useState } from "react";
// import NavItem from "./NavItem";

// const Navbar = ({ currentUser }) => {
//   const [navActive, setNavActive] = useState(null);
//   const [activeIdx, setActiveIdx] = useState(-1);

//   const links = [
//     !currentUser && { label: "Sign Up", href: "/auth/signup" },
//     !currentUser && { label: "Sign In", href: "/auth/signin" },
//     currentUser && { label: "Sell Tickets", href: "/tickets/new" },
//     currentUser && { label: "My Orders", href: "/orders" },
//     currentUser && { label: "Sign Out", href: "/auth/signout" },
//   ]
//     .filter((linkConfig) => linkConfig)
//     .map(({ label, href }) => {
//       return (
//         <li
//           onClick={() => {
//             setActiveIdx(idx);
//             setNavActive(false);
//           }}
//           key={href}
//           className="nav-item inline-block px-3 font-bold text-xl"
//         >
//           <NavItem active={activeIdx === idx} text={label} href={href} />
//         </li>
//       );
//     });

//   return (
//     <header>
//       <nav className="flex h-20 items-center px-10 justify-between shadow-md">
//         <Link href={"/"}>
//           <h1 className="text-4xl font-bold logo">EventGuide</h1>
//         </Link>
//         <div
//           onClick={() => setNavActive(!navActive)}
//           className={`nav__menu-bar`}
//         >
//           <div></div>
//           <div></div>
//           <div></div>
//         </div>
//         <div className={`${navActive ? "active" : ""} nav__menu-list`}>
//           {links}
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Navbar;
