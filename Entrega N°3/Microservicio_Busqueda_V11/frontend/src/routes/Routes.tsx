import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./Loadable";

/* ***Layouts**** */
const BlankLayout = Loadable(
  lazy(() => import("../layouts/blank-layout/BlankLayout"))
);
const AuthLayout = Loadable(lazy(() => import("../layouts/auth/AuthLayout")));

/* ***End Layouts**** */
const Error = Loadable(lazy(() => import("../views/authentication/Error")));

/* ****Pages***** */
const Home = Loadable(lazy(() => import("../views/home/Home")));
const ProductDetail = Loadable(lazy(() => import("../views/product/ProductDetail")));
const Login = Loadable(lazy(() => import("../views/authentication/Login")));
const Register = Loadable(
  lazy(() => import("../views/authentication/Register"))
);
const ResetPass = Loadable(
  lazy(() => import("../views/authentication/ResetPass"))
);

/* ****End Pages***** */

const Router = [
  {
    path: "/error",
    element: <BlankLayout />,
    children: [{ path: "404", element: <Error /> }],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "", exact: true, element: <Navigate to="/auth/login" /> },
      { path: "login", exact: true, element: <Login /> },
      {
        path: "register",
        exact: true,
        element: <Register />,
      },
      {
        path: "forgot-password",
        exact: true,
        element: <ResetPass />,
      },

      { path: "*", element: <Navigate to="/error/404" /> },
      { path: "404", exact: true, element: <Error /> },
    ],
  },
  {
    path: "/producto",
    element: <BlankLayout />,
    children: [
      {
        path: ":id",
        element: <ProductDetail />,
      },
    ],
  },
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      {
        path: "",
        exact: true,
        element: <Home />,
      },
      {
        path: "home",
        exact: true,
        element: <Home />,
      },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
  {
    path: "/error",
    element: <BlankLayout />,
    children: [
      { path: "*", element: <Navigate to="/error/404" /> },
      { path: "404", exact: true, element: <Error /> },
    ],
  },
];

export default Router;
