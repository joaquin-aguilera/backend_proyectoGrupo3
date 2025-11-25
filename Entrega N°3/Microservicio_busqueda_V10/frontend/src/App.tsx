import React from "react";
import { useRoutes } from "react-router-dom";
import Router from "./routes/Routes";

const App: React.FC = () => {
  const routing = useRoutes(Router);
  return <>{routing}</>;
};

export default App;

