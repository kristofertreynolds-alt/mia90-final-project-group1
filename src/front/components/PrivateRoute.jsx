import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const PrivateRoute = ({ children }) => {
  const { store } = useGlobalReducer();
  const token = store.token || sessionStorage.getItem("token");
  
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute;