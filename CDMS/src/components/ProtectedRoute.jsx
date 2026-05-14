import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const role = sessionStorage.getItem("role");

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin/customer" replace />;
  }

  return children;
}
