import { Redirect } from "react-router-dom";
import { useIsAuthenticated } from "../../features/auth/model/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};
